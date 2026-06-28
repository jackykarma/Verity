---
description: "**Feature 级**设计稿解析：在本 Feature 的 spec.md 完成后，从交互稿/视觉稿提取并结构化交互逻辑与视觉规范，产出 features/FEAT-xxx/ux-design.md。支持本地图片、Figma MCP、Pencil。可选步骤；无设计稿时进入兜底模式。"
handoffs:
  - label: 代码调研（Brownfield）
    agent: aisdd.featureresearch
    prompt: 若本 Feature 有存量代码，运行 /aisdd.featureresearch（熟悉代码并为 epicdesign 提供设计参考）；纯 Greenfield 跳过
    send: false
  - label: 继续下一 Feature spec
    agent: aisdd.featurespec
    prompt: 若 EPIC 尚有 Feature 未写 spec，继续 featurespec；否则进入 techspec
    send: false
  - label: EPIC 技术规格书
    agent: aisdd.techspec
    prompt: 所有 Feature 的 spec（及可选 ux-design）就绪后，运行 /aisdd.techspec
    send: false
  - label: 澄清交互/视觉约束
    agent: aisdd.featurespec
    prompt: 需补充需求侧交互/视觉约束时运行 /aisdd.featurespec --clarify；若 ux-design.md 已存在可说明更新范围做增量更新
    send: false
---

## 用户输入

```text
$ARGUMENTS
```

在继续操作前，你**必须**参考用户输入（若不为空）。可用于：
- **Feature 标识**（如 `FEAT-001` 或完整路径；`SPECIFY_FEATURE` 已设时可空）
- **解析侧重**：`交互` / `交互稿` → 交互逻辑；`视觉` / `视觉稿` → 视觉规范；不指定 → 全量（默认）
- **Figma 链接**：记录为输入源之一

## 前置条件

- 本 Feature 的 **`spec.md` 已完成**
- **不要求**其他 Feature 的 spec 或 ux-design 已完成
- **推荐顺序**：`/aisdd.featurespec` → **`/aisdd.featureuidesign`**（可选）→ **`/aisdd.featureresearch`**（**仅 Brownfield**，弄清实现流程与原理）→ … 全部 Feature 就绪后 → `/aisdd.techspec`

## 大纲

**核心定位**：从设计稿中**提取并结构化**本 Feature 的交互与视觉规范，供 review 与 implement 引用。**不是** AI 凭空创作 UX。

**输入源**（交互稿与视觉稿均可来自以下来源之一或组合）：

1. **本地图片**：`design/` 下 .png/.jpg/.webp（Read 工具视觉分析）；推荐 `design/[序号]-[界面]-[状态].png`
2. **Figma 链接**：`$ARGUMENTS` 或 `design/figma-links.md`；**Figma MCP** 读取节点、样式变量、原型
3. **Pencil 文件**：`design/*.pen`；**Pencil MCP** 读取节点树

**设计素材路径**（按优先级扫描）：
1. `{FEATURE_DIR}/design/`（**推荐**）
2. `{EPIC_DIR}/design/{FEAT-xxx}/`（EPIC 共享目录按 Feature 分子目录）
3. `{EPIC_DIR}/design/`（仅当文件名/子目录/用户说明可归属本 Feature 时采信）

**输入优先级**（冲突时）：Figma MCP ≈ Pencil > 本地图片。

**兜底模式**：三种来源均无可解析素材时，基于本 Feature `spec.md` 提出 UX 建议草案，标记 `[AI 建议 - 待设计师确认]`。

**本命令可选**：设计稿未就绪可跳过；就绪后对本 Feature 运行或增量更新。

---

执行步骤：

### 1. 环境与路径

```powershell
.specify/scripts/powershell/check-prerequisites.ps1 -PathsOnly -Json
```

解析 `FEATURE_DIR`、`FEATURE_SPEC`、`UX_DESIGN`、`DESIGN_DIR`、`EPIC_DIR`（若 JSON 无 `EPIC_DIR`，从 `FEATURE_DIR` 推导：`…/EPIC-xxx/features/FEAT-xxx` → EPIC 根）。

- 未设 `SPECIFY_FEATURE` 且 `$ARGUMENTS` 无法定位 Feature：**终止**并提示设置 `SPECIFY_FEATURE` 或提供 Feature 标识
- 若 `UX_DESIGN` **已存在**且用户未说明更新范围：**终止**并提示「请说明要更新的章节或范围，由 AI 做增量更新」

