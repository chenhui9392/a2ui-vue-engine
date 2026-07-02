# A2Table Review 报告

**Review 对象**：[table-design.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/table-design.md)
**Review 依据**：[runtime-design.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/guide/runtime-design.md)、[page-schema.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/page-schema.md)、[datasource.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/datasource.md)、当前源码
**立场**：架构一致性 + 零侵入 + 未来复用能力
**边界**：只做 Review，不写代码，不改协议

---

## 一、是否符合 Runtime

### 结论：**符合**。Table 完整走通了 Runtime 的四个协作面。

对齐点逐项核验：

- **协议入口（MessageProcessor）**：Table 无新增消息类型，完全复用 `node / node_update / node_append / node_remove / data / data_update / action / error / complete` 九种。Streaming 追加行也是走既有 `data_update`（`data.$ds.<id>.data` 增量），没有创造私有增量协议。**通过。**
- **状态入口（A2UIRoot.data）**：行数据落到 `data.$ds.<id>.data`，选择状态落到 `data.$page.<pageId>.selectedRows`，全部走单一响应式源，未引入 Table 组件级本地 store。**通过。**
- **渲染入口（Renderer）**：Table 是普通组件（`context.componentMap['a2-table']`），无需 Renderer 感知；`cellRender: A2Node` 在单元格内递归调用 `renderNode`，与 `a2-card / a2-list` 的容器机制一致。**通过。**
- **实现入口（ComponentRegistry）**：Table 通过 `componentMap` 注册；覆盖 / 异步加载走既有优先级——**通过**。
- **Bindings / Actions 扩展**：`type: 'datasource'` 是唯一新增的绑定类型与动作类型，在 [runtime-design.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/guide/runtime-design.md) 的扩展点列表中已经预留（`resolveBinding.switch` 与 `executeAction.switch` 的可扩展分支）。**通过。**
- **纯函数 Renderer**：Table 的所有交互都归约为「emit → Action → executeAction」，Renderer 依旧无状态。**通过。**
- **Fallback 行为**：Table 挂载失败或 columns 为空时，遵循「白名单 empty + 组件级容错」，不破坏兄弟节点渲染。**通过。**

### 唯一需要注意的偏差

- **cellRender 的相对路径**（`bindings.value: './row.status'`）需要 Bindings 层理解「相对当前行的 row 上下文」。这在 [tech-debt.md · DEBT-P1-05](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/tech-debt.md) 中提到的「统一 path.ts」尚未完成；Table 落地时会先行推动此收敛，才不至于让 cell 上下文写法散落。风险可控。

---

## 二、是否符合已有协议

### 结论：**完全符合**。Table Schema 是既有协议的 additive 扩展，不 breaking 任何字段。

逐项对照：

- **`A2Node` 顶层字段**：Table 只使用 `id / type / props / bindings / actions / children` 六个既有字段；`columns / selection / empty` 一律放在 `props` 里，未创造平行字段。**通过。**
- **`BindingConfig.type`**：新增 `datasource` 分支，属于 [runtime-design.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/guide/runtime-design.md) 已预留扩展点；老 Schema 未用即行为等价。**通过。**
- **`ActionConfig.type`**：新增 `datasource` 分支，与 `emit / callback / navigate / api` 并列；`event / payload` 结构不变。**通过。**
- **事件名**：`rowClick / sortChange / selectionChange / filterChange` 是新事件名，通过 Renderer 现有 `on{Event}` 桥接机制即可挂载，不改 Renderer。**通过。**
- **`FlatA2Node` 扁平通道**：Table 的 `columns / selection` 在扁平 Schema 中需要通过 `flatToTree.buildProps` 追加分支。此点触发的正是 [DEBT-P1-04](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/tech-debt.md)（flatToTree 注册表化）。**建议**：Table 落地前先偿还 DEBT-P1-04，让 Table 通过 `registerFlatMap('Table', mapFn)` 注册，避免继续加深中心化黑洞。
- **`A2Message`**：Table 事件都以既有 `type: 'action'` 上抛，宿主看到的消息格式与既有组件一致。**通过。**
- **未知字段兜底**：`Column.fixed / filterable` 在 V2.1 MVP 里未实现时，Table 组件对未知字段忽略即可，不导致渲染错误。**通过。**

### 提示

- 建议在 [json-schema.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/guide/json-schema.md) 中同步补一份 **A2Table Schema 章节**，避免 Table 协议只在设计文档里定义。

---

## 三、是否可以做到零侵入

### 结论：**接近零侵入**，但需要 **两条前置技术债偿还** 才能真正达标。

逐项分析：

- **Runtime 主干代码零侵入**：`MessageProcessor / renderTree / renderNode 主流程` 不需要改动——**通过**。
- **Bindings / Actions 新增分支**：
  - `resolveBinding` 追加 `case 'datasource':`——单点 additive，不影响 `literal / path / expression`；
  - `executeAction` 追加 `case 'datasource':`——单点 additive，不影响 `emit / callback / navigate / api`；
  - 这两处属于 **可枚举、可控的一次性侵入**，可以接受。
