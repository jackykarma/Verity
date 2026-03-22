# Bitmap 深度解析

> **一句话理解**：Bitmap 是一块 native 内存里的像素数组，Java 对象只是它的"管理员"——管理它的创建、引用和释放，但真正的像素不在 Java 堆。

---

## 1. 内存模型

### 1.1 像素数据存在哪里

Android 各版本的像素存储位置经历了三次变化：

```
Android 2.3 及以前：
  Java 堆  → [Bitmap Java 对象]
  Native 堆 → [像素数据]          ← 需要手动 recycle() 释放

Android 3.0 ~ 7.x：
  Java 堆  → [Bitmap Java 对象 + 像素数据]  ← 统一在 Java 堆，GC 自动管理
                                              但大图会大幅增加 Java 堆压力

Android 8.0 及以后（当前主流）：
  Java 堆  → [Bitmap Java 对象（很小，几十字节）]
  Native 堆 → [像素数据]          ← NativeAllocationRegistry 追踪
                                   Java 对象 GC 时自动释放 native 内存
```

**实际意义**：Android 8+ 的 Bitmap 像素不占 Java 堆，不会触发 Java GC 阈值，但**一样会 OOM**——native 内存耗尽时同样抛 `OutOfMemoryError`。

### 1.2 内存大小计算

```
内存大小 = width × height × 每像素字节数

以一张 1080×1920 的 ARGB_8888 图：
  1080 × 1920 × 4 = 8,294,400 字节 ≈ 7.9 MB

同一张图改为 RGB_565：
  1080 × 1920 × 2 = 4,147,200 字节 ≈ 3.9 MB（节省一半）
```

**注意**：这是像素内存，不包括 Java 对象本身（几十字节可忽略）。

### 1.3 stride（行字节数）

Bitmap 内存并不总是紧密排列，有时每行末尾有对齐填充：

```
width = 100，ARGB_8888（4 字节/像素）
rowBytes（stride）= 400 字节（通常就是 width × bytesPerPixel，无填充）

但当通过 createBitmap 以某些 Matrix 创建时，stride 可能 > width × bytesPerPixel
```

`bitmap.rowBytes` 返回每行实际占用的字节数，遍历原始像素时必须用 `rowBytes` 而不是 `width × 4`。

---

## 2. Bitmap.Config 详解

| Config | 每像素字节 | 通道位深 | 透明度 | 典型用途 |
|--------|----------|---------|--------|---------|
| `ARGB_8888` | 4 | A/R/G/B 各 8 bit | 支持 | 默认，色彩最丰富 |
| `RGB_565` | 2 | R:5 G:6 B:5 | 不支持 | 节省内存，无透明需求的场景 |
| `ALPHA_8` | 1 | 只有 Alpha | 仅透明通道 | 遮罩、文字阴影 |
| `RGBA_F16` | 8 | 各通道 16bit 浮点 | 支持 | HDR / 宽色域 |
| `HARDWARE` | 由驱动决定 | — | 支持 | 像素存在 GPU 显存，只读，不可修改 |

**HARDWARE Config 的特殊性**：

```kotlin
// HARDWARE Bitmap：像素在 GPU 显存
// ✅ 适合：只读展示，setImageBitmap 直接给 ImageView（零拷贝上屏）
// ❌ 不能：getPixel()、Canvas(bitmap)、copyPixelsToBuffer()
//           因为 CPU 无法直接访问 GPU 显存

// 如果需要修改 HARDWARE Bitmap，先复制到软件 Bitmap：
val softBitmap = hardwareBitmap.copy(Bitmap.Config.ARGB_8888, true)
```

---

## 3. BitmapFactory 解码全流程

### 3.1 调用链

```
BitmapFactory.decodeResource(resources, resId)
  ↓
Resources.openRawResource(resId)       // 从 APK ZIP 包打开 InputStream
  ↓
BitmapFactory.decodeResourceStream()
  ↓
BitmapFactory.decodeStream(inputStream, null, options)
  ↓
native nativeDecodeStream()            // JNI 进入 C++ 层
  ↓
Skia SkCodec::MakeFromStream()         // 识别格式，选择解码器
  ↓
SkCodec::getPixels()                   // 流式解码，直接写入目标内存
```

### 3.2 格式识别（magic bytes）

```
文件头前几字节决定使用哪个解码器：

FF D8 FF              → JPEG  → libjpeg-turbo
89 50 4E 47 0D 0A     → PNG   → libpng / zlib
52 49 46 46 xx xx xx xx 57 45 42 50 → WebP → libwebp
47 49 46 38           → GIF   → libgif（Android 限制，只取第一帧）
```

