# Message 流程

> 分析范围：`packages/a2ui-vue-engine/src/core/MessageProcessor.ts`
> 仅分析 MessageProcessor 模块本身，不扩展到其他模块的内部实现。

---

## 1. MessageProcessor 的作用

MessageProcessor 是 Runtime 的 **协议解析入口**。它把外部推送的 JSONL 文本（一行一条 JSON）解析为强类型的 `A2Message`，按 `type` 路由到对应的处理逻辑，同时在内部维护一份 **节点索引 `nodeMap`** 与 **数据快照 `data`**，支持增量更新。

三件核心事项：

- **解析**：把 JSONL 字符串（可能是流式 chunk）切分为完整消息对象；
- **路由**：根据 `message.type` 分发到 `handleNodeMessage / handleDataMessage / handleActionMessage / handleErrorMessage / handleCompleteMessage`；
- **索引与增量**：维护 `nodeMap: Map<string, A2Node>` 与 `tree: A2Node | null`，支持 `node_update / node_append / node_remove` 局部更新，避免整树重建。

MessageProcessor **不感知 Vue、不订阅响应式、不构造 VNode、不执行动作**。所有副作用都通过构造时注入的回调外化（`options.onNode / onData / onAction / onError / onComplete`）——因此可以脱壳单测、可以被其他框架的 Runtime 复用。

主要 API：

- `new MessageProcessor(options)` / `createMessageProcessor(options)`：实例化
- `processChunk(chunk)`：处理一段 JSONL 字符串，返回本次解析出的消息数组
- `processStream(response)`：从 `Response.body.getReader()` 边读边解，直至流结束
- `getData() / getTree() / getNode(id)`：读取当前解析出的状态快照
- `reset()`：清空 `buffer / data / tree / nodeMap`
- 全局单例辅助：`getGlobalProcessor() / resetGlobalProcessor()`

---

## 2. Message 类型（如果有）

MessageProcessor 只处理形如 `A2Message` 的联合类型（由 Types 层定义），共 5 大类、9 种：

| Message.type | 用途 | 关键字段 |
|--------------|------|---------|
| `node` | 整树替换 | `node: A2Node`（新根节点） |
| `node_update` | 更新已存在节点 | `node: A2Node`（id 需已在 `nodeMap`） |
| `node_append` | 追加子节点 | `node: A2Node`、`parentId: string`、可选 `position: number` |
| `node_remove` | 删除节点 | `node: A2Node`（按 id 移除）、可选 `parentId` |
| `data` | 数据写入 | `path: string`、`value: any` |
| `data_update` | 数据更新 | 同 `data` |
| `action` | 动作透传 | `action: string`、可选 `payload` |
| `error` | 错误上报 | `code: string`、`message: string` |
| `complete` | 流结束 | `success: boolean` |

共同字段：`type / id / timestamp?`。所有类型都是 **纯数据**（JSON 可序列化），无函数、无循环引用。

MessageProcessor 内部对每条消息按上述类型走 `switch(message.type)` 分派，未识别的 `type` 会被静默跳过（不抛错、不落 `nodeMap`）。

---

## 3. Message 如何进入系统

MessageProcessor 提供两条入口：

### 3.1 `processChunk(chunk: string): A2Message[]`

同步入口，接收一段 JSONL 字符串。步骤：

1. 把 chunk 追加到内部 `buffer`；
2. 按 `\n` 切分为若干行；
3. 保留 **最后一段** 作为可能不完整的行（写回 `buffer`），其余行逐行 `trim()` + `JSON.parse()`；
4. 每解析出一条消息，先调用内部 `handleMessage(message)`，再收集到返回数组。

关键细节：

- **容忍流式**：不完整的最后一行会缓存在 `buffer`，等待下一次 chunk 拼接；
- **容忍空行**：`trim()` 后为空的行直接跳过；
- **容忍非法 JSON**：`JSON.parse` 抛错时 `console.error` 一次，继续处理后续行——单条脏消息不会阻塞流。

### 3.2 `processStream(response: Response): Promise<void>`

异步入口，直接消费 `fetch` 返回的 `Response`：

1. 通过 `response.body?.getReader()` 拿到 `ReadableStreamDefaultReader`；
2. `TextDecoder({ stream: true })` 边读边解码；
3. 每次读到的 chunk 传给 `processChunk`；
4. 流结束（`done = true`）后，若 `buffer` 仍有残余，尝试作为最后一条 JSON 解析；解析失败 `console.error`；随后清空 `buffer`。

`processStream` 是纯 Promise API，宿主可以 `await` 它以阻塞到流结束，也可以直接触发后异步等待。

### 3.3 谁在调用这些入口

在库源码内，`processChunk` 与 `processStream` 都由 A2UIRoot 触发（`processMessage` / `streamUrl`）。MessageProcessor 自身不订阅任何数据源——它需要被显式喂入。

---

## 4. 如何分发给 Runtime

MessageProcessor 的「分发」通过 **回调注入** 完成，不通过事件订阅、不通过全局总线。分发路径：

```
processChunk / processStream
        │
        ▼
   handleMessage(message)
        │
        ▼   switch(message.type)
        ├──► handleNodeMessage    ──► options.onNode(message)
        ├──► handleDataMessage    ──► options.onData(message)
        ├──► handleActionMessage  ──► options.onAction(message)
        ├──► handleErrorMessage   ──► options.onError(message)
        └──► handleCompleteMessage──► options.onComplete(message)
```

### 4.1 node 家族

`handleNodeMessage` 是 4 个子类型的合并处理器：