- **A2UIRoot 懒创建 PageRuntime**：属于 additive 一段代码，符合 [page-runtime-design.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/page-runtime-design.md) 的兼容承诺。**通过。**
- **componentMap 注册**：普通新增行，不侵入。**通过。**

### 存在的侵入点（需要提前偿还）

- **flatToTree.buildProps 中心化**（[DEBT-P1-04](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/tech-debt.md)）：Table 若要支持扁平 Schema，直接改 `buildProps` 会加深中心化黑洞。**建议先偿还此债**，让 Table 通过注册表接入，才是真正的零侵入。
- **SELF_RENDER_CHILDREN_TYPES 白名单**（[DEBT-P1-02](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/tech-debt.md)）：Table 的 `cellRender` 需要 Table 组件内部 `import { renderNode }` 递归渲染，与现有容器组件（Card / Row / Column / List）走同一模式。这本身不新增侵入点，但会**继续沿用已有的循环依赖**。**建议**：与 DEBT-P1-02 收敛的 `<RenderProvider>` 一同落地，Table 就完全无需 `import renderNode`。

### 一句话结论

**Table 本体设计是零侵入的**（所有变更均为 additive）；但 **零侵入的最终质量取决于 flatToTree 注册表化 + RenderProvider 抽出**这两条 P1 技术债是否先行偿还。若不偿还，Table 会「合法但脏」；若偿还，Table 是「合法且干净」。

---

## 四、是否兼容 Form

### 结论：**完全兼容**。Table 与 Form 是正交能力，不冲突。

要点：

- **命名空间隔离**：Form 数据在 `data.form.*`；Table 数据在 `data.$ds.*` 与 `data.$page.*`。二者在 `data` 中的挂载点不重叠，不会互相覆盖。**通过。**
- **Form Runtime 不感知 Table**：Form 场景（老 Schema，无 `a2-page / dataSources / a2-table`）时，PageRuntime 不激活，A2UIRoot 表现与旧版完全一致。**通过。**
- **Form 组件可放在 Table 内部**：Table 单元格 `cellRender` 可以放任何 A2 组件，包括 `a2-text-field / a2-choice-picker`——支持「可编辑单元格」场景，即 Form 组件复用于 Table。**收益。**
- **Form 可放在 Table 之外**：新建 / 编辑弹窗内的 Form 就是老 Form 语义。Table 提供「打开弹窗」的入口，Form 处理表单填写与提交。**通过。**
- **`getFormData` 兼容**：老 API `A2UIRoot.getFormData()` 只扫描 `data.form.*`，不受 Table / DataSource / Page Scope 影响。**通过。**
- **Playground 兼容**：所有当前 Form 类 Playground 示例在启用 Table 的构建下渲染结果与交互完全一致。**通过（作为验收保底）。**

### 交叉复用清单

- Form + Table：可编辑单元格（Cell 内嵌 `a2-text-field`）；
- Form + Search：Search 内部就是一个横向 Form；
- Form + Dialog：新建 / 编辑弹窗的天然搭档。

Form Runtime 与 Table 属于「上下叠加」而非「二选一」，这是设计上的重要属性。

---

## 五、是否方便 Chart / Tree / Dashboard / Description

### 结论：**方便**。Table 已经建立的模式（Columns + DataSource + Actions + Empty）是这些组件的通用模板。

逐个组件评估：

### 5.1 Chart

- **方便程度**：★★★★★ 极高
- **复用点**：
  - **DataSource**：Chart 直接消费 `bindings.dataSource`，与 Table 完全一致；
  - **Empty / Loading**：状态语义一致；
  - **Actions**：`chartClick / legendChange / zoomChange` 走既有 Actions 通道；
  - **单元格协议**：Chart 本身即是「单元级」的渲染，与 Table 单元格一致——甚至 Chart 可以直接放到 Table 的 `cellRender` 里（迷你图）。
- **差异点**：Chart 无 Columns，只有 `series / axes / options`；`Column` 的设计经验（列即容器 + 相对路径）可以直接迁移到 `Series` 定义。
- **风险**：Chart 库（ECharts / Chart.js）体积较大，建议异步注册（Registry 已支持）。

### 5.2 Tree

- **方便程度**：★★★★★ 极高（与 Table 同源）
- **复用点**：
  - **DataSource / Pagination（懒加载）/ Loading / Empty / Selection / Actions** 全套复用；
  - **Column 定义**：树表格 = Table + `Column.children` + `expandable` 字段，Table Schema 直接扩展即可；
  - **Cell 相对路径**：Tree 内部节点复用 `./row` 上下文。
- **差异点**：需要引入「层级展开 / lazyChildren」的列扩展字段（本身就是 Table 里 6.5 节的 V2.4 计划）。
- **风险**：无。Tree 是 Table 的自然延伸。

### 5.3 Dashboard

