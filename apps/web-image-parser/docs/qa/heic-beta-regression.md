# HEIC Beta 样例回归记录（T336）

> 对照 `test-assets/manifest.md` HEIC 章节  
> 更新：2026-05-22

## 已验收（✅ 已入库）

| 样例 ID | 文件 | E2E | 单元测试 | 备注 |
|---------|------|-----|---------|------|
| S-HEIC-01 | `heic/S-HEIC-01_autumn.heic` | `e2e/heic-happy-path.spec.ts` | `BmffReader.test.ts`、`IpmaParser.test.ts` | meta/ipma/iref/主图★/缩略图关联 |

## 待手动样例（📥 未入库 — 阻塞项）

| 样例 ID | 覆盖能力 | 状态 | 补全方式 |
|---------|---------|------|---------|
| S-HEIC-03 | Live Photo 图+视频（T321/T326） | 📥 | iPhone AirDrop 导出 |
| S-HEIC-11 | 含音轨（T322） | 📥 | 含视频 HEIF 样例 |
| S-HEIC-16 | 人像深度图（T323） | 📥 | iPhone 人像模式 .heic |

## 回归结论

- **当前 Beta 门禁**：S-HEIC-01 全链路通过（解析 → 树 → ipma 可读 → 环境提示）
- **待样例转 ✅ 后**：重新运行 `npm run test:e2e` 并补充上表 E2E 行
- **manifest 更新**：样例入库后修改 `test-assets/manifest.md` 状态列

## QA 签核

| 检查项 | 结果 | 日期 |
|--------|------|------|
| S-HEIC-01 解析 success/partial | ✅ | 2026-05-22 |
| S-HEIC-01 E2E 选 ipma 可读 | ✅ | 2026-05-22 |
| S-HEIC-03 Live Photo | ⏸ 待样例 | — |
| S-HEIC-11 音轨 | ⏸ 待样例 | — |
| S-HEIC-16 深度图 | ⏸ 待样例 | — |
