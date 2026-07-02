# A2UI 技术债清单

> 依据「架构评审 → 问题举证」两轮结论汇总，仅纳入 **代码或文档中可直接举证、影响明确** 的条目。经验建议类（无当前证据）不入清单。
>
> 每条债务包含：问题、证据、影响、偿还策略、修改成本、建议偿还窗口。

---

## 一、P0 · 必须修改（阻断类，V2 落地前收敛）

### DEBT-P0-01 · 表达式 / callback 求值路径未沙箱化

- **问题**：`resolveBinding` 中的 `expression` 类型与 `executeAction` 中的 `callback` 类型都使用 `new Function(...)()` 直接反解字符串为 JS。默认无开关、无白名单、无沙箱。
- **证据**：
  - [mapper/binding.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/mapper/binding.ts#L49-L58) —— `evaluateExpression` 用 `new Function(...Object.keys(data), 'return ${expression}')`，把整个 `data` 作为可访问变量注入。
  - [renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts#L216-L221) —— `callback` 分支 `new Function('return ' + action.handler)()`。
- **影响**：
  - AI Native 场景下，模型生成的 Schema 若含 `expression / callback` 即可任意执行 JS；
  - 跨租户 / 跨组织 Schema 传输链路直接 XSS；
  - 阻碍金融、政企、多租户场景落地。
- **偿还策略**：
  - `A2UIRoot` 新增可选 `security: { allowExpression, allowCallback, allowlist }`，**默认关闭** 两类求值；
  - 需求场景显式开启并强制传入白名单；
  - 长期可插拔式沙箱（`expr-eval` / QuickJS-wasm）。
- **修改成本**：低-中。仅在两个函数入口加开关；协议不动。
- **建议偿还窗口**：**V2.0 之前**。

---

## 二、P1 · 建议修改（严重问题，随 V2 DataSource / Page Schema 一同偿还）

### DEBT-P1-01 · A2UIRoot.handleEvent 是所有事件的漏斗，噪声与语义模糊

- **问题**：`update:modelValue` 产生的内部 `dataUpdate` 事件与业务 Action 走同一 `message` emit 通道，且 `type` 字面固定为 `action`，宿主无法区分「内部数据变化」与「业务意图」。
- **证据**：
  - [root/A2UIRoot.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/root/A2UIRoot.vue#L181-L190) —— `handleEvent` 硬编码 `type: 'action'`。
  - [renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts#L100-L108) —— `update:modelValue` 处理器额外 `onEvent('dataUpdate', ...)`，最终汇入同一 `handleEvent`。
  - [types/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/types/index.ts#L126-L130) —— `ActionMessage.action` 字段与 `payload.action` 存在语义重叠。
- **影响**：
  - 每次击键都产生 `message`，宿主需应用层过滤；
  - 后续 Agent 回放 / 日志被内部事件淹没；
  - 阻碍 `A2Message.type` 向 `intent / plan / feedback` 扩展时的类型收敛。
- **偿还策略**：拆分为两条 emit：`dataChange`（内部）与 `message`（业务），或在 `type` 层加子类型；协议侧不动。
- **修改成本**：低。
- **建议偿还窗口**：**V2.0 与 DataSource 一同**。

### DEBT-P1-02 · Renderer 与容器组件双向依赖，白名单机制违背分层承诺

- **问题**：容器组件在自身内部 `import { renderNode }` 递归渲染子节点，形成 `Renderer → Component Registry → Renderer` 循环依赖；且 `SELF_RENDER_CHILDREN_TYPES` 白名单硬编码在 Renderer，新增容器组件必须同时改 Runtime。此条同时涵盖「Slot / Children 语义模糊」问题。
- **证据**：
  - [renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts#L6-L14) —— `SELF_RENDER_CHILDREN_TYPES` 硬编码。
  - [renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts#L110-L135) —— `shouldPassChildrenAsProps` 分叉逻辑。
  - [components/A2Card.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Card.vue#L48) · [A2Row.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Row.vue#L34) · [A2Column.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Column.vue#L40) · [A2List.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2List.vue#L42) · [A2Button.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Button.vue#L47) · [A2TextField.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2TextField.vue#L53) —— 全部 `import { renderNode } from '../renderer/renderNode'`。
- **影响**：
  - 违反「Renderer 纯函数、组件不感知 Runtime」承诺；
  - 阻碍 SSR、组件级异步 `import()`、tree-shaking；
  - 新组件出错概率高（忘记加白名单）。
- **偿还策略**：新增 `<RenderProvider :nodes :context />` 组件，容器只使用它；移除 `SELF_RENDER_CHILDREN_TYPES` 白名单。
- **修改成本**：中。需修改 6 个容器组件 + Renderer 内 1 处。
- **建议偿还窗口**：**V2.2 前**，V3 SSR / 惰性加载前必须完成。

### DEBT-P1-03 · `data` 全局扁平命名空间缺乏作用域

- **问题**：表单值、DataSource 状态、弹窗 visible、selectedRows 等全部堆在同一个 `data` 对象里，多 `a2-page` 嵌套 / 多 Agent 场景 id 冲突不可避免；`provide('a2uiUpdateData')` 是全局写后门。
- **证据**：
  - [root/A2UIRoot.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/root/A2UIRoot.vue#L124) —— `data = ref<Record<string, any>>({...})`。
  - [root/A2UIRoot.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/root/A2UIRoot.vue#L299-L302) —— `provide('a2uiData' / 'a2uiUpdateData' / ...)` 暴露给任意子组件。
  - [core/flatToTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/flatToTree.ts#L329-L348) —— 扁平路径统一映射到 `form.name`，无作用域概念。
- **影响**：
  - Page Schema 嵌套（用户管理示例）id 冲突全局崩；
  - V3 多 Agent 共享 Runtime 时无法隔离；
  - 未来乐观更新 / 回滚无法基于作用域切片。
- **偿还策略**：协议侧新增可选 `A2Node.scope`；Runtime 侧解析绑定时结合作用域路径解析；老 Schema 无 scope 时行为等价。
- **修改成本**：中。协议 additive、Runtime 局部改造。
- **建议偿还窗口**：**V2.0 与 DataSource 一同交付**，晚一版偿还成本翻倍。

### DEBT-P1-04 · flatToTree 中心化组件私有配置

- **问题**：`buildProps` 硬编码所有组件的扁平字段 → props 映射（Card / Row / Column / Text / Button / OptionCard / InfoField / ChoicePicker 等），Runtime 中心文件感知具体组件，违反「新组件不改 Runtime」承诺。
- **证据**：
  - [core/flatToTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/flatToTree.ts#L99-L323) —— `buildProps` 内含大量 `if (flatNode.component === 'X')` 分支。
- **影响**：
  - 中心文件圈复杂度随组件数量线性增长，V3 预计新增 20+ 组件后不可维护；
  - 组件文档、组件源码、扁平映射三处知识重复；
  - 阻碍跨端 / 组件插件化。
- **偿还策略**：引入 `registerFlatMap(component, mapFn)` 注册表；组件在同目录附 `flat-map.ts`；`buildProps` 只做查表。
- **修改成本**：中。20+ 处映射逻辑迁移。
- **建议偿还窗口**：**V2.1 引入 Table / Dialog / Drawer 前**，否则会立刻爆炸。

### DEBT-P1-05 · 路径协议多套并存且语法不一致

- **问题**：Runtime 内部有四套路径解析，`.` / `[n]` / 前缀正则各行其道，同一份 `data` 在不同链路下读写行为不完全等价。
- **证据**：
  - [core/MessageProcessor.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/MessageProcessor.ts#L143-L157) —— `setNestedValue` 仅支持 `a.b.c`。
  - [renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts#L17-L57) —— `setPathValue` 支持 `.` + `[n]`。
  - [mapper/binding.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/mapper/binding.ts#L24-L46) —— `resolvePath` 支持 `.` + `[n]`。
  - [core/flatToTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/flatToTree.ts#L418-L432) —— `extractFormDataPaths` 用 `/form/{x}` 正则。
- **影响**：
  - `data` 消息路径含 `[0]` 时会被当作字面 key，读写不一致；
  - DataSource 加入后 `data.$ds.list.items[0].name` 在不同链路下结果不同；
  - AI 生成路径的模糊性大。
- **偿还策略**：抽出唯一 `path.ts`（`getPath / setPath`），四处引用它；路径语法统一为 `.` + `[n]`。协议不动。
- **修改成本**：低-中。
- **建议偿还窗口**：**V2.0 前**，DataSource 落地前必须收敛。

### DEBT-P1-06 · A2UIRoot 每次数据变化都构造新组件，触发整树 unmount / mount

- **问题**：`renderContent` 是 computed，其内部 `defineComponent({...})` 每次重算都返回一个新组件构造，外层 `<component :is="renderContent" />` 走 unmount → mount 路径而非 patch。
- **证据**：
  - [root/A2UIRoot.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/root/A2UIRoot.vue#L142-L151) —— `renderContent = computed(() => defineComponent({ setup: () => () => renderTree(tree.value!, renderContext.value) }))`。
- **影响**：
  - Streaming（每秒多次推送）时整树重挂载，性能不稳定；
  - 表单交互中数据推送导致 focus 丢失、Element Plus 动画中断；
  - V3 Streaming 前必须解决。
- **偿还策略**：setup 阶段一次性构造 render function；`<component :is="renderComponent" />` 只在 `renderComponent` 实例不变时对内部 tree 变化做 patch。协议不动。
- **修改成本**：低-中。
- **建议偿还窗口**：**V3.0 Streaming 前**，V2.x 提前修更佳。

### DEBT-P1-07 · DataSource 缺少 MVP 边界（文档层）

- **问题**：[DataSource 设计](/guide/datasource) 一次性描述 HTTP / Cache / Retry / Pagination / Filter / Sort / Search / 依赖图 / 乐观更新，未标注 V2.0 / V2.1 / V2.2 阶段。
- **证据**：
  - [guide/datasource.md](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-docs/docs/guide/datasource.md) —— 全文无阶段标签。
- **影响**：
  - V2.0 里程碑难以聚焦；
  - 实现者容易一次性开工造成延期；
  - Review 时期望不齐。
- **偿还策略**：在文档中为每个能力加 `[V2.0 / V2.1 / V2.2]` 标签；补一版 MVP 章节。
- **修改成本**：极低（文档层）。
- **建议偿还窗口**：**V2.0 kickoff 前**。

---

## 三、P2 · 未来优化（体验 / 治理层，可渐进偿还）

### DEBT-P2-01 · 组件事件双通道（原生 event + `action` 兜底）

- **问题**：内置组件同时 emit 原生事件（`click / change / focus / blur`）与通用 `action` 事件，`action` payload 结构不规范且实际无消费者。
- **证据**：
  - [components/A2Button.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Button.vue#L83)
  - [components/A2TextField.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2TextField.vue#L101-L155)
  - [components/A2Card.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Card.vue#L73-L74)
- **影响**：心智负担、开发规范不清晰、无用噪声。
- **偿还策略**：V2 标记 deprecated，V3 移除；协议不动。
- **修改成本**：低。
- **建议偿还窗口**：V2 期整改。

### DEBT-P2-02 · A2Node 与 FlatA2Node 字段命名分裂

- **问题**：`type ↔ component`、`bindings.value ↔ value.path`、`actions[] ↔ action.event.name` 命名不对齐，AI 生成时选择困难。
- **证据**：
  - [types/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/types/index.ts#L8-L73)
  - [core/flatToTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/flatToTree.ts#L329-L365)
- **影响**：AI 生成命中率降低；学习曲线不必要地变陡；未来废弃其一时迁移成本高。
- **偿还策略**：文档层先补「AI 推荐使用扁平 / 树形」说明；协议层的整合留待 breaking window。
- **修改成本**：低（文档）/ 中（协议对齐，短期不做）。
- **建议偿还窗口**：文档层可在 V2.0 完成，协议整合留 V3 大版本。

### DEBT-P2-03 · 缺少 Runtime 观测面板与错误上报机制

- **问题**：错误处理仅 `console.warn/error` + 单个 `error` emit，无分级、无 trace、无内置 devtools。
- **证据**：
  - [renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts#L69)
  - [core/MessageProcessor.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/MessageProcessor.ts#L38-L41)
  - [core/flatToTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/flatToTree.ts#L24-L26)
  - [root/A2UIRoot.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/root/A2UIRoot.vue#L39-L45)
- **影响**：大 Schema 调试成本高；生产事故排障困难；V3 AI 反馈闭环缺观测数据。
- **偿还策略**：`A2UIRoot` 新增 `inspect` emit；Playground 内嵌 devtools 面板。
- **修改成本**：低-中。
- **建议偿还窗口**：V2 期补一版基础观测。

### DEBT-P2-04 · 缺少 Intent 协议层（AI 意图一等公民）

- **问题**：`A2Message` 联合类型仅 5 种，Agent 无法直接表达「思考中 / 请求澄清 / 置信度」等意图信息。
- **证据**：
  - [types/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/types/index.ts#L106-L143)
- **影响**：V3 Agent / A2A 落地时协议需一次扩展；AI 表达能力受限。
- **偿还策略**：V3 期新增可选类型 `intent / plan / feedback`；老消息完全兼容。
- **修改成本**：极低（协议可选扩展）。
- **建议偿还窗口**：V3.3 前落地。

---

## 四、汇总表

| ID | 级别 | 债务 | 建议偿还窗口 | 修改成本 |
|----|------|------|-------------|---------|
| DEBT-P0-01 | P0 | 表达式 / callback 沙箱化 | V2.0 前 | 低-中 |
| DEBT-P1-01 | P1 | handleEvent 事件通道拆分 | V2.0 | 低 |
| DEBT-P1-02 | P1 | Renderer ↔ 组件循环依赖（含 Slot 语义） | V2.2 前 | 中 |
| DEBT-P1-03 | P1 | `data` 引入作用域 | V2.0 | 中 |
| DEBT-P1-04 | P1 | flatToTree 注册表化 | V2.1 前 | 中 |
| DEBT-P1-05 | P1 | 路径协议统一 `path.ts` | V2.0 前 | 低-中 |
| DEBT-P1-06 | P1 | A2UIRoot 停止整树重挂载 | V3.0 前 | 低-中 |
| DEBT-P1-07 | P1 | DataSource 加 MVP 边界 | V2.0 kickoff 前 | 极低 |
| DEBT-P2-01 | P2 | 移除 `action` 兜底事件 | V2 期 | 低 |
| DEBT-P2-02 | P2 | 扁平/树形命名统一文档 | V2.0（文档） | 低 |
| DEBT-P2-03 | P2 | Runtime 观测面板 | V2 期 | 低-中 |
| DEBT-P2-04 | P2 | Intent 协议层 | V3.3 前 | 极低 |

---

## 五、偿还路线建议

- **V2.0 · DataSource MVP 阶段**（必须并行完成）：
  DEBT-P0-01、DEBT-P1-01、DEBT-P1-03、DEBT-P1-05、DEBT-P1-07。
- **V2.1 · Table / Dialog / Drawer 阶段**：
  DEBT-P1-04（在新组件涌入前完成）。
- **V2.2 · Page 容器与官方模板阶段**：
  DEBT-P1-02（拆解 Renderer ↔ 组件循环依赖）。
- **V2 期机动交付**：
  DEBT-P2-01、DEBT-P2-02、DEBT-P2-03。
- **V3.0 · Streaming 阶段**：
  DEBT-P1-06。
- **V3.3 · Agent Runtime 阶段**：
  DEBT-P2-04。

**总原则**：P0 阻断上线，必须先修；P1 都是「架构承诺 vs 实现现实」的偿还，尽量在 V2.x 各阶段随对应新特性一起完成，避免技术债利息复利；P2 属于治理与体验，可跟随节奏。

---

## 六、追踪约定

- 每条债务在开发中被着手偿还时，请在本文件中的对应条目下追加 `**状态**：进行中 / 已偿还（版本号）` 一行。
- 已偿还的条目 **保留不删除**，作为演进档案。
- 新增债务不直接补到本文件；先通过一次 Review 举证，再合入。
