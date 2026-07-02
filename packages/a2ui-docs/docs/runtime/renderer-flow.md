# Renderer 流程

> 分析范围：`packages/a2ui-vue-engine/src/renderer/`
> 仅分析 Renderer 模块本身；对其他模块只做「输入 / 输出边界」层面的引用，不展开其内部。

---

## 1. Renderer 做什么

Renderer 是 A2UI Runtime 中 **把协议节点转成 Vue VNode** 的纯函数式模块。它只做四件事：

- **查表**：按 `A2Node.type` 从 `context.componentMap` 中查到具体 Vue 组件；
- **组装 props**：合并静态 `node.props`、`context.globalProps`，并调用 Bindings 解析 `node.bindings` 得到最终 props；
- **桥接事件**：把 `node.actions[]` 编译为 Vue 事件监听器；对声明了 `bindings.modelValue` 的节点自动附加 `onUpdate:modelValue`，把值就地写回 `context.data`；
- **递归渲染子节点**：将 `node.children` / `node.slots` 转成 slots 或作为 props 传递给自渲染型容器组件。

Renderer **不持有任何状态**，同样的 `tree + context` 每次调用得到同样的 VNode 集。它也不感知 `A2UIRoot` 或消息协议，只面向 `A2Node / RenderContext` 两个数据契约工作。

Renderer 由三个文件构成：

- [renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts) —— 单节点渲染核心（`renderNode / createEventHandlers / executeAction / renderSlots / renderChildren / renderFallback / setPathValue`）；
- [renderer/renderTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderTree.ts) —— 树遍历与上下文工具（`renderTree / renderTreeFragment / renderTreeWithRoot / createRenderContext / updateRenderContextData / mergeRenderContext`）；
- [renderer/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/index.ts) —— 对外统一导出。

---

## 2. 输入是什么（JSON / Tree / Node）

Renderer **不吃 JSON**，也 **不吃扁平 Schema**——它的输入已经是被上游转好的 `A2Node` 与 `RenderContext`。

### 输入 1：A2Node / A2Node[]

`renderTree(tree, context)` 接受 `A2Node | A2Node[]`；`renderNode(node, context)` 接受单个 `A2Node`。节点结构（参见 Types）：

```ts
interface A2Node {
  id: string
  type: string                                   // 组件类型，如 'a2-card'
  props?: Record<string, any>                    // 静态 props
  children?: A2Node[] | string                   // 子节点或纯文本
  bindings?: Record<string, BindingConfig>       // 数据绑定
  actions?: ActionConfig[]                       // 事件动作
  slots?: Record<string, A2Node[]>               // 命名 slot
}
```

### 输入 2：RenderContext

```ts
interface RenderContext {
  data: Record<string, any>                      // 全局响应式数据（响应式性由上游维护）
  componentMap: ComponentMapper                  // type → Vue 组件 的映射
  globalProps?: Record<string, any>              // 每个节点默认合并的 props
  onEvent?: (event, payload, ctx) => void        // 事件出口
}
```

上下文由 `createRenderContext(data, componentMap, options)` 构造，可通过 `updateRenderContextData / mergeRenderContext` 派生新上下文。

### 不作为 Renderer 输入的东西

- JSON / JSONL 字符串（由上游解析层处理）；
- 扁平 `FlatA2Node[]`（由上游转树层处理）；
- 生命周期回调（Renderer 不订阅）。

---

## 3. 输出是什么（VNode / Component）

### 主输出：VNode

- `renderNode(node, context)`：返回 `VNode | null`（`null` 表示未渲染，如 componentMap 未命中且未落入 fallback 分支）。
- `renderTree(tree, context)`：返回 `VNode[]`（过滤掉 null）。
- `renderTreeFragment(tree, context)`：返回一个包裹 `Fragment` 的 `VNode`，便于作为单个渲染结果嵌入。
- `renderTreeWithRoot(tree, context, rootTag = 'div')`：返回一个带根标签（默认 `div.a2-root`）的 `VNode`。

### 附输出：Component 工厂

- `createRenderFunction(node, context)`：把一个节点包裹为一个 Vue 组件 `defineComponent({ name: 'A2<Type>', setup: () => () => renderNode(node, context) })`——用于需要「组件实例」而不是「VNode」的场景。

### VNode 携带的元数据

每个 VNode 附加两个属性，便于调试与 e2e 定位：

- `data-a2-id`：`node.id`
- `data-a2-type`：`node.type`