### 3.3 JPEG 解码路径

```
读 Huffman 编码的 DCT 系数
  ↓
反 Huffman 解码 → 量化系数
  ↓
反量化（乘以量化矩阵）→ DCT 系数
  ↓
反 DCT（8×8 块）→ YCbCr 空间的像素值
  ↓
YCbCr → RGB 色彩空间转换
  ↓
写入 Bitmap native 内存
```

`inSampleSize` 对 JPEG 特别高效：可以在反 DCT 阶段直接输出降采样结果，不需要先解码全图再缩放。

### 3.4 PNG 解码路径

```
读 IHDR chunk（宽高、位深、颜色类型）
  ↓
IDAT chunk 数据 → zlib 解压（DEFLATE 算法）
  ↓
还原扫描行 filter（每行第一字节是 filter 类型）：
  0 = None（不变）
  1 = Sub（与左侧像素的差值）
  2 = Up（与上方像素的差值）
  3 = Average（左 + 上的平均）
  4 = Paeth（预测算法）
  ↓
写入 Bitmap native 内存
```

### 3.5 BitmapFactory.Options 关键参数

```kotlin
val options = BitmapFactory.Options().apply {

    // 只读取图片尺寸，不分配像素内存（用于预判内存）
    inJustDecodeBounds = true
    BitmapFactory.decodeResource(resources, resId, this)
    val srcWidth = outWidth    // 原始宽度
    val srcHeight = outHeight  // 原始高度

    // 降采样因子：2 = 宽高各缩小 2 倍，内存缩小 4 倍
    // 只接受 2 的幂次（1, 2, 4, 8, 16...）
    inJustDecodeBounds = false
    inSampleSize = calculateSampleSize(srcWidth, srcHeight, targetWidth, targetHeight)

    // 目标像素格式
    inPreferredConfig = Bitmap.Config.RGB_565  // 节省一半内存（无透明需求时）

    // 复用已有 Bitmap 内存，跳过 malloc（详见 §5）
    inBitmap = poolBitmap

    // 解码结果是否可修改
    inMutable = true

    // 是否预乘 Alpha（默认 true，与 Canvas 渲染预期一致）
    inPremultiplied = true
}
```

**calculateSampleSize 的标准写法**：

```kotlin
fun calculateSampleSize(srcW: Int, srcH: Int, targetW: Int, targetH: Int): Int {
    var sampleSize = 1
    if (srcH > targetH || srcW > targetW) {
        val halfH = srcH / 2
        val halfW = srcW / 2
        while (halfH / sampleSize >= targetH && halfW / sampleSize >= targetW) {
            sampleSize *= 2
        }
    }
    return sampleSize
}
```

---

## 4. Bitmap 的生命周期与内存管理

### 4.1 Android 8+ 的自动释放机制

```
Java 对象被 GC → NativeAllocationRegistry 的 Cleaner 触发
  → 调用 native Bitmap_destruct()
  → free() 释放 native 像素内存

开发者不需要手动调用 recycle()（但调用了也没有害处）
```

### 4.2 recycle() 做了什么

```kotlin
bitmap.recycle()
// 1. 释放 native 像素内存（立刻，不等 GC）
// 2. 标记 Java 对象为 recycled 状态
// 3. 之后对该对象调用任何方法都抛 IllegalStateException

bitmap.isRecycled  // true
```

**什么时候需要手动 recycle()**：
- Android 2.3 及以前：必须手动调用（native 内存不跟 GC 联动）
- Android 8+：通常不需要，但在确定某张大 Bitmap 不再使用时提前调用可以更快释放内存

### 4.3 Bitmap 被 GC 后像素立刻消失吗？

```
Java 对象没有强引用 → 进入待 GC 状态
  → GC 执行时回收 Java 对象
  → NativeAllocationRegistry Cleaner 被调用
  → native 内存释放

这个过程是异步的，Java 对象消失后 native 内存不是立刻释放。
但 NativeAllocationRegistry 的设计会把 native 内存大小"告知" GC，
让 GC 更积极地触发，避免 native 内存堆积。
```

---

## 5. inBitmap 与 BitmapPool

### 5.1 inBitmap 的本质

把已有 Bitmap 的 native 内存指针交给 Skia，解码器直接写入，跳过 malloc：

