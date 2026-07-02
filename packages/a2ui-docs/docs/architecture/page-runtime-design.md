# Page Runtime 设计

> 本文档是 **设计文档**，不涉及代码实现，也不修改现有 Runtime。
>
> 目标：在既有 Form 能力基础上，叠加一层 **Page Runtime**，负责 Search / Toolbar / Table / Pagination / Dialog / Drawer / Description / Card / Action / DataSource 等页面级能力的编排。
>
> 参考文档：
> - [Runtime 架构设计](/architecture/runtime-design)
> - [Page Schema 设计](/architecture/page-schema)
> - [DataSource 设计](/architecture/datasource)
> - [组件开发规范](/architecture/component-development)

---

## 1. 为什么需要 Page Runtime

现有的 A2UI Runtime（下文简称 **Form Runtime**）解决的是 **单页面表单** 场景：一份 Schema 描述若干字段与按钮，Runtime 负责渲染 + 数据绑定 + 事件上抛。它的能力边界到 `bindings` + `actions` + `formData` 为止。

当业务从「表单」进入「CRUD 页面」时，出现三类新问题：

- **数据获取**：谁去发 HTTP？谁管 loading / error？谁管翻页 / 搜索 / 排序 / 过滤？
- **模块编排**：Search 与 Table 如何联动？Table 的 rowClick 如何打开 Dialog？Dialog 的提交如何触发 Table 刷新？
- **状态治理**：多个页面模块（Search / Table / Dialog / Description）需要共享或隔离状态，`data` 全局扁平命名空间不够用。

如果这些问题继续下放到宿主应用，就意味着：

- 宿主必须编写大量样板代码（Search 触发 refresh、Table 消费 items、Dialog 控制 visible）；
- AI 生成 Schema 时无法直接表达「一个完整页面」，必须逐个 message 手工拼装；
- 同类页面（列表页 / 详情页 / 表单页）在不同业务里重复实现。

**Page Runtime 的定位** = **Form Runtime 之上、宿主之下** 的中间层：

- 依旧走同一个 `A2UIRoot` 挂载点；
- 依旧走同一份协议、同一个 Renderer、同一个 MessageProcessor；
- 只是在 A2UIRoot 内部**新增**一个「页面运行时」，把 DataSource、模块间事件路由、局部作用域、生命周期等能力集中处理。

因此 Page Runtime 不是替换 Form Runtime，而是 **叠加**——旧 Schema 完全不感知它的存在。

---

## 2. Page Runtime 与 Renderer 如何协作

Page Runtime 是 **协议消费者**，Renderer 是 **协议执行者**。两者的协作遵循「Renderer 只做纯渲染，Page Runtime 只做编排」。

### 2.1 边界

- Renderer 不感知 Page Runtime 的存在：`renderTree / renderNode` 只读 `A2Node + RenderContext`，产 VNode。
- Page Runtime 不产 VNode：所有渲染仍由 Renderer 承担。
- Page Runtime 通过 **RenderContext 扩展字段**（新增可选 `pageRuntime?`）向下传递自身能力，供 Page 级组件（`a2-page / a2-search / a2-table / a2-dialog / …`）读取。

### 2.2 协作方式

- **上下文注入**：A2UIRoot 挂载时，若发现 `A2Node` 顶层含 `dataSources` 或 `type: 'a2-page'`，创建一个 Page Runtime 实例并将其挂到 `RenderContext.pageRuntime`；其它场景不创建，行为等价旧版。
- **组件消费**：Page 级组件在 setup 阶段从 `props.context.pageRuntime` 取到实例，通过它读取 DataSource 状态、注册事件监听、调用 `refresh / setPage / setFilter` 等命令。
- **无副作用回退**：Page 组件若在没有 pageRuntime 的上下文中被使用（例如单独放到 Form Runtime 环境测试），应有降级：`dataSource` 走 `props` 静态数据，Action 通过 emit 上抛，不崩。

### 2.3 与 Bindings / Actions 的关系