### 未知组件的 Fallback

当 `context.componentMap[node.type]` 不存在时，`renderNode` 打出 `console.warn` 并降级为：

```html
<div class="a2-fallback" data-a2-id="..." data-a2-type="...">
  Unknown component: {type}
</div>
```

---

## 4. 渲染流程（步骤拆解）

以下步骤全部发生在 Renderer 内部，代码位置集中在 [renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts) 与 [renderer/renderTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderTree.ts)。

**Step 1 · 入口分发**

- 若上游传入的是数组：`renderTree` 依次对每个节点调用 `renderNode`，收集为 `VNode[]`，过滤 `null`；
- 若是单节点：直接进入 `renderNode`。

**Step 2 · 组件查表**

- `component = componentMap[node.type]`；
- 未命中：`console.warn` + 返回 `renderFallback(node)`；
- 命中：进入后续步骤。

**Step 3 · 解析 props**

- 合并静态：`{ ...globalProps, ...node.props }`；
- 调用 Bindings 的 `resolveProps(mergedProps, node.bindings, context.data)` 得到 `resolvedProps`。

**Step 4 · 构造 ComponentContext**

- 为该节点构造一份 `ComponentContext`：`{ node, data, path: [node.id], emit, resolveBinding, executeAction }`；
- 该上下文只在事件与动作执行时使用。

**Step 5 · 编译 Actions 为事件监听**

- 遍历 `node.actions`，通过 `createEventHandlers` 生成 `on{Event}` 形状的处理器（`event = 'click'` → 键 `onClick`）；
- 每个处理器内部调用 `executeAction(action, event, componentContext)`：
  - `type: 'emit'` → `componentContext.emit(action.event, action.payload)`；
  - `type: 'callback'` → `new Function('return ' + action.handler)()(payload, event, ctx)`；
  - `type: 'navigate'` → `window.location.href / replace`；
  - `type: 'api'` → `componentContext.emit('api', { action, payload, event })`。

**Step 6 · 挂载 v-model 反向写入**

- 若 `node.bindings?.modelValue?.type === 'path'`：额外注入 `onUpdate:modelValue = value => setPathValue(data, bindingPath, value)`，并额外触发 `onEvent('dataUpdate', { path, value }, ctx)`。
- `setPathValue` 支持形如 `form.name` / `items[0].name` 的路径（`.` + `[n]` 语法）。

**Step 7 · 决定 children 传递方式**

- Renderer 内维护白名单 `SELF_RENDER_CHILDREN_TYPES = ['a2-text-field', 'a2-card', 'a2-row', 'a2-column', 'a2-list', 'a2-button', 'a2-option-card']`；
- 若 `node.type` 在白名单中：把 `children` / `slots` / `context` 以 **props** 传给组件，由组件内部自行递归；
- 否则：调用 `renderSlots(node, context)` 把 `children` 与命名 slots 编译为 Vue slots；
  - `children` 是字符串 → 直接作为默认 slot 内容；
  - `children` 是数组 → 通过 `renderChildren` 递归 `renderNode` 每个子节点为默认 slot。

**Step 8 · 生成 VNode**

- 调用 Vue 的 `h(component, { ...resolvedProps, ...childrenProps, ...eventHandlers, 'data-a2-id': node.id, 'data-a2-type': node.type }, slots)`。

**Step 9 · 递归**

- 对于走 slots 的路径：Renderer 主动在 `renderChildren` 中对每个子节点再次执行 Step 1；
- 对于走 props 的路径：由容器组件自己在模板中调用 renderNode（该行为发生在组件层，Renderer 只把 `context` 一起传下去）。

---

## 5. 如何调用组件

调用组件的动作发生在 Step 8 的 `h(component, ...)`，具体规则如下：

- **组件本身**：来自 `context.componentMap[node.type]`——一个 Vue 组件对象或异步加载函数；Renderer 不关心组件是同步还是异步。
- **组件 Props**：由三部分合并（顺序即优先级）——
  1. `globalProps`（Context 级默认）
  2. `node.props`（Schema 静态声明）
  3. `resolveBinding(node.bindings)` 的结果（Bindings 解析产出）
- **组件的 children**：
  - 若组件在自渲染白名单中：以 `props.children`（`A2Node[]`）与 `props.context`（`RenderContext`）传入，组件模板内部自行渲染；
  - 若不在白名单中：以 Vue slots 形式传入，包括：
    - 默认 slot（`node.children`）
    - 命名 slots（`node.slots[name]`）