```
正常解码：  malloc → 解码写入 → 返回新对象
inBitmap：  取已有内存指针 → 解码写入 → 返回同一对象（同一 Java 对象，同一内存）
```

约束：已有 Bitmap 必须 mutable，且 `allocationByteCount >= 新图所需字节数`（Android 4.4+）。

### 5.2 byteCount vs allocationByteCount

```kotlin
// 复用一块 120KB 的内存（原来 300×100）解码 150×150 的图（需 90KB）

bitmap.byteCount            // 90000  — 当前图片逻辑大小
bitmap.allocationByteCount  // 120000 — native 实际分配（复用时不缩小）
```

多出来的 30KB 仍然分配但不使用。BitmapPool 用 `allocationByteCount` 做容量匹配。

### 5.3 BitmapPool 工作模式（以 Glide 为例）

```
图片不再使用时 → 不 recycle，而是放回 pool：
  LruBitmapPool.put(bitmap)
    → 按 width × height × Config 分组存储
    → 超出 pool 大小上限时，LRU 淘汰最久未用的

需要新 Bitmap 时 → 先查 pool：
  LruBitmapPool.get(width, height, config)
    → 找到满足条件的 → inBitmap 复用
    → 没有 → 正常解码，分配新内存
```

---

## 6. 大图加载策略

### 6.1 分级降采样

```kotlin
// 第一步：只读尺寸（零内存开销）
val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
BitmapFactory.decodeResource(resources, resId, bounds)

// 第二步：计算 inSampleSize，让解码后尺寸刚好适配目标 View
val sampleSize = calculateSampleSize(bounds.outWidth, bounds.outHeight, viewW, viewH)

// 第三步：真正解码
val opts = BitmapFactory.Options().apply { inSampleSize = sampleSize }
val bitmap = BitmapFactory.decodeResource(resources, resId, opts)
```

### 6.2 区域解码（BitmapRegionDecoder）

只解码图片的一个矩形区域，适合超大图（地图、长截图）：

```kotlin
val decoder = BitmapRegionDecoder.newInstance(inputStream, false)

// 只解码 (100,100)~(400,400) 区域，其他部分不进内存
val region = Rect(100, 100, 400, 400)
val opts = BitmapFactory.Options().apply { inSampleSize = 1 }
val regionBitmap = decoder.decodeRegion(region, opts)

decoder.recycle()
```

支持格式：JPEG、PNG（部分版本）、WebP。**不支持**：GIF、硬件加速纹理格式。

### 6.3 JPEG 的渐进式解码

#### 两种 JPEG 编码格式的区别

JPEG 有两种编码方式，决定了数据在文件中的排列顺序：

```
Baseline JPEG（顺序编码，SOF0 标记）：
  数据从上到下、逐行存储，每个 8×8 DCT 块完整编码后才存下一块
  加载时：从上往下逐行出现 ────────────────┐
                                           ▼ 先看到顶部，等整个文件传完才看到底部

Progressive JPEG（渐进式编码，SOF2 标记）：
  同一图片分多个"扫描（Scan）"存储，每个扫描覆盖整张图：
    Scan 1：所有 8×8 块的 DC 系数（图像的低频概貌）→ 全图模糊预览
    Scan 2：AC 系数第 1~2 档 → 略微清晰
    Scan 3~N：更多 AC 系数 → 逐渐提升细节
  加载时：先看到全图的模糊版，随着数据增多逐渐变清晰
```

文件体积方面，Progressive JPEG 通常比同质量 Baseline JPEG **小 2~10%**（更高效的熵编码）；但解码时需要在内存中保留所有 Scan 数据，内存消耗略高。

如何从文件头判断是哪种格式：

```kotlin
fun isProgressiveJpeg(stream: InputStream): Boolean {
    val bytes = stream.readBytes()
    var i = 0
    while (i < bytes.size - 3) {
        if (bytes[i] == 0xFF.toByte()) {
            when (bytes[i + 1].toInt() and 0xFF) {
                0xC0 -> return false  // SOF0 = Baseline
                0xC2 -> return true   // SOF2 = Progressive
                else -> {
                    // 跳过这个 marker 的数据段
                    val len = ((bytes[i+2].toInt() and 0xFF) shl 8) or
                               (bytes[i+3].toInt() and 0xFF)
                    i += len + 2
                    continue
                }
            }
        }
        i++
    }
    return false
}
```

#### 为什么 BitmapFactory 不能渐进式展示

