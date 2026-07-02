# A2UI Runtime 数据流

> 汇总文档，基于前四篇：
> - [runtime-map.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/runtime/runtime-map.md)
> - [renderer-flow.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/runtime/renderer-flow.md)
> - [message-flow.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/runtime/message-flow.md)
> - [component-registry.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/runtime/component-registry.md)
>
> 只做数据流汇总，不重复分析模块内部。

---

## 1. 完整数据流路径

A2UI Runtime 的数据流是一条 **单向 + 反馈闭环** 的通路：

```
JSON → Parser → Tree → Renderer → Component → Event → Message → State
                                                                  │
                                                                  └─► 回到 Renderer（下一轮渲染）
```

对应到本 Runtime 的具体模块：

```
JSONL / A2Message              ← 服务端 / 宿主 / Agent 下发
        │
        ▼
[MessageProcessor.processChunk / processStream]     ← Parser
        │  onNode / onData / onError / onComplete
        ▼
[flatToTree.convertFlatToTree]（若为扁平）           ← Schema Parser 适配层
        │
        ▼
[A2UIRoot 内部 tree / data / flatNodes]              ← State（响应式源）
        │
        ▼
[renderTree → renderNode]                            ← Renderer
        │  查表 componentMap[type]
        ▼
[ComponentRegistry] → Vue Component                  ← Component
        │  h(component, resolvedProps, slots)
        ▼
DOM / 用户交互
        │  emit('click' / 'update:modelValue' / …)
        ▼
[renderNode 事件桥接：createEventHandlers / executeAction / setPathValue]  ← Event
        │
        ├─► onEvent('dataUpdate', …)  ── setPathValue 直接原地写回 A2UIRoot.data
        └─► A2UIRoot.handleEvent → emit('message', A2Message)              ← Message
                        │
                        ▼
                    宿主 / Agent 处理
                        │  processMessage / updateData / updateTree
                        └─► 回到 MessageProcessor 或 State，触发下一轮 Renderer
```

---

## 2. 每一步的输入输出

| # | 步骤 | 输入 | 输出 | 位置 |
|---|------|------|------|------|
| 1 | **JSON 进入** | JSONL 字符串 或 单条 `A2Message` 对象 | 送入 `MessageProcessor` | A2UIRoot `processMessage / streamUrl` |
| 2 | **Parser** | JSONL chunk / `Response` 流 | 逐行 `A2Message`，同步分发到 `onNode / onData / onAction / onError / onComplete` | `MessageProcessor.processChunk / processStream` |
| 3 | **Schema 适配（可选）** | 扁平 `FlatA2Node[]` | 树形 `A2Node`（含 `props / bindings / actions / children`） | `flatToTree.convertFlatToTree` |
| 4 | **State（Tree/Data）落地** | `A2Node` 或 `data.path / value` | A2UIRoot 内部响应式 `tree.value` / `data.value` 变更 | A2UIRoot 中 `onNode / onData` 回调 |
| 5 | **RenderContext 组装** | `data`、`componentMap`、`onEvent` | `RenderContext` | `createRenderContext`（renderTree.ts） |
| 6 | **Renderer 遍历** | `A2Node` 树 + `RenderContext` | `VNode[]` | `renderTree → renderNode` |
| 7 | **Registry 查表** | `node.type` | `Vue Component`（未命中 → fallback） | `context.componentMap[type]` |
| 8 | **Bindings 解析 & Props 合并** | `props + bindings + data` | `resolvedProps` | `mapper/binding.ts.resolveProps` |
| 9 | **Actions 编译** | `node.actions[]` | Vue 的 `on{Event}` 处理器 | `renderNode.createEventHandlers` |
| 10 | **组件渲染** | `component + resolvedProps + slots/children + eventHandlers` | 挂载到 DOM 的 VNode | Vue 3 patch |
| 11 | **用户交互 / 事件** | DOM 事件 | 组件 emit（`click / update:modelValue / …`） | 内置组件 |
| 12 | **v-model 反向写回** | 组件 emit 的新值 | 原地 `setPathValue(data, path, value)` | `renderNode` 内的 `onUpdate:modelValue` |
| 13 | **Action 执行** | `ActionConfig`、事件对象、`ComponentContext` | `emit / callback / navigate / api` 四种副作用 | `renderNode.executeAction` |
| 14 | **Message 上抛** | 事件与 payload | `emit('message', { type:'action', action, payload })` 到宿主 | `A2UIRoot.handleEvent` |
| 15 | **宿主处理** | `message` | 宿主决定是否调用 `updateData / updateTree / processMessage` | 宿主应用 |
| 16 | **回环** | 新 tree / data / 新消息 | 触发第 4-6 步再次执行 | A2UIRoot / MessageProcessor |

---

## 3. 哪些是同步，哪些是异步

### 同步部分