- **组件事件**：
  - Actions 声明的事件被编译为 `on{Event}` 处理器；
  - `bindings.modelValue` 存在时，额外注入 `onUpdate:modelValue`；
  - 组件其它未声明的 emit 事件会被 Vue 正常处理，Renderer 不做拦截。
- **组件唯一 key**：Renderer 依赖 `node.id` 唯一，通过 `data-a2-id` 提供给 DOM；Vue diff 层的 key 由容器组件（如 List / Card）在其模板中按 `child.id` 或 `index` 提供。

### `createRenderFunction` 的用途

`createRenderFunction(node, context)` 把一个节点封装成 **Vue 组件**（不是 VNode），返回值可用于：

- 动态挂载点（`<component :is="fn" />`）；
- 缓存复用节点渲染；
- 在某些框架 API 需要「组件」而不是「VNode」时的桥接。

---

## 6. 如何更新

Renderer **本身不订阅任何响应式源，也不主动触发更新**。更新是 Vue 3 响应式系统的自然结果，Renderer 的角色是「更新发生时，被再次调用一次」。

### 触发链路（在 Renderer 视角下）

- 上游把 `context.data` 或 `tree` 变更（无论是宿主 `updateData`、`update:modelValue` 反向写入、还是外部 `processMessage`），都会 **让依赖它们的 `computed / effect` 重算**；
- 当 `renderTree(tree, context)` 被再次调用时（例如 A2UIRoot 中的 computed 触发），Renderer 再次执行 Step 1 - Step 9，产出新的 VNode 树；
- Vue 使用新旧 VNode 做 diff / patch，Renderer 不参与此过程。

### 局部与整树

Renderer 自身没有「局部更新」概念——它每次都是 **对当前入参 tree 完整重算**。局部更新的效果来自：

- 上游只把 tree 中某个子节点替换（引用变），其余节点引用不变；
- Vue 的 diff 命中相同 VNode 类型 + 相同 key 时会走 patch 而非重建；
- 结合 `data-a2-id` 与容器组件里显式的 `key`，配合完成节点级复用。

### 内部反向写入是原地的

`onUpdate:modelValue` 通过 `setPathValue(data, path, value)` **原地修改** `context.data`。因为 `data` 由上游持有响应式（通常是 `ref`），修改后 Vue 会调度下一轮 render。Renderer 不需要显式通知任何人。

### 上下文变化

- `RenderContext` 变化（如 `data` 引用更新、`componentMap` 扩展、`onEvent` 换绑）时，上游需要再次调用 `renderTree`。
- `updateRenderContextData / mergeRenderContext` 提供不可变式派生方法，避免直接修改现有 context；这两个工具函数不会触发渲染，只帮助上游构造新 context。

---

## 7. 与 MessageProcessor 的关系

Renderer 与 MessageProcessor **没有直接调用关系**，只有间接的「共享数据契约」关系。

### 直接接口

- Renderer 不 `import` MessageProcessor；
- MessageProcessor 也不 `import` Renderer；
- 两者互不感知彼此的存在。

### 通过 A2UIRoot 间接协作

- MessageProcessor 输出：把 JSONL 消息解析为 `A2Node`（写入某处 tree）与 `data`（写入某处状态）；
- A2UIRoot 消费 MessageProcessor 的回调（`onNode / onData / ...`），把结果落到 `tree.value` 与 `data.value`；
- Renderer 消费 A2UIRoot 传入的 `tree + context.data`，产出 VNode。

Renderer 只关心「拿到的是合法的 `A2Node` 与 `RenderContext`」，不关心它们是「一次性传入」还是「流式生成」。

### 契约边界

- **共享类型**：`A2Node`、`RenderContext.data`（部分字段路径） —— 由 Types 层统一定义；
- **谁维护响应式**：不是 Renderer——响应式引用由 A2UIRoot 层持有；
- **消息回环**：Renderer 通过 `context.onEvent` 上抛的 `dataUpdate / 业务事件`，与 MessageProcessor 收到的新 `data` 消息是两条不同的输入通路，最终都收敛到 `A2UIRoot` 的 `data`/`tree` 上，再次触发 Renderer；对 Renderer 而言两者无差别。

---

_文档范围仅限 Renderer 模块。其他模块的实现与生命周期请参见 [Runtime 模块地图](/runtime/runtime-map)。_