`BitmapFactory.decodeStream()` 是**同步 API**——它阻塞直到全部 Scan 数据读完，返回最终 Bitmap。即使底层 libjpeg-turbo 是按 Scan 处理的，Java 层也拿不到中间结果：

```
Progressive JPEG 文件传输过程：
  收到 Scan1（模糊全图）→ libjpeg-turbo 解码 ─┐
  收到 Scan2（略清晰）  → libjpeg-turbo 解码   │  nativeDecodeStream() 继续等待
  ...                                           │
  收到 ScanN（最终图）  → libjpeg-turbo 解码 ─┘→ 返回给 Java 层

Java 层只看到最后这一次返回，中间状态无法感知
```

#### 方案一：模拟渐进式（低分辨率先显示，再替换高清）

不使用 JPEG 的 Scan 机制，而是手动两步加载：

```kotlin
fun loadSimulatedProgressive(path: String, imageView: ImageView) {
    lifecycleScope.launch {
        // 第一步：快速解码低分辨率预览（inSampleSize = 8，内存缩小 64 倍）
        val preview = withContext(Dispatchers.IO) {
            BitmapFactory.decodeFile(path, BitmapFactory.Options().apply {
                inSampleSize = 8
            })
        }
        imageView.setImageBitmap(preview)  // 立刻展示模糊版

        // 第二步：解码全分辨率（在后台进行，不阻塞 UI）
        val full = withContext(Dispatchers.IO) {
            BitmapFactory.decodeFile(path, BitmapFactory.Options())
        }
        // 平滑过渡，避免突然替换的闪烁
        imageView.animate().alpha(0f).setDuration(100).withEndAction {
            imageView.setImageBitmap(full)
            imageView.animate().alpha(1f).setDuration(200).start()
            preview.recycle()
        }.start()
    }
}
```

#### 方案二：Fresco 的真正渐进式支持

Facebook 的 Fresco 是 Android 上**唯一原生支持真正渐进式 JPEG 展示**的主流图片库。它用自定义的流式解码管线，边接收 Scan 数据边刷新 UI：

```
Fresco 渐进式解码管线：

网络流 → ImagePipeline → ProgressiveJpegParser
                              │
                              ├─ 检测到新 Scan 完整 → 触发解码
                              │    → 生成当前质量的 Bitmap
                              │    → 通知 DraweeView 刷新
                              │
                              └─ 所有 Scan 完成 → 最终全质量图
```

```kotlin
// Fresco 配置渐进式解码策略
val progressiveJpegConfig = object : ProgressiveJpegConfig {
    override fun getNextScanNumberToDecode(scanNumber: Int): Int {
        // 每隔 2 个 Scan 解码一次，平衡展示频率与 CPU 消耗
        return scanNumber + 2
    }
    override fun getQualityInfo(scanNumber: Int): QualityInfo {
        // Scan 5 之后认为质量足够好（可以停止继续请求更高质量）
        return ImmutableQualityInfo.of(scanNumber, scanNumber >= 5, false)
    }
}

// 使用
val request = ImageRequestBuilder.newBuilderWithSource(uri)
    .setProgressiveRenderingEnabled(true)
    .build()
Fresco.newDraweeControllerBuilder()
    .setImageRequest(request)
    .setOldController(draweeView.controller)
    .build()
    .also { draweeView.controller = it }
```

Glide / Coil 目前不支持渐进式展示——它们等全部数据到位后才显示图片。

#### 方案三：BitmapRegionDecoder 滑动窗口（超大图场景）

适用于宽幅全景图、长截图等**单张图片远超屏幕的**场景，核心思路是只解码当前可见区域：

```kotlin
class LargeImageView(context: Context) : View(context) {

    private var decoder: BitmapRegionDecoder? = null
    private var srcWidth = 0
    private var srcHeight = 0
    private var currentTile: Bitmap? = null
    private var scrollY = 0

    fun setImage(stream: InputStream) {
        decoder = BitmapRegionDecoder.newInstance(stream, false)
        srcWidth = decoder!!.width
        srcHeight = decoder!!.height
        requestLayout()
        loadVisibleRegion()
    }

    private fun loadVisibleRegion() {
        val decoder = decoder ?: return
        // 计算当前可见区域在原图坐标系中的矩形
        val scaleX = srcWidth.toFloat() / width
        val scaleY = srcHeight.toFloat() / height
        val visibleRect = Rect(
            0,
            (scrollY * scaleY).toInt(),
            srcWidth,
            ((scrollY + height) * scaleY).toInt().coerceAtMost(srcHeight)
        )
        // 只解码可见部分，其余不进内存
        currentTile = decoder.decodeRegion(visibleRect, BitmapFactory.Options())
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        currentTile?.let { canvas.drawBitmap(it, 0f, 0f, null) }
    }

    fun scrollTo(newScrollY: Int) {
        scrollY = newScrollY
        loadVisibleRegion()  // 实际使用应加防抖/异步
    }
}
```