- **新绑定类型 `datasource`**：`BindingConfig.type: 'datasource'` 在 `resolveBinding` 中新增分支，从 `pageRuntime.getState(id)` 取出响应式状态对象，作为 prop 注入组件——这是 Page Runtime 与 Bindings 的唯一交集点。
- **新动作类型 `datasource / dialog`**：`ActionConfig.type: 'datasource'` 或 `'dialog'` 在 `executeAction` 中新增分支，调用 `pageRuntime.dispatch({ target, op, ... })`——这是 Page Runtime 与 Actions 的唯一交集点。

两处扩展点都是 **additive** 的（新增分支，不修改现有 `literal / path / expression` 与 `emit / callback / navigate / api` 的语义）。

### 2.4 不涉及的事

- Page Runtime 不接管 `resolveProps / renderChildren / renderSlots` 等 Renderer 内部机制；
- Page Runtime 不订阅 Vue 响应式 API 细节，只依赖 A2UIRoot 传下来的 `data`；
- Page Runtime 不构造 VNode。

---

## 3. Page Runtime 与 MessageProcessor 如何协作

MessageProcessor 是 **协议入口**，Page Runtime 是 **协议消费者的编排层**。两者不直接调用，而是通过 A2UIRoot 中转。

### 3.1 协作路径

```
外部 JSONL / A2Message
        │
        ▼
MessageProcessor.processChunk / processStream
        │  onNode / onData / onError / onComplete
        ▼
A2UIRoot 状态层
        │
        ├─► tree.value = newTree             ── Renderer 再次执行
        │
        └─► pageRuntime.applyMessage(msg)    ── Page Runtime 消费 message
                     │
                     ▼
                DataSource / Dialog / Scope 状态更新
```

- MessageProcessor 侧不新增消息类型（保持 `node / node_update / node_append / node_remove / data / data_update / action / error / complete` 九种不变）。
- Page Runtime 在 A2UIRoot 内部订阅 **副产品事件**：`onNode` 用于识别新的 `dataSources` 声明，`onData` 用于观察外部对 Page 相关字段的写入，`onComplete` 用于终结进行中的 DataSource。

### 3.2 增量协议的复用

Page Runtime **完全复用** MessageProcessor 已有的增量能力：

- 服务端 / Agent 推送 `node_update` 替换 Page 内某个模块 → Renderer 直接 patch；
- 服务端 / Agent 推送 `data_update` 更新 `data.$ds.<id>` → Page Runtime 察觉并把新数据反映到 DataSource 状态。

因此 Page Runtime **不需要发明新协议**——它是 MessageProcessor 的下游订阅者。

### 3.3 Page Runtime 产生的对外消息

当 Page Runtime 处理内部事件（例如 Table 的 rowClick）需要通知宿主时，仍走既有 `A2UIRoot.emit('message', ...)`，只是消息中 `payload.action` 由 Page 级 Action 声明。这样宿主无论使不使用 Page Runtime，感知的消息通道一致。

### 3.4 与 MessageProcessor 的解耦

- Page Runtime 不直接 `import MessageProcessor`；
- MessageProcessor 也不直接 `import` Page Runtime；
- 只有 A2UIRoot 作为桥梁：它把 MessageProcessor 的回调 fan-out 到「State 更新 + Page Runtime 消费」两个通道。

---

## 4. Page Runtime 如何管理页面状态

Page Runtime 采用 **分层作用域 + 复用响应式源** 的模型，避免打破「A2UIRoot.data 是唯一响应式源」的现有承诺。

### 4.1 三层状态划分

- **全局 State（沿用现有）**：`A2UIRoot.data.value`——所有场景的兜底。
- **Page Scope**：Page Runtime 为每个 `a2-page` 节点创建一个逻辑作用域，落到 `data.$page.<pageId>` 命名空间。
- **DataSource State**：DataSource 的运行时状态落到 `data.$ds.<dsId>`（在 Page 作用域内 id 可局部命名）。

结构示例：

```
data
├─ form                       ← 现有 Form 能力
├─ $page
│   ├─ orderPage
│   │   ├─ selectedRows
│   │   ├─ ui.filters
│   │   └─ ui.activeTab
│   └─ userPage
│       └─ ui.activeTab
└─ $ds
    ├─ orderList  { status, data, meta, error }
    └─ orderDetail { status, data, meta, error }
```