- `node`：将 `tree = node` 并把它记入 `nodeMap`；
- `node_update`：仅当 `nodeMap.has(node.id)` 时更新 `nodeMap` 与（若匹配）`tree`；否则不动；
- `node_append`：在 `parentId` 命中的父节点的 `children` 里 push 或按 `position` 插入；不合法（无 `parentId` / `parent.children` 非数组）静默跳过；
- `node_remove`：从 `nodeMap` 删除该 id，并从 `parentId` 命中的父节点 `children` 中剔除同 id 项。

处理完成后统一 `options.onNode?.(message)` 回调，让宿主感知一次「本次涉及节点」——注意宿主拿到的是 **原始 message**，不是变化后的 tree（tree 需要通过 `getTree()` 主动读取，或以自身持有的 tree 引用为准）。

### 4.2 data 家族

`handleDataMessage` 走 `setNestedValue(data, path, value)`——按 `a.b.c` 语法把 `value` 写入 `this.data`。然后触发 `options.onData?.(message)`。

### 4.3 action / error / complete

三者只做一件事：把原消息通过对应回调（`options.onAction / onError / onComplete`）转发给宿主。`error` 会额外 `console.error` 一次做本地可见。

### 4.4 没有回调时的行为

`options.onXxx?.()` 使用可选链，回调不存在时不做任何事。宿主未订阅某类事件时，MessageProcessor 内部状态仍然正常更新，只是外部无感知。

---

## 5. 如何触发更新

MessageProcessor **本身不是响应式系统**——它是一个「有状态但不响应式」的普通类。「触发更新」在它的视角里等价于「更新内部 `data / tree / nodeMap` 快照，并回调宿主」。

### 5.1 内部状态更新（同步）

- `node / node_update / node_append / node_remove` → 更新 `tree` 与 `nodeMap`；
- `data / data_update` → 走 `setNestedValue` 更新 `this.data`；
- 每条消息处理都是 **同步、原地** 的。

### 5.2 外部感知（通过回调）

宿主如果需要「让 UI 感知变化」，必须在注入的回调里做转接：

- 例如 A2UIRoot 在 `onNode` 里把 `message.node` 赋给自己的响应式 `tree`；
- 例如 A2UIRoot 在 `onData` 里触发一次 `data.value = { ...data.value }` 以扰动响应式。

MessageProcessor 不会主动调用 Vue 的响应式 API，也不 emit 任何事件。

### 5.3 增量 vs 整树

- 收到 `node` 时按 **整树替换** 语义处理；
- 收到 `node_update / node_append / node_remove` 时按 **增量** 语义处理（只改动命中的节点）；
- 收到 `data / data_update` 时按 **路径写入** 语义处理，`data` 保持累积（不会因新消息而清空）。

### 5.4 `reset()`

宿主可以调用 `reset()` 清空 `buffer / data / tree / nodeMap`，等价于把 MessageProcessor 恢复到刚 `new` 出来的状态。

---

## 6. 如何与 Action 交互

MessageProcessor 处理 `type: 'action'` 的方式非常克制：

- `handleActionMessage(message)` **不解析 payload、不查注册表、不做副作用**；
- 唯一动作是 `options.onAction?.(message)`，把原消息转发出去。

也就是说，MessageProcessor 对 Action 只承担 **消息通道** 的角色：

- 上游（服务端 / 宿主 / Agent）产生一个 `A2Message { type: 'action', action, payload }`；
- MessageProcessor 解析 JSON，路由到 `onAction`；
- 宿主接管后续处理。

MessageProcessor **不**：

- 编译 `ActionConfig`（那是 Renderer 的事）；
- 执行 `callback / navigate / api`（那是 Renderer 的 `executeAction`）；
- 触发 DOM 事件、修改路由或调用后端。

因此 Action 与 MessageProcessor 是「协议上共享 `A2Message.type='action'`，实现上完全解耦」。

---

## 7. 与 State 的关系

MessageProcessor 内部持有 **自己的一份 State**，与 Runtime 其他层的 State 是「同数据、不同实例」的关系。

### 7.1 内部 State

- `buffer: string`：JSONL 未解析的残余；
- `data: Record<string, any>`：由 `data / data_update` 累积得到的 KV 快照，按 `.` 路径写入；
- `tree: A2Node | null`：当前根节点；
- `nodeMap: Map<string, A2Node>`：所有可寻址节点的索引。

四份状态都不是响应式的，是普通对象/Map。

### 7.2 与 A2UIRoot State 的关系

- MessageProcessor 内部 State 是 **协议解析副产物**；
- 真正驱动 UI 的 State（A2UIRoot 的 `tree.value / data.value`）由回调传播——**两者是两份独立的存储**；
- 因此 `MessageProcessor.getData()` 与 A2UIRoot 的 `data.value` **不保证时刻相等**：例如 A2UIRoot 侧因 `update:modelValue` 就地修改了自己的 `data`，MessageProcessor 的 `data` 不会同步（除非收到相应的 `data` 消息）。

### 7.3 读接口

宿主如需从 MessageProcessor 侧读取当前解析状态，走：

- `getData()`：返回内部 `this.data`（同引用）；
- `getTree()`：返回内部 `this.tree`；
- `getNode(id)`：从 `nodeMap` 按 id 查节点。

这三个读接口是 **调试与快照** 用途，不建议作为 UI 渲染的直接数据源——UI 渲染的数据源在 A2UIRoot / RenderContext 中。

### 7.4 生命周期

- MessageProcessor 的 State 生命周期与实例一致；
- `reset()` 强制清空；
- 全局单例 `getGlobalProcessor()` 的 State 生命周期跨越整个页面进程，直到 `resetGlobalProcessor()` 被调用。

---

_文档范围仅限 MessageProcessor 模块。_