**三种方案对比**：

| 方案 | 是否真正渐进 | 依赖 | 适用场景 |
|------|------------|------|---------|
| 模拟渐进（低清→高清） | 否（两步替换） | 无 | 普通图片加载，改善首屏体验 |
| Fresco 渐进式 | 是（逐 Scan 刷新） | Fresco 库 | 网络大图，需要真正渐进效果 |
| BitmapRegionDecoder 滑动窗口 | 否（分区域加载） | 无 | 单张超大图（全景/长截图） |

---

## 7. Bitmap 操作

### 7.1 像素读写

```kotlin
// 读单个像素（慢，每次跨 JNI）
val color = bitmap.getPixel(x, y)  // 返回 ARGB 打包的 Int

// 批量读（推荐，一次 JNI 调用）
val pixels = IntArray(width * height)
bitmap.getPixels(pixels, 0, width, 0, 0, width, height)

// 批量写
bitmap.setPixels(pixels, 0, width, 0, 0, width, height)

// 最快：通过 ByteBuffer 直接操作 native 内存（零拷贝）
val buffer = ByteBuffer.wrap(ByteArray(bitmap.byteCount))
bitmap.copyPixelsToBuffer(buffer)   // native → ByteBuffer
// ... 修改 buffer ...
bitmap.copyPixelsFromBuffer(buffer) // ByteBuffer → native
```

### 7.2 常用变换

```kotlin
// 创建副本（可变）
val mutable = bitmap.copy(Bitmap.Config.ARGB_8888, true)

// 缩放（生成新 Bitmap，插值）
val scaled = Bitmap.createScaledBitmap(src, newW, newH, true)
// true = 双线性插值（平滑）；false = 最近邻（锯齿/像素风）

// 矩阵变换（旋转、翻转等）生成新 Bitmap
val matrix = Matrix().apply { postRotate(90f) }
val rotated = Bitmap.createBitmap(src, 0, 0, src.width, src.height, matrix, true)

// 提取 Alpha 通道（生成 ALPHA_8 Bitmap）
val mask = bitmap.extractAlpha()

// 裁剪区域
val cropped = Bitmap.createBitmap(src, x, y, width, height)
```

### 7.2.1 createBitmap + Matrix 的工作原理

以 `postRotate(90f)` 旋转一张 100×200 的 Bitmap 为例，分四个阶段：

#### 第一阶段：计算输出尺寸（包围盒）

输出 Bitmap 的宽高不等于源尺寸，需要对源矩形的 4 个顶点应用 Matrix，取结果的最小包围矩形：

```
源 Bitmap 100×200，4 个顶点经过 rotate(90°)：
  (0,   0) →  (0,    0)
  (100, 0) →  (0, -100)
  (100,200) → (200, -100)
  (0,  200) → (200,   0)

包围盒：x ∈ [0, 200]，y ∈ [-100, 0]
输出尺寸：200×100  ← 宽高交换了
```

包围盒左上角在 (0, -100)，需追加 translate(0, +100) 使其对齐原点，最终作用的是组合矩阵：

```
finalMatrix = translate(0, +100) × rotate(90°)

验证：
  源 (100, 0) → rotate → (0, -100) → translate → (0, 0)   ✅ 新图左上角
  源 (0,  200)→ rotate → (200, 0)  → translate → (200,100) ✅ 新图右下角
```

#### 第二阶段：分配新 Bitmap 内存

```
新 Bitmap：200×100，Config 与源相同（ARGB_8888）
内存：200 × 100 × 4 = 80,000 字节，初始化为 0（透明黑）

此刻内存中同时存在：
  源 Bitmap：100×200 = 80KB（不动）
  新 Bitmap：200×100 = 80KB（待写入）
峰值内存 = 两者之和
```

#### 第三阶段：反向映射逐像素填充

创建 `Canvas(newBitmap)` 后，Skia 对每一个**目标像素**执行反向映射，而不是正向推送：

