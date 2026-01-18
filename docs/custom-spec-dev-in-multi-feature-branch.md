这套新流程应该怎么用？（推荐操作流）
1) 建 EPIC 总览（统一入口）
运行：/speckit.specify "<EPIC需求描述>"
产物：specs/epics/EPIC-xxx-*/epic.md
在 epic.md 里维护：
Feature 列表
通用能力（跨 Feature capability）（避免散落在各 Feature）
整体 EPIC-FR / EPIC-NFR（端到端约束/预算/统一口径）
Feature Registry（自动同步区）：作为全 EPIC 的进度面板
2) 为某个 Feature 开分支 + 细化文档（可并行）
运行：/speckit.feature "<单个Feature描述>"
产物：specs/<feature-branch>/spec.md（Feature 细节：FR/NFR、边界、AC 等）
关键点：Feature 的 spec.md 顶部必须填 **Epic**：EPIC-xxx - ...，这样才能自动回写到对应 EPIC。
3) 生成 Plan/Tasks/Full Design（Feature 内闭环）
在该 Feature 分支上依次：
/speckit.clarify（可选但建议）
/speckit.plan（产出 Story Breakdown：ST-xxx）
/speckit.tasks（把 ST-xxx 拆成 Task）
/speckit.fulldesign（Feature 级 Full Design）
/speckit.implement
4) 每次 Feature 有进展，自动同步回 EPIC 总览（你要的“统一视图”）
在 Feature 分支上运行：
/speckit.epicsync "<备注/同步范围>"
它会把该 Feature 的版本/状态/链接增量更新到 epic.md 的 Feature Registry 区块（只动那一小块，不重写 EPIC 其他章节）。也可直接跑脚本（命令里已写）：
.specify/scripts/powershell/sync-epic-overview.ps1 -Notes "<备注>"
5) 生成“整个 EPIC 的统一技术指导”（跨 Feature Full Technical Design）
当多个 Feature 的 Story/Task 都已经相对稳定后（你要求“Story 拆解后生成”），运行：
/speckit.epicfulldesign "EPIC-xxx ..."
产物：specs/epics/EPIC-xxx-*/epic-full-design.md
它会整合 epic.md + 各 Feature 的 plan/tasks/full-design，给出 EPIC 级统一指导（不新增决策，只整合与暴露冲突点）。