- **方便程度**：★★★★☆ 高
- **复用点**：
  - Dashboard 是 Card / Chart / Description / Table / Statistic 的组合，其**编排层**直接用 [Page Runtime](/architecture/page-runtime-design)；
  - Dashboard 内部的 Card 直接绑不同 DataSource，与 Table + Search + Pagination 三方联动模式一致；
  - Empty / Loading / Refresh 全部复用。
- **差异点**：Dashboard 更强调「布局与响应式栅格」，需要引入 `a2-dashboard-grid` 或 `a2-row / a2-column` 组合；这与 Table 的表格结构无关。
- **风险**：低。Dashboard 主要是布局问题，不是 Runtime 问题。

### 5.4 Description

- **方便程度**：★★★★★ 极高
- **复用点**：
  - **DataSource**：Description 消费单条数据（`data`），Table 消费多条数据（`data[]`）——同一 DataSource 类型，仅数据结构不同；
  - **Columns 类比**：Description 有 `items`，每一项对应「label / field / valueRender」，与 Column 定义几乎同构；
  - **Empty / Loading / Actions**：全套复用。
- **差异点**：Description 常与 Drawer / Dialog 组合展示详情；这属于 [Page Runtime · DialogManager](/architecture/page-runtime-design#8-page-runtime-如何管理-dialog) 的编排范畴。
- **风险**：无。

### 5.5 一致性红利

Table 设计的以下模式将成为 **A2UI 数据组件的通用模板**：

| 模式 | Table | Chart | Tree | Dashboard | Description |
|------|-------|-------|------|-----------|-------------|
| `bindings.dataSource` | ✔ | ✔ | ✔ | ✔（多个）| ✔ |
| `Empty / Loading` 状态 | ✔ | ✔ | ✔ | ✔ | ✔ |
| `Actions` 通道 | ✔ | ✔ | ✔ | ✔ | ✔ |
| `Cell / Series / Item` 内嵌 A2Node | ✔ cellRender | ✔ tooltipRender | ✔ cellRender | ✔ 布局 | ✔ valueRender |
| 相对路径上下文 `./row` | ✔ | ✔ (`./series`) | ✔ | — | ✔ (`./data`) |
| Selection（可选）| ✔ | — | ✔ | — | — |
| Pagination（可选）| ✔ | — | ✔ 懒加载 | — | — |

Table 是这套模板的 **奠基组件**。它把「单一数据入口 + Empty / Loading + Actions + 单元格协议」的模式沉淀下来，Chart / Tree / Description 后续实现只需要遵循同一模板，无需重复讨论。

---

## 六、Review 综合结论

| 维度 | 评价 | 备注 |
|------|------|------|
| 符合 Runtime | **符合** | 完整走通 Runtime 四入口 + 两桥梁 |
| 符合已有协议 | **符合** | 全部字段 additive，无 breaking |
| 零侵入 | **接近达标** | 需先偿还 DEBT-P1-02 与 DEBT-P1-04 |
| 兼容 Form | **完全兼容** | 命名空间隔离 + 双向复用 |
| Chart / Tree / Dashboard / Description | **高度复用** | Table 沉淀通用模板 |
| 协议清晰度 | **良好** | 建议在 json-schema.md 补 Table 章节 |
| 落地风险 | **可控** | 与 Page Runtime 同期交付；技术债先偿还 |

**主要问题**（对应上一轮技术债，此处不新增）：

1. Table 若不先偿还 DEBT-P1-04（flatToTree 注册表化），会加深中心化黑洞——**Blocker，落地前必须解决**；
2. Table 若不与 DEBT-P1-02（RenderProvider）一同落地，将继续走「组件反向 import renderNode」的循环依赖模式——**Warning，可与 Table 一起偿还**；
3. Table 依赖的 `cellRender` 相对路径 `./row` 语义，需要 DEBT-P1-05（统一 path.ts）先行——**Warning**。

**建议落地顺序**（对齐 [Roadmap V2](/architecture/roadmap#v2-crud-页面)）：

- V2.0：Page Runtime + DataSource MVP + DEBT-P0-01（安全）+ DEBT-P1-01 / 03 / 05 / 07（消息通道 / 作用域 / 路径 / DataSource MVP 边界）；
- **V2.1：偿还 DEBT-P1-04 → 交付 A2Table MVP**；
- V2.2：偿还 DEBT-P1-02（RenderProvider）→ 交付 Selection / Toolbar 联动；
- V2.3+：Table 高级能力（冻结列 / 展开 / 树形 / 可编辑单元格）。

**总体评价**：Table 设计属于 **架构一致、协议正确、能力沉淀** 的方案。它不仅解决了「怎么画一个表格」的问题，更**为 Chart / Tree / Dashboard / Description 树立了通用模板**。落地前的两条技术债偿还是投资，不是成本；一旦到位，Table 及其兄弟组件的落地都会大幅顺畅。

**结论**：**通过 Review**，附带三条前置约束（先偿还 DEBT-P1-02 / 04 / 05）与一条文档补充（json-schema.md 增补 Table 章节）。