```
为什么用反向映射，不用正向映射？

正向映射（源 → 目标）：
  多个源像素可能映射到同一目标位置（重叠、数据丢失）
  某些目标位置可能没有源像素覆盖（空洞）

反向映射（目标 → 源）：
  对每个目标像素 (dx, dy)，用逆矩阵反查源坐标 (sx, sy)
  保证每个目标像素都有确定的值，不产生空洞
```

对于 rotate(90°) + translate(0,100)，逆变换为：

```
forward:  (sx, sy) → (sy, −sx + 100) = (dx, dy)
inverse:  (dx, dy) → (100 − dy, dx) = (sx, sy)

例：目标像素 (50, 30)
  → 源坐标 = (100 − 30, 50) = (70, 50)
  → 采样源 Bitmap 在 (70, 50) 处的颜色
  → 写入新 Bitmap 的 (50, 30)
```

伪代码：

```
for dy in 0..newHeight:
    for dx in 0..newWidth:
        (sx, sy) = inverseMatrix.map(dx, dy)
        color    = sample(src, sx, sy)          // 采样方式取决于 filter 参数
        newBitmap[dx][dy] = color
```

#### 第四阶段：filter 参数决定采样方式

反向映射得到的源坐标通常是小数（任意角度旋转时），此时有两种处理方式：

```
filter = false（最近邻插值）：
  (sx, sy) = (3.7, 8.2)  →  取 (4, 8) 的颜色，丢弃小数部分
  快，但任意角度旋转时锯齿严重

filter = true（双线性插值）：
  (sx, sy) = (3.7, 8.2)  →  取周围 4 个像素加权混合：

    (3,8)■  (4,8)■
    (3,9)■  (4,9)■

    weight(3,8) = (1−0.7)×(1−0.2) = 0.24
    weight(4,8) =    0.7 ×(1−0.2) = 0.56
    weight(3,9) = (1−0.7)×   0.2  = 0.06
    weight(4,9) =    0.7 ×   0.2  = 0.14

    结果 = 4 个像素颜色的加权平均
  稍慢，但任意角度旋转时边缘更平滑
```

**特殊情况：90°/180°/270° 整数倍旋转时 filter 无效**

```
rotate(90°) 的逆映射 (100−dy, dx)：当 dx、dy 均为整数时，结果也是整数
→ 4 个邻近像素中只有 1 个权重非零，双线性 = 最近邻
→ filter = true / false 结果完全相同
→ Skia 对整数倍旋转有专用优化路径，不走通用采样代码
```

#### 关键结论

| 问题 | 答案 |
|------|------|
| 源 Bitmap 会被修改吗？ | 不会，全程不动 |
| 使用 GPU 吗？ | 不使用，全程 CPU + Skia 软件光栅化 |
| 内存峰值是多少？ | 源 + 目标同时存在，是单张的两倍 |
| 90° 旋转时 filter 有用吗？ | 没用，坐标映射结果已是整数 |
| 任意角度（如 45°）时呢？ | filter=true 必须设，否则锯齿严重 |
| 输出 Config 会变吗？ | 默认与源相同 |

### 7.3 Bitmap 与 Canvas 的联动

```kotlin
// 在 Bitmap 上绘制
val target = Bitmap.createBitmap(200, 200, Bitmap.Config.ARGB_8888)
val canvas = Canvas(target)
canvas.drawBitmap(src, matrix, paint)     // 第一笔：写入 target 内存
canvas.drawCircle(100f, 100f, 50f, paint) // 第二笔：叠加到同一块 target 内存
// target 现在包含合成后的像素
```

**核心结论先说**：两次 draw 操作的是**同一块 target 内存**，后画的叠在前画的上面（Alpha 合成，不是简单覆盖）。

---

#### drawBitmap 内部做了什么

**不创建中间 Bitmap**，直接对 target 内的每个目标像素执行反向映射 + 采样 + 混合：

```
对 target 内每个被 matrix 覆盖到的目标像素 (dx, dy)：

  ① (dx, dy) × inverse(matrix) → 源坐标 (sx, sy)     // 反向映射
  ② sample(src, sx, sy)         → srcColor             // 采样 src 像素
  ③ apply paint.colorFilter     → srcColor'            // 可选颜色变换
  ④ apply paint.alpha           → srcColor''           // 整体透明度
  ⑤ blend(srcColor'', target[dx][dy], xfermode)        // Alpha 合成
       → finalColor
  ⑥ target[dx][dy] = finalColor                        // 写回同一块内存
```

与 `Bitmap.createBitmap(src, matrix)` 的本质区别：