### 4.2 作用域声明

- `a2-page` 节点默认建立 Page Scope；
- Page Scope 名字取自节点 `id`（已由协议保证唯一）；
- 嵌套 `a2-page`（例如 Tabs 内嵌 page）产生嵌套 scope，就近查找；
- 通过 `bindings.value` 的相对路径（如 `./ui.filters`）允许 Page 组件访问所在 scope。

### 4.3 状态可见性

- Page 组件默认只读写本 Page Scope 与自身声明的 DataSource；
- 跨 Page 通信必须通过「message 上抛 → 宿主处理 → 命令式反向驱动」的既有闭环，Page Runtime 不引入直接通信。

### 4.4 响应式复用

- Page Runtime 不自建响应式容器，所有状态最终写入 `data.value`（Vue `ref`）；
- 变更走既有 `setPathValue`（受 [tech-debt DEBT-P1-05](/architecture/tech-debt) 收敛为统一 `path.ts` 后更稳定）；
- 组件通过 `bindings: { type: 'datasource' }` 或 `type: 'path'` 消费。

### 4.5 生命周期

- **挂载**：`a2-page` 挂载时，Page Runtime 注册其 scope 与内含 dataSources；
- **卸载**：`a2-page` unmount 时（例如 Tabs 切换 + `destroyOnHide=true` / Dialog 关闭 + `destroyOnClose=true`），Page Runtime 销毁对应 scope 与 DataSource，回收状态；
- **保留**：不销毁的场景（例如 Dialog `destroyOnClose=false`），scope 保留，下次可见时数据仍在。

---

## 5. Page Runtime 如何管理接口

接口管理由 Page Runtime 内的 **DataSourceManager** 承担，遵循 [DataSource 设计](/architecture/datasource) 中的分层：

### 5.1 声明

DataSource 在 Schema 中以 `dataSources` 字段声明，附着于 `a2-page`（或任意容器）节点。声明是 **纯数据**，不含 JS 函数。

```json
{
  "id": "orderPage",
  "type": "a2-page",
  "dataSources": {
    "orderList": {
      "kind": "http",
      "request": { "url": "/api/orders", "method": "GET" },
      "pagination": { "enabled": true, "pageSize": 20 },
      "cache": { "enabled": true, "ttl": 60000 },
      "auto": true
    }
  }
}
```

### 5.2 执行

- **transport 可插拔**：默认 `fetch`；宿主可注入自定义 transport（axios / MCP client / GraphQL）；
- **调度**：Page Runtime 在 `onMounted` 时按 `auto: true` 触发首屏拉取；
- **状态写入**：请求成功 → `data.$ds.<id>.data = ...`；失败 → `data.$ds.<id>.error = ...`；期间 `status` 依次转换 `loading → success / error`。

### 5.3 组件消费

- 通过 `bindings: { dataSource: { type: 'datasource', value: 'orderList' } }` 拿到 `DataSourceState`；
- 组件只关心 `state.data / state.status / state.meta`，不关心「谁在什么时候发的请求」。

### 5.4 治理能力

- **Cache**：key 由 `{ id, params, body, page, sort, filter }` 组合，TTL 内命中缓存跳过 transport；
- **Retry**：可重试错误（网络 / 5xx）按 `retry: { count, backoff, delay }` 退避重试；
- **Debounce**：Search / Filter / Sort 连续变更时按默认 300ms 合并请求；
- **依赖**：`refreshOn: ['detail.id']` 声明式依赖，被依赖字段变更时自动 refresh。

### 5.5 与协议的对接

- 新绑定类型：`BindingConfig.type: 'datasource'`；
- 新动作类型：`ActionConfig.type: 'datasource'`；
- 新节点字段：`A2Node.dataSources: Record<string, DataSourceConfig>`。

三者均为 **可选新增**，老 Schema 无一使用即行为等价（见「向后兼容」章节）。

---

## 6. Page Runtime 如何管理分页

分页是 DataSource 的一等能力，Page Runtime 不为 Pagination 组件单独维护状态。

### 6.1 声明

在 DataSource 上声明 `pagination` 配置：

