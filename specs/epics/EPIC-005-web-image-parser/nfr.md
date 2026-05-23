# 技术评估（设计产出验证）：EPIC-005 - Web 端图片数据解析器

> **关联**：[`epic-design.md`](./epic-design.md) §八 | [`tech-spec.md`](./tech-spec.md)

**Epic**：EPIC-005  
**创建/更新日期**：2026-05-22

---

### 8.1 算法评估

**N/A**——本 EPIC 无 ML/推荐类算法；结构解析为确定性字节扫描，正确性通过样例集目录覆盖率验收（P0 100%、P1 ≥95%）。

### 8.2 功耗评估

**N/A**——纯 Web 浏览器工具，无独立应用电量计量；以「无用户交互时持续全速解码 ≤5 分钟」约束代替（FEAT-004 NFR-POWER-001），由 `ContentPresenter` 在分区切换时停止解码。

### 8.3 性能评估（必须）

| 指标 ID | 验收目标（spec/tech-spec） | 设计预算 | 测量方法 | 设计结论 |
|--------|---------------------------|----------|----------|----------|
| PERF-INGEST | 校验 P95 ≤1s | 同步魔数+size，<50ms 典型 | 性能测试 100 次选文件 | ✅ 达标 |
| PERF-LIST | 20MB 列表 P95 ≤10s | Worker 扫描+exifr 分批 | Playwright + S-JPEG-01/ S-HEIC-01 | ✅ 需实测确认 |
| PERF-SELECT | 选中到呈现触发 P95 ≤500ms | 主线程仅组装 Request | 埋点 present() 入口耗时 | ✅ 达标 |
| PERF-PREVIEW | 5MB 图预览 P95 ≤2s | Blob+createImageBitmap | 样例分区计时 | ⚠️ 大图依赖解码器 |
| PERF-PLAY | 20MB 视频起播 P95 ≤3s | video 元素+首帧 | S-HEIC-03 | ⚠️ 环境相关 |
| PERF-TIMEOUT | 解析 120s 上限 | Orchestrator watchdog | 模拟慢文件 | ✅ 达标 |

**降级**：超 10s 显示进度条；超时提示重新选文件或取消。

### 8.4 内存评估（必须）

| 场景 | 目标峰值（tech-spec） | 设计策略 | 结论 |
|------|----------------------|----------|------|
| 壳层 | ≤30MB 增量 | 无整文件副本在 Shell | ✅ |
| JPEG 解析 | ≤150MB @20MB 文件 | 单 Buffer SoR+树 DTO | ⚠️ exifr 临时对象须释放 |
| HEIC 解析 | ≤200MB @20MB 文件 | mp4box 流式+及时 detach | ⚠️ 实测 |
| 呈现缓存 | ≤3 全分辨率 | PreviewCache LRU | ✅ |

**OOM 策略**：捕获后 `PARSE_FAILED`+建议缩小文件；禁止静默崩溃。

### 8.5 安全评估（必须）

| 项 | 要求 | 设计措施 | 结论 |
|----|------|----------|------|
| 不上传文件 | NFR-SEC | 无 fetch 上传逻辑；CSP default-src 'self' | ✅ |
| 错误无路径 | FR-007 | FailureCopy 仅用枚举 | ✅ |
| 会话清理 | 换文件 | disposeSession+revokeObjectURL | ✅ |
| WASM 同源 | 若引入 libheif | 同源托管 | 待选型 |

### 8.6 兼容性评估（必须）

| 矩阵 | 范围 | 设计 |
|------|------|------|
| 浏览器 | Chromium/Firefox/Safari 最近两版 | Browserslist 配置 | ✅ |
| HEIC | ENV-HEIC-A/B/C | HeicEnvDetector | ✅ |
| 视频编码 | HEVC 主流 | canPlayType 探测 | 不支持→FR-009 |

### 8.7 RomSize / 包体评估

| 项 | 预算 | 说明 |
|----|------|------|
| 首屏 JS（gzip） | ≤800KB | exifr+mp4box 分包 lazy |
| 静态托管 | 无 APK | 仅 dist/ 体积 |

**结论**：依赖库为主要体积风险；JPEG MVP 可先不打包 mp4box（HEIC Beta 再引入）。

---

**总评**：设计方案在隐私与架构约束上满足 spec；性能/内存须在 `implement` 阶段用 `test-assets/` 实测闭环，未达标时优先优化 Worker 扫描或协商 CR 调整 NFR。