### 2. 前置条件检查

- 若 `FEATURE_SPEC`（`spec.md`）不存在：**终止**并提示先运行 `/aisdd.featurespec`
- 可选读取 `{EPIC_DIR}/epic.md` 了解 Feature 在 EPIC 中的位置与入口关系

### 3. 扫描设计素材

按「设计素材路径」优先级扫描；对 `$ARGUMENTS` 中的 Figma URL 一并处理。

**3a. 本地图片**：Read 逐个读取；区分交互/视觉稿；无命名约定时将归属列入「待确认项」

**3b. Figma 链接**：Figma MCP 读取；失败记入「待确认项」

**3c. Pencil 文件**：Pencil MCP 读取节点树与布局

**3d. 评估输入质量等级**：
- **A**：交互+视觉主要界面齐备（Figma/Pencil 可读或本地图片+命名规范）
- **B**：覆盖主要界面（**常规路径**）
- **C**：部分界面或归属待确认多
- **D**：无素材 → 兜底模式（5c）

### 4. 加载需求上下文

- 本 Feature **`spec.md`**（交叉比对主参照）
- `{EPIC_DIR}/epic.md`（入口、跨 Feature 交界）
- `.specify/templates/ux-design-template.md`（输出结构）
- 其他 Feature 的 `ux-design.md`（**只读**，若存在且涉及共享导航/主题，用于交界对齐，**禁止**改写）

### 5. 解析与提取

根据解析侧重（交互 / 视觉 / 全量）执行；**范围限定为本 Feature** spec 中的 FR/AC/用户旅程及设计稿中归属本 Feature 的界面。

**5a. 交互稿解析**：信息架构、页面流转（Mermaid）、逐屏规则、状态、反馈、异常、导航与手势；与 **本 Feature spec** 交叉比对 →「遗漏与待确认」

**5b. 视觉稿解析**：色板、布局、组件、动效、适配、无障碍；与 spec NFR 比对

**输入融合规则**：Figma/Pencil 结构化数据 → `✅ 高`；仅图片 → `⚠️ 中` / `❓ 低`；Figma 原型可读时流转/动效 → `✅ 高`

**5c. 兜底模式**：基于本 Feature spec 填模板，全文 `[AI 建议 - 待设计师确认]`

### 6. 填充 ux-design.md

写入 `{FEATURE_DIR}/ux-design.md`，按模板结构填充。

元信息须含：Epic、Feature、Version、日期、解析模式、输入质量等级、设计素材列表、需求参照（`spec.md`、`epic.md`）。

### 7. AI 视觉理解验证图（可选，推荐）

- 存放 `{FEATURE_DIR}/design/ai-understanding/`
- D 级或纯交互侧重可跳过

### 8. 完成报告

输出路径、质量等级、解析统计、置信度分布、遗漏/待确认摘要；提示：
- review「遗漏与待确认」与 `❓ 低` 条目
- 若 EPIC 尚有 Feature 未做 ux-design：可对下一 Feature 运行 `/aisdd.featureuidesign`
- **Brownfield 下一步**：`/aisdd.featureresearch`（熟悉存量代码，并为 epicdesign 提供设计参考，产出至 `research/`）
- **纯 Greenfield**：跳过 featureresearch，直接进入下一 Feature 或 techspec
- 当**全部 Feature** spec / ux / research（推荐）就绪：运行 `/aisdd.challenge spec`（多 Feature 推荐）→ `/aisdd.techspec`

---

## 核心规则

- **解析而非创作**（兜底除外，须标记 `[AI 建议 - 待设计师确认]`）
- **ux 写入侧边界守护**：行为契约/量化指标/范围归 `spec.md`；命中 block_ask（见 `.cursor/rules/aisdd-document-boundaries.mdc` Part B）
- **spec 单向消费**：对 `spec.md`、`epic.md` 只读；禁止反写 spec/epic
- **Scope 限定本 Feature**：不写入其他 Feature 的界面细节（交界处在「与 EPIC/其他 Feature 的交界」摘要即可）
- **技术决策不归 ux-design**：归 `tech-spec.md` / `epic-design.md`
