# 测试样例清单（manifest）

> **路径根目录**：`specs/epics/EPIC-005-web-image-parser/test-assets/`  
> **更新**：2026-05-22  
> **拉取脚本**：`./download-test-assets.sh`

## 状态说明

| 状态 | 含义 |
|------|------|
| ✅ 已入库 | 文件已在本目录，可用于验收 |
| ⬇️ 脚本可下 | 运行 `download-test-assets.sh` 可自动获取 |
| 📥 待手动 | 公开资源稀缺，需自行提供文件 |

---

## JPEG 样例

| 样例 ID | 文件 | 状态 | 覆盖目录项（摘要） | 来源 |
|---------|------|------|-------------------|------|
| S-JPEG-01 | `jpeg/S-JPEG-01_Canon_40D_EXIF.jpg` | ✅ | PAR-JPEG-001～015, 025 | [exif-samples Canon_40D](https://github.com/ianare/exif-samples) |
| S-JPEG-02 | `jpeg/S-JPEG-02_JFIF_small.jpg` | ✅ | 基线 JFIF（极小） | [mathiasbynens/small](https://github.com/mathiasbynens/small) |
| S-JPEG-03 | `jpeg/S-JPEG-03_Kodak_EXIF.jpg` | ✅ | EXIF 通用字段 | exif-samples Kodak_CX7530 |
| S-JPEG-03b | — | 📥 | GPS IFD | 可从 exif-samples 其他含 GPS 文件补入 |
| S-JPEG-04 | `jpeg/S-JPEG-04_Olympus_ICC.jpg` | ✅ | PAR-JPEG-006 ICC | exif-samples Olympus_C8080WZ |
| S-JPEG-05 | `jpeg/S-JPEG-05_Photoshop_IPTC.jpg` | ✅ | PAR-JPEG-007, 022 | exif-samples Canon_PowerShot_S40 |
| S-JPEG-05b | `jpeg/S-JPEG-05b_Photoshop_import.jpg` | ✅ | Photoshop 导入 | exif-samples Canon_40D_photoshop_import |
| S-JPEG-06 | — | 📥 | MPO 多图 | 需自行准备 MPO 样例 |
| S-JPEG-07 | — | 📥 | 渐进式 JPEG | 需自行准备 progressive 样例 |
| S-JPEG-08 | — | 📥 | Motion JPEG | 需自行准备 |
| S-JPEG-09 | `jpeg/S-JPEG-09_corrupted.jpg` | ✅ | 损坏段 | exif-samples `corrupted.jpg` |
| S-JPEG-10 | `broken/S-JPEG-10_truncated.jpg` | ✅ | 截断文件 | 本地由 S-JPEG-01 截断生成 |
| S-JPEG-11 | `jpeg/S-JPEG-11_Canon_MakerNote.jpg` | ✅ | PAR-JPEG-026 Canon | 同 Canon_40D |
| S-JPEG-12 | `jpeg/S-JPEG-12_Nikon_MakerNote.jpg` | ✅ | PAR-JPEG-026 Nikon | exif-samples Nikon_D70 |
| S-JPEG-13 | `jpeg/S-JPEG-13_Sony_MakerNote.jpg` | ✅ | PAR-JPEG-026 Sony | exif-samples Sony_HDR-HC3 |
| S-JPEG-13b | — | 📥 | Apple/iPhone | 需 exif-samples 或真机导出 |
| S-JPEG-14 | `jpeg/S-JPEG-14_Pentax_MakerNote.jpg` | ✅ | PAR-JPEG-026 Pentax | exif-samples Pentax_K10D |
| S-JPEG-15 | `jpeg/S-JPEG-15_long_description.jpg` | ✅ | 长文本 EXIF | exif-samples long_description |
| S-JPEG-16 | `jpeg/S-JPEG-16_Fujifilm_MakerNote.jpg` | ✅ | Fujifilm MakerNote | exif-samples Fujifilm_FinePix_E500 |
| S-JPEG-17 | `jpeg/S-JPEG-17_Panasonic_MakerNote.jpg` | ✅ | Panasonic MakerNote | exif-samples Panasonic_DMC-FZ30 |
| S-JPEG-18 | `jpeg/S-JPEG-18_Ricoh.jpg` | ✅ | P2 厂商 | exif-samples Ricoh_Caplio_RR330 |
| S-JPEG-19 | `jpeg/S-JPEG-19_Samsung.jpg` | ⬇️ | P2 厂商 | exif-samples Samsung_Digimax_i50_MP3 |

---

## HEIC 样例

| 样例 ID | 文件 | 状态 | 覆盖目录项（摘要） | 来源 |
|---------|------|------|-------------------|------|
| S-HEIC-01 | `heic/S-HEIC-01_autumn.heic` | ✅ | 容器 meta、主图项 | [nokiatech/heif autumn](https://github.com/nokiatech/heif) |
| S-HEIC-02 | — | 📥 | 含缩略图 | 建议真机 HEIC 或 libheif 样例包 |
| S-HEIC-03 | — | 📥 | Live Photo 图+视频 | **需 iPhone 导出**或配对 HEIC+MOV |
| S-HEIC-04 | — | 📥 | 纯视频轨 HEIC | 少见，需自行寻找 |
| S-HEIC-05～08 | — | 📥 | 网格/XMP/ICC 等 | 可逐步从 libheif / 真机补全 |
| S-HEIC-10 | — | 📥 | 截断 mdat | 可由完整 HEIC 本地截断生成 |
| S-HEIC-11 | — | 📥 | 含音轨 | 需含视频的 HEIC/HEIF 样例 |
| S-HEIC-12 | — | 📥 | Exif+MakerNote 字段级 | 建议 Canon/Nikon 拍摄的 .heic |
| S-HEIC-16 | — | 📥 | 人像深度图 | 需 iPhone 人像模式 .heic |
| S-HEIC-17 | — | 📥 | HDR 增益图 | 需支持 HDR 的 Apple 样例 |

---

## 推荐补全方式（手动样例）

1. **iPhone Live Photo（S-HEIC-03）**：AirDrop 导出 `.heic`，确认含关联视频轨。  
2. **人像模式深度（S-HEIC-16）**：设置 → 相机 → 人像模式拍摄。  
3. **含 GPS 的 JPEG（S-JPEG-03b）**：手机开启定位后拍照导出 JPEG。  
4. **批量上游库**（网络稳定时）：
   ```bash
   git clone --depth 1 https://github.com/ianare/exif-samples.git _sources/exif-samples
   cp _sources/exif-samples/jpg/*.jpg jpeg/
   ```

---

## 变更记录

| 日期 | 说明 |
|------|------|
| 2026-05-22 | 初始 manifest；脚本下载 15 JPEG + 1 HEIC + 1 截断 + 1 损坏 |
