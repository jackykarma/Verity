---
description: "【已合并·可选】请改用 /aisdd.analyze epic（非必经步骤）"
---

## 命令已合并

`/aisdd.epicanalyze` 已并入 **`/aisdd.analyze`**，请改用：

| 原用法 | 新用法 |
|--------|--------|
| `/aisdd.epicanalyze` | `/aisdd.analyze epic` |
| `/aisdd.epicanalyze EPIC-002` | `/aisdd.analyze EPIC-002` 或 `/aisdd.analyze epic EPIC-002` |
| epicdesign 后、featuretasks 前（可选） | `/aisdd.analyze epic pre-tasks` |

**说明**：analyze 不阻塞 `featuretasks` 或 `implement`，可全程跳过。

完整规则见 [aisdd.analyze.md](./aisdd.analyze.md)。