```
Bitmap.createBitmap(src, matrix)：
  → 新分配内存 → 变换后的像素写进去 → 返回新 Bitmap（内存增加）

canvas.drawBitmap(src, matrix, paint)：
  → 无新内存，直接把变换后的 src 像素写入 canvas 绑定的 target
  → 只是绘制操作，不产生任何中间 Bitmap
```

---

#### drawCircle 内部做了什么

圆是矢量描述，Skia 用**扫描线光栅化**把它变成像素：

```
① 确定包围盒：y ∈ [cy−r, cy+r]

② 对每条水平扫描线 y：
     计算圆边界交点：x_left, x_right = cx ± sqrt(r² − (y−cy)²)

③ 对扫描线上每个像素 (x, y)：
     完全在圆内  → alpha = 1.0（全覆盖）
     完全在圆外  → 跳过
     跨越边界    → 按像素面积有多少在圆内计算 alpha（抗锯齿）

④ 用 paint 的颜色/shader 计算 srcColor

⑤ blend(srcColor, target[x][y], SRC_OVER) → target[x][y]  // 同样写回同一块内存
```

抗锯齿（`paint.isAntiAlias = true`）让边界像素有 0~1 的中间 alpha，而不是非黑即白：

```
isAntiAlias = false：   isAntiAlias = true：
  ██████                  ██████
  ████████                ░░████░░
  ██████████    →      ░░████████░░
  ████████                ░░████░░
  ██████                  ██████
  锯齿感明显               边缘平滑（边界像素有部分 alpha）
```

---

#### 叠加规则：SRC_OVER Alpha 合成

两次 draw 默认都用 **SRC_OVER**——后画的像层压在前画的层上面：

```
α_out = α_src + α_dst × (1 − α_src)
C_out = (C_src × α_src + C_dst × α_dst × (1 − α_src)) / α_out
```

三种典型情况：

```
情况 1：src 完全不透明（α_src = 1.0）
  C_out = C_src       ← 完全覆盖底层，看不到下面

情况 2：src 半透明（α_src = 0.5）
  C_out = 两层颜色混合 ← 底层透过来

情况 3：src 完全透明（α_src = 0.0）
  C_out = C_dst       ← 目标完全不变，等于没画
```

---

#### 完整内存状态流转

```
初始：target = [全部透明黑 (0,0,0,0)]

执行 canvas.drawBitmap(src, matrix, paint)：
  src 映射区域：blend(srcColor, 透明黑, SRC_OVER) → srcColor 写入 target
  其余区域：不变

  target 内存此时：
  ┌─────────────────────────────┐
  │  ░░░░░░░░░░░░░░░░░░░░░░░░  │  ← 透明区域
  │  ░░  [ src 图片内容 ]  ░░  │
  │  ░░░░░░░░░░░░░░░░░░░░░░░░  │
  └─────────────────────────────┘

执行 canvas.drawCircle(100, 100, 50, redPaint)：
  圆覆盖区域：blend(红色, 现有target像素, SRC_OVER) → 写回同一 target
  圆以外：不变

  target 内存此时：
  ┌─────────────────────────────┐
  │  ░░░░░░░░░░░░░░░░░░░░░░░░  │
  │  ░░  [ src 图片内容 ]  ░░  │  ← src 仍在
  │  ░░░░░░[ 红色圆形 ]░░░░░░  │  ← 圆叠加在上，不透明处覆盖 src
  └─────────────────────────────┘
```

---

#### 什么情况下才有中间缓冲区

`drawXxx()` 系列**从不**创建中间缓冲区，直接读写 target。只有 `saveLayer()` 会分配离屏缓冲区：

```kotlin
// saveLayer 之后的 draw 写入离屏缓冲区，不是 target
canvas.saveLayer(0f, 0f, 200f, 200f, paint)
canvas.drawBitmap(...)   // → 写入离屏缓冲区
canvas.drawCircle(...)   // → 写入离屏缓冲区
canvas.restore()         // → 将离屏缓冲区按 paint 的 alpha/Xfermode 合并回 target
```

#### 关键结论

| 问题 | 答案 |
|------|------|
| 两次 draw 操作同一块内存吗？ | 是，都是 target 的 native 内存 |
| 后 draw 会完全覆盖前 draw 吗？ | 取决于 alpha：不透明→覆盖，半透明→混合，透明→不变 |
| drawBitmap 产生中间 Bitmap 吗？ | 不产生，直接反向映射写入 target |
| drawCircle 先生成圆 Bitmap 再合并吗？ | 不是，Skia 扫描线光栅化直接写入 target |
| 画的顺序影响结果吗？ | 影响，后画的叠在上面（画家算法） |
| 如何让 draw 写入独立缓冲区？ | 用 `saveLayer()`，代价是分配额外内存 |