```json
"pagination": {
  "enabled": true,
  "mode": "page",              // "page" | "cursor"
  "pageSize": 20,
  "paramsMap": { "page": "pageNum", "pageSize": "size" }
}
```

### 6.2 状态

分页状态放在 `data.$ds.<id>.meta` 内：

```
{ total, page, pageSize, hasMore, cursor?, nextCursor? }
```

### 6.3 组件消费

- `a2-pagination` 通过 `bindings.dataSource` 拿到状态；
- 用户切页 / 换页大小时 emit 事件；
- `a2-pagination` 的 Actions 声明 `type: 'datasource', op: 'setPage' / 'setPageSize'`，Page Runtime 收到后合并 params 并触发一次 refresh。

### 6.4 与 Table 的联动

- `a2-table` 与 `a2-pagination` 绑到 **同一个 DataSource**，即完成联动；
- 排序变化：`a2-table` emit `sortChange` → `type: 'datasource', op: 'setSort'`，同样 refresh；
- Table 与 Pagination 之间没有直接通信，全部通过 DataSource 状态。

### 6.5 分页模式兼容

- `page` 模式：`page + pageSize + total` 语义；
- `cursor` 模式：`cursor + nextCursor + hasMore` 语义（用于流式 / 无限滚动）；
- 组件根据 `pagination.mode` 自适应展示（组件层选择）。

---

## 7. Page Runtime 如何管理刷新

刷新是 Page Runtime 的核心命令之一。它有 **三种触发通道**、**两种刷新语义**。

### 7.1 三种触发通道

- **Action 触发**：组件通过 `ActionConfig.type: 'datasource', op: 'refresh'` 声明，用户点击刷新按钮即触发；
- **命令式触发**：宿主调用 `a2uiRoot.refreshDataSource('orderList')`；
- **声明式触发**：DataSource 的 `refreshOn: ['detail.id']` 字段声明依赖，被依赖字段变化时自动 refresh。

### 7.2 两种刷新语义

- **首次加载**：`status: idle → loading`，无旧数据；
- **刷新**：`status: success → refreshing → success / error`，保留旧数据供 UI 展示（避免闪烁）。

### 7.3 刷新调度

- 连续 refresh 请求会被合并：DataSource 有一个「in-flight」标记，同参数请求命中时复用 Promise；
- 参数变化的 refresh 会取消上一次 in-flight 请求的写回（AbortController 或 stale flag 处理）；
- Search / Filter / Sort 连续变更时按 debounce 合并，最后一次生效。

### 7.4 与 Cache 协作

- refresh 会走「先看 Cache（若允许）→ 未命中或 stale 才发请求」的流程；
- `refresh({ force: true })` 强制跳过 Cache；
- Cache 失效策略：TTL 到期、显式 invalidate（Action / 命令式）、依赖字段变化触发。

### 7.5 页面级刷新

- 单独 DataSource：`refreshDataSource(id)`；
- 整个 Page：`refreshPage(pageId)`（内部对该 page 下所有 DataSource 逐个 refresh）；
- 全局：Page Runtime 不提供整应用刷新，宿主可自行 `unmount + mount` A2UIRoot。

---

## 8. Page Runtime 如何管理 Dialog

Dialog / Drawer 的可见性、生命周期、内部子树的挂载由 Page Runtime 统一编排。

### 8.1 状态存放

- Dialog 可见性存放在所在 Page Scope 的 `dialogs.<name>.visible`；
- Drawer 同理：`drawers.<name>.visible`；
- 与业务字段（如 `detail.id`）共存于 Page Scope。

### 8.2 声明

```json
{
  "id": "createDialog",
  "type": "a2-dialog",
  "props": { "title": "新建工单", "width": "sm", "destroyOnClose": true },
  "bindings": {
    "visible": { "type": "path", "value": "./dialogs.create.visible" }
  }
}
```

### 8.3 打开 / 关闭

有 **三种表达方式**（择一即可）：

- **Action + emit（现有）**：`{ event: 'click', type: 'emit', payload: { action: 'openCreate' } }`；宿主 handleMessage 后 `updateData` 修改 visible；
- **Action + dialog（新增语法糖）**：`{ event: 'click', type: 'dialog', payload: { op: 'open', target: 'create' } }`；Page Runtime 直接就地写 visible，无需宿主参与；
- **命令式**：`a2uiRoot.openDialog(pageId, name)`。