- **Parser 内部**：`processChunk` 是同步的，一段 chunk 内的所有完整消息按顺序同步分发到回调；
- **消息路由**：`handleMessage → handleNodeMessage / handleDataMessage / …` 全部同步；
- **flatToTree**：`convertFlatToTree` 是纯同步的树构造；
- **State 写入**：`tree.value = ...` / `setPathValue(data, path, value)` 都是同步赋值；
- **Renderer 全流程**：`renderTree → renderNode`（查表、Props 合并、Actions 编译、slot 构造、`h(...)` 生成 VNode）都是同步纯函数；
- **Bindings 解析**：`resolvePath / evaluateExpression / transformValue / resolveProps` 均同步；
- **Actions 内 `emit / callback / navigate`**：均同步执行（`navigate` 走 `window.location`）；
- **Registry 查表与注册**：`componentMap[type]` / `registerComponent` 全部同步。

### 异步部分

- **`processStream(Response)`**：从 `Response.body.getReader()` 逐块读取，是 `async` 循环；每个 chunk 内部处理仍是同步；
- **Vue 组件的挂载 / 更新**：Vue 3 的调度是微任务级异步，Renderer 交出 VNode 后由 Vue 自己 patch；
- **Action `type: 'api'`**：Runtime 层只是 `emit('api', …)` 同步上抛；实际 HTTP 请求发生在宿主，天然异步；
- **异步组件**（`() => Promise<{ default }>`）：Registry 允许注册异步加载函数，Vue 的 `defineAsyncComponent` 层完成异步实例化；
- **响应式更新的传播**：`data` 变化后，依赖它的 `computed`（如 A2UIRoot 中的 `renderContent`）在下一次 tick 才重新计算，非严格同步。

### 半同步：`processMessage`

A2UIRoot 的 `processMessage` 内部 `processor.processChunk(JSON.stringify(message) + '\n')`，本身是同步的；但产生的 State 变更走 Vue 响应式，Renderer 的下一轮渲染是异步 tick。

---

## 4. 哪些地方可以扩展 Table / Chart / Dialog

Runtime 的扩展点在数据流中共有 4 个位置，绝大多数新组件（Table / Chart / Dialog / Drawer / Description / Tabs / Timeline / Tree / Dashboard 等）只需要触碰其中 1-2 个：

| 扩展点 | 位置 | 覆盖场景 |
|--------|------|---------|
| **ComponentRegistry 注册** | `defaultComponentMap` 追加 或 `registerComponent(type, comp)` 或 `A2UIRoot.componentMap` prop | 所有新组件的 **必选** 步骤 |
| **flatToTree 扁平字段映射** | `flatToTree.buildProps` 中新增分支（例如 `columns / dataSource / placement`） | 需要在扁平格式下声明时才需要 |
| **BindingConfig.type 扩展** | `mapper/binding.ts.resolveBinding` 新增分支（例如未来的 `datasource`） | 新增绑定源类型（如 DataSource）时 |
| **ActionConfig.type 扩展** | `renderer/renderNode.ts.executeAction` 新增分支（例如未来的 `datasource / mcp`） | 新增动作语义（如触发 DataSource refresh、调用 MCP tool）时 |

### 分类举例

- **纯展示组件（Chart / Description / Timeline / Icon）**：
  - 只需扩展点 1（Registry 注册）；
  - 数据通过既有 `bindings` 机制注入 props；
  - 无自定义 Action 需求。