---

## 8. 常见 OOM 场景与解决

### 场景 1：加载原始尺寸大图

```kotlin
// ❌ 直接解码 4000×3000 的照片 → 约 46MB
val bitmap = BitmapFactory.decodeFile(path)

// ✅ 先读尺寸，再按需降采样
val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
BitmapFactory.decodeFile(path, bounds)
val opts = BitmapFactory.Options().apply {
    inSampleSize = calculateSampleSize(bounds.outWidth, bounds.outHeight, 800, 600)
}
val bitmap = BitmapFactory.decodeFile(path, opts)
```

### 场景 2：列表滚动频繁创建 Bitmap

```kotlin
// ❌ 每次 onBindViewHolder 都解码新 Bitmap
override fun onBindViewHolder(holder: ViewHolder, position: Int) {
    val bitmap = BitmapFactory.decodeResource(resources, items[position].resId)
    holder.imageView.setImageBitmap(bitmap)
}

// ✅ 使用 Glide / Coil，内部有 BitmapPool + 磁盘缓存
Glide.with(holder.itemView)
    .load(items[position].url)
    .into(holder.imageView)
```

### 场景 3：Bitmap 被 Context / View 持有导致泄漏

```kotlin
// ❌ 静态变量持有 Bitmap（持有 context 引用链）
companion object {
    var cachedBitmap: Bitmap? = null
}

// ✅ 用 WeakReference 或在 onDestroy 置 null
override fun onDestroy() {
    super.onDestroy()
    cachedBitmap?.recycle()
    cachedBitmap = null
}
```

### 场景 4：decode 后忘记处理 EXIF 旋转

```kotlin
// 相机拍的照片可能带 EXIF 旋转信息，decode 后需要旋正
val exif = ExifInterface(path)
val rotation = exif.getAttributeInt(
    ExifInterface.TAG_ORIENTATION,
    ExifInterface.ORIENTATION_NORMAL
)
val matrix = Matrix()
when (rotation) {
    ExifInterface.ORIENTATION_ROTATE_90  -> matrix.postRotate(90f)
    ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
    ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
}
val corrected = Bitmap.createBitmap(bitmap, 0, 0, bitmap.width, bitmap.height, matrix, true)
```

---

## 9. 性能最佳实践

| 场景 | 建议 |
|------|------|
| 展示网络/本地图片 | 用 Glide / Coil，不要手写 BitmapFactory |
| 自定义绘制（onDraw） | Paint / Path 等对象在构造函数初始化，不在 onDraw 里 new |
| 缩略图 | `inSampleSize` 降采样，不要加载原图再缩放 |
| 无透明需求的图片 | `inPreferredConfig = RGB_565`，内存减半 |
| 只读展示 | `inPreferredConfig = HARDWARE`（API 26+），GPU 直接使用，零拷贝 |
| 超大图（地图/长截图） | `BitmapRegionDecoder` 区域解码 |
| 频繁解码同尺寸图片 | `inBitmap` + `BitmapPool` 复用内存 |
| 修改像素 | 批量用 `copyPixelsToBuffer` + `copyPixelsFromBuffer`，避免 `setPixel` 循环 |

---

## 10. 常见误区

| 误区 | 真相 |
|------|------|
| "Bitmap 在 Java 堆，GC 会管" | Android 8+ 像素在 native 堆，不占 Java 堆，但一样会 OOM |
| "recycle() 是必须的" | Android 8+ 不需要，Java 对象 GC 时自动释放 native 内存 |
| "decodeByteArray 的 byte[] 是原始像素" | 是压缩格式文件的字节（JPEG/PNG 文件内容），不是 ARGB |
| "inSampleSize = 3 可以用" | 只接受 2 的幂次（1/2/4/8...），非 2 的幂次会向下取整 |
| "HARDWARE Bitmap 可以用 Canvas 绘制" | 不能，GPU 显存不可 CPU 写入，需先 copy 到 ARGB_8888 |
| "Bitmap.copy() 不分配新内存" | copy() 始终创建新的像素数组，是完整复制 |
| "放大 Bitmap 会提升清晰度" | 不会，createScaledBitmap 是插值，无法凭空生成新细节 |