三者协议保留，宿主可自选。**默认推荐 emit 模式**，与现有 Form 风格一致；`dialog` 是 Page Runtime 提供的便利分支。

### 8.4 生命周期与销毁

- `destroyOnClose: true`：`visible=false` 时 unmount 子树，其中的 DataSource 也随 scope 一起销毁；下次打开重新初始化，适合「新建 / 编辑」等每次都需要新表单的场景。
- `destroyOnClose: false`：保留子树，DataSource 状态保留；适合「详情预览」等需要保持滚动位置的场景。

### 8.5 与表单 / DataSource 的编排

典型「新建工单」流程：

1. 用户点击「新建工单」按钮 → Action `openCreate`；
2. Page Runtime 修改 `dialogs.create.visible = true`；
3. Dialog 挂载，内部子树的 `a2-text-field` 生效，`data.form.*` 收集用户输入；
4. 用户点击「确认」按钮 → Action `submitCreate`；
5. 宿主 handleMessage 后 `await api.createOrder(formData)`；
6. 宿主 `refreshDataSource('orderList')` 触发列表刷新 + `updateData({ dialogs: { create: { visible: false } } })` 关闭对话框；
7. Dialog `destroyOnClose=true` 时子树销毁，`data.form.*` 复位。

Page Runtime 不承担步骤 5-6（业务逻辑仍由宿主处理），只负责步骤 2、7 的 scope 与 DataSource 生命周期。

### 8.6 Drawer

Drawer 与 Dialog 结构完全相同，唯一差异是默认 `placement: 'right'`。Page Runtime 用同一套逻辑（`drawers.<name>.visible`）管理。

---

## 9. Page Runtime 内部组成

Page Runtime 由若干职责单一的子模块组成：

- **PageContext**：单个 `a2-page` 对应的作用域上下文；
- **DataSourceManager**：DataSource 生命周期与状态调度；
- **DialogManager**：Dialog / Drawer 可见性与销毁；
- **ActionRouter**：处理 `type: 'datasource' / 'dialog' / 'drawer'` 等新增 Action 类型（不影响现有四种）；
- **AuditSink**（可选）：与 [security.md](/guide/security) 中的观测接口对齐，暴露 `pageRuntime.debug` 事件；
- **Bridge**：与 A2UIRoot 之间的桥接，包括「MessageProcessor 回调 fan-out」「向 RenderContext 挂 pageRuntime」两件事。

以上模块只在存在 `a2-page` 或 `dataSources` 声明时被激活；否则 A2UIRoot 表现与现有版本完全一致。

---

## 10. 与 Page Schema 的映射

Page Runtime 消费的 Schema 遵循 [page-schema.md](/architecture/page-schema)：

- 顶层 `a2-page` 携带 `dataSources` 与命名 slot（`header / search / toolbar / content / pagination / footer`）；
- 内部模块（`a2-search / a2-toolbar / a2-table / a2-pagination / a2-dialog / a2-drawer / a2-description / a2-tabs`）通过 `bindings / actions` 与 DataSource / Page Scope 交互。

Page Schema 中的每个模块都是普通 A2UI 组件（走 [组件开发规范](/architecture/component-development)），Page Runtime 只是它们的「上下文提供者」。

---

## 11. 向后兼容

Page Runtime 上线时的兼容约束：

- **协议层**：
  - `BindingConfig.type` 保留 `literal / path / expression`；新增 `datasource` 为可选值；
  - `ActionConfig.type` 保留 `emit / callback / navigate / api`；新增 `datasource / dialog / drawer` 为可选值；
  - `A2Node` 新增 `dataSources / scope` 均为可选字段；
  - 老 Schema 无任一新字段时行为完全等价。
- **Runtime 层**：
  - 未声明 `dataSources` 且未使用 `a2-page` 的 Schema：Page Runtime 不被激活，A2UIRoot 表现与旧版一致；
  - 未使用 `type: 'datasource' / 'dialog'` 的绑定与动作：走既有 `resolveBinding / executeAction` 分支；
  - `RenderContext` 新增可选 `pageRuntime`：Renderer 与其他模块不强依赖。