- **容器组件（Dialog / Drawer / Tabs / Card 变体）**：
  - 扩展点 1（Registry 注册）；
  - 若要在扁平格式下声明，扩展点 2（flatToTree）；
  - 若引入了「显式子节点渲染」，需要在组件内部按现有惯例 import renderNode，并在 [SELF_RENDER_CHILDREN_TYPES](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts#L6-L14) 白名单登记。
- **数据密集型组件（Table / Tree / Dashboard）**：
  - 扩展点 1；
  - 若接入 DataSource，需要在扩展点 3（新绑定类型）与扩展点 4（新动作类型）分别追加分支；
  - 组件内部走标准 v-model 与 `emit` 惯例，事件通过既有 Actions 通道上抛。

### 数据流位置对照

- 扩展点 1、2 影响的是 **步骤 4-6**（State 落地 → Registry 查表）；
- 扩展点 3 影响的是 **步骤 8**（Props/Bindings 合并）；
- 扩展点 4 影响的是 **步骤 13**（Action 执行）。

**没有任何新组件需要修改** 步骤 2（Parser）、步骤 6（Renderer 主流程）、步骤 11-12（v-model 反向写回）、步骤 14（Message 上抛）。

---

## 5. Runtime 的核心瓶颈点

从数据流角度识别的瓶颈点，全部落在 **A2UIRoot 与 Renderer 交界处** 与 **协议路径统一** 两个方面。以下只做定位，不重复分析成因（详见前四篇与技术债清单）。

- **瓶颈 P1 · 整树重渲染**：A2UIRoot 内的 `renderContent = computed(() => defineComponent({...}))` 每次 `tree / data` 变化都返回新组件构造，触发外层 `<component :is=...>` 走 unmount → mount 而非 patch——Streaming（每秒多次推送）场景下重挂载成本高、破坏组件内部状态（focus / 动画）。
- **瓶颈 P2 · Message 消息通道漏斗**：所有事件（业务 Action + 内部 `update:modelValue` 产生的 `dataUpdate`）都汇入 `A2UIRoot.handleEvent` 并以同一份 `type: 'action'` emit 出去，宿主要在应用层过滤——高频输入 / Streaming 下噪声严重。
- **瓶颈 P3 · Renderer ↔ 容器组件循环依赖**：`SELF_RENDER_CHILDREN_TYPES` 白名单 + 容器组件反向 `import renderNode` 形成循环依赖，阻碍未来 SSR、按需异步加载、tree-shaking。
- **瓶颈 P4 · flatToTree 中心化组件私有配置**：`buildProps` 内含 20+ 组件的 if-else，新增组件必须改中心文件，违背「新组件不改 Runtime」承诺；随组件数量线性膨胀。
- **瓶颈 P5 · 全局扁平 `data` 命名空间**：无作用域概念，多 `a2-page` 嵌套 / 多 Agent 共享 Runtime 时 id 冲突不可控。
- **瓶颈 P6 · 路径协议不统一**：`MessageProcessor.setNestedValue`（仅 `.`）、`renderNode.setPathValue`（`.` + `[n]`）、`resolvePath`（`.` + `[n]`）、`extractFormDataPaths`（`/form/…` 正则）四套并存——DataSource 加入后混乱加剧。
- **瓶颈 P7 · Expression / Callback 求值裸奔**：`resolveBinding` 的 `expression` 与 `executeAction` 的 `callback` 走 `new Function`——AI 生成场景直接 XSS。

以上均已进入 [tech-debt.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/tech-debt.md) 清单。

---

## 6. 设计优势

从整条数据流回看，A2UI Runtime 呈现以下优势：

- **协议单一入口**：所有外部数据（服务端 / AI / 宿主）都必须以 `A2Message` 进入，Parser 提供统一路由；数据流的「口」只有一个。
- **纯函数式 Renderer**：`renderTree / renderNode` 无状态，相同 `tree + context` → 相同 VNode；便于快照、缓存、SSR、单测。
- **状态单源 + 显式回写**：`A2UIRoot.data / tree` 是唯一响应式源，`data → props` 自动、`event → data` 通过 `setPathValue` 显式，可预测。
- **模块解耦**：MessageProcessor 不 import Renderer；Renderer 不 import Registry 的默认 map；Registry 不 import 组件适配层——每一层只通过接口通信。
- **Registry 极简**：`type → Component` 一张表，注册 / 覆盖 / 异步加载都可以「一行搞定」，符合「对扩展开放、对修改封闭」。
- **增量协议**：`node / node_update / node_append / node_remove / data / data_update` 支持局部更新，Parser 侧无需整树重建；剩下的性能损耗只在 A2UIRoot 层的 `computed`（见瓶颈 P1）。
- **Fallback 优先**：未知 `type` 用 `renderFallback` 占位而非白屏——AI 生成 Schema 时的鲁棒兜底。
- **回环清晰**：Event → Message → State → Renderer 的闭环是 **可下发、可日志、可回放** 的纯数据链路；同样便于宿主接管 AI Agent 决策。
- **扩展点稀少**：新组件的接入面 **只有 1-2 处**（Registry ± flatToTree），极大降低学习曲线与出错概率。

---

## 7. 风险点

以下风险由数据流特性衍生，仅做汇总（详情与偿还路径见 [tech-debt.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/architecture/tech-debt.md)）：

- **[P0] 安全**：Parser 侧未做任何字段校验；表达式 / callback 直接 `new Function`。AI Native / 多租户场景下攻击面直接暴露。
- **[P1] 事件通道模糊**：内部 `dataUpdate` 与业务 `action` 共用 message 通道，语义混淆并产生高噪声。
- **[P1] 循环依赖**：容器组件 `import renderNode` + `SELF_RENDER_CHILDREN_TYPES` 白名单，阻碍未来 SSR / 惰性加载。
- **[P1] State 无作用域**：全局扁平 `data`，多页面 / 多 Agent 场景易冲突。
- **[P1] flatToTree 中心化**：随组件数量爆炸，未来 20+ 组件后不可维护。
- **[P1] 路径协议分裂**：Parser / Renderer / Bindings / 表单抽取四套路径语法不一致。
- **[P1] 整树重挂载**：`renderContent` 每次重建 `defineComponent`，Streaming 场景性能与体验双损。
- **[P2] 观测缺失**：错误只走 `console.warn/error` + 单一 `error` emit，无 trace / 无分级 / 无面板；大 Schema 与 AI 生成场景排障困难。
- **[P2] 事件双通道**：内置组件同时 emit 原生事件与 `action` 兜底事件，`action` payload 结构不规范。
- **[P2] 树形 vs 扁平字段命名分裂**：AI 生成时选择困难；未来废弃其一时迁移成本高。
- **[P2] Intent 缺席**：`A2Message.type` 没有「意图」一等公民，Agent 表达思考 / 澄清只能借道 Toast / Timeline。

---

_本文档仅汇总数据流视图，不重复各模块内部机制。模块细节请回到对应的四篇 flow 文档。_