- **组件层**：
  - 现有 16 个内置组件不变，Form Runtime 场景不受任何影响；
  - Page 级新组件（Table / Dialog 等）都是新增，注册到 `componentMap` 即用。
- **宿主层**：
  - `A2UIRoot.processMessage / streamUrl / updateData / updateTree / getFormData` API 全部保留；
  - 新增可选 API：`refreshDataSource / openDialog / closeDialog / getPageState`；
  - 宿主不订阅这些 API 时无任何行为变化。
- **测试保底**：所有当前 Playground 示例与 Form 类 Schema 在启用 Page Runtime 的构建下渲染与交互结果必须一致。

---

## 12. 不修改现有 Runtime 的落地策略

以下措施保证 **现有 Runtime 主干代码不动**：

- Page Runtime 作为独立模块，落地在 `packages/a2ui-vue-engine/src/page-runtime/`（未来位置）；
- A2UIRoot 内部添加 **懒创建** 逻辑：只有当接收到含 `dataSources` 或 `a2-page` 的 Schema 时才 `new PageRuntime()`；
- `mapper/binding.ts` 与 `renderer/renderNode.ts` 各追加一个 switch 分支（`datasource` / `dialog` / `drawer`），既有分支不动；
- `MessageProcessor` 与 `renderTree / renderNode` 主流程零改动；
- `componentMap.ts` 追加若干 Page 级组件注册即可，等同新组件开发流程。

以上均为 **additive 变更**——从代码 diff 角度看只有「新增文件 + 若干处新增行」。

---

## 13. 设计原则回顾

- **叠加而非替换**：Page Runtime 是 Form Runtime 之上的一层，不动内核；
- **协议驱动**：所有页面级能力通过 Schema 声明，宿主 / AI 都可以生成；
- **数据单源**：所有状态最终落到 `A2UIRoot.data`，Page Runtime 不建第二个响应式容器；
- **模块解耦**：Renderer 不感知、MessageProcessor 不感知、组件不强绑定；
- **传输解耦**：DataSource 的 Transport 可插拔，宿主可注入 fetch / axios / MCP / GraphQL；
- **可组合**：Search + Table + Pagination + Dialog + Drawer + Description + Card + Tabs 之间通过 Action + DataSource 松耦合；
- **可回放**：Page Runtime 的所有状态变化、Action 触发、DataSource 请求都可被观测与日志；
- **向后兼容**：老 Schema 不需要修改；Form 场景零影响；协议只增不改。

---

## 14. 参考实现落地锚点（未来实现时）

以下路径为未来落地锚点，当前 **不存在**，也不涉及本文档要求的任何代码改动：

- 新增：`packages/a2ui-vue-engine/src/page-runtime/PageRuntime.ts`
- 新增：`packages/a2ui-vue-engine/src/page-runtime/DataSourceManager.ts`
- 新增：`packages/a2ui-vue-engine/src/page-runtime/DialogManager.ts`
- 新增：`packages/a2ui-vue-engine/src/page-runtime/ActionRouter.ts`
- 新增：`packages/a2ui-vue-engine/src/page-runtime/scope.ts`
- 扩展：[types/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/types/index.ts)（新增可选 `dataSources / scope`、`RenderContext.pageRuntime`、`SecurityConfig` 等联合类型）
- 扩展：[mapper/binding.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/mapper/binding.ts)（`resolveBinding` 追加 `datasource` 分支）
- 扩展：[renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts)（`executeAction` 追加 `datasource / dialog / drawer` 分支）
- 扩展：[root/A2UIRoot.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/root/A2UIRoot.vue)（懒创建 PageRuntime、`defineExpose` 追加 Page 级命令式 API）
- 扩展：[components/componentMap.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/componentMap.ts)（追加 Page 级组件注册）

以上均为 **新增或 additive 扩展**。落地时严格遵循「协议不改 / 现有分支不动」原则。

---

_本文档为设计文档；不涉及任何代码或协议改动。落地节奏建议对齐 [Roadmap V2](/architecture/roadmap#v2-crud-页面)。_
