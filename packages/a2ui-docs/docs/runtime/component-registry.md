# Component Registry

> 分析范围：`packages/a2ui-vue-engine/src/components/componentMap.ts` 及其在 A2UIRoot / Plugin / Renderer 中的调用边界。
> 仅分析注册机制本身；不涉及任何具体新组件的实现细节。

---

## 1. 作用

Component Registry 是 A2UI Runtime 中把 **协议里的 `type` 字符串** 与 **实际的 Vue 组件** 关联起来的唯一映射层。它是 **协议与实现之间的解耦点**——协议只谈 `type: "a2-card"`；具体渲染由哪一个 Vue 组件完成，全部由 Registry 决定。

三件核心事项：

- **持有一份 `type → Component` 的 map**（`ComponentMapper`）；
- **允许运行时增删改**（`registerComponent / registerComponents / resetComponentMap`）；
- **在渲染时被 Renderer 查表**（通过 `RenderContext.componentMap[type]`）。

Registry **不**：

- 不解析 Schema、不构造 VNode、不执行 Action；
- 不维护组件生命周期；
- 不感知 `A2UIRoot` 是否存在。

它是一个纯粹的「字典 + 少量工具函数」，可以脱离 Runtime 单测。

主要 API（均从 [components/componentMap.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/componentMap.ts) 导出）：

- `defaultComponentMap`：内置默认映射（含所有开箱即用 A2 组件）；
- `registerComponent(type, component)`：单个注册；
- `registerComponents(components)`：批量注册；
- `getComponent(type)`：单个查询；
- `getComponentMap()`：拷贝出当前全量映射；
- `resetComponentMap()`：重置为默认；
- `createComponentMap(customComponents?)`：把默认与自定义合并出一份新 map，不修改全局状态。

关键类型（由 Types 层定义）：

```ts
interface ComponentMapper {
  [key: string]: Component | (() => Promise<{ default: Component }>)
}
```

---

## 2. 注册机制

Registry 的注册路径分为 **静态默认** 与 **动态注入** 两种。

### 2.1 静态默认

`defaultComponentMap` 是一个模块级常量对象，静态列出所有内置组件的映射，例如 `'a2-card': A2Card`。所有内置组件在库编译时即完成绑定，`import 'a2ui-vue-engine'` 之后即可使用。

`defaultComponentMap` 本身是 **只读约定**（TypeScript 层未加 `Readonly`，但实践上不允许外部直接修改），派生实例通过 `{ ...defaultComponentMap, ...customComponents }` 得到。

### 2.2 模块级全局映射

Registry 内维护一个模块作用域变量：

```ts
let globalComponentMap: ComponentMapper = { ...defaultComponentMap }
```

对外提供的写方法：

- `registerComponent(type, component)`：`globalComponentMap[type] = component`；
- `registerComponents(components)`：`Object.assign(globalComponentMap, components)`；
- `resetComponentMap()`：把 `globalComponentMap` 重置回 `{ ...defaultComponentMap }`。

读方法：

- `getComponent(type)`：`globalComponentMap[type]`；
- `getComponentMap()`：`{ ...globalComponentMap }`（返回浅拷贝，避免外部污染）。

模块级全局映射是 **Vue app 级共享** 的——同一个 JS bundle 里所有 `A2UIRoot` 实例默认共享一份 `globalComponentMap`。

### 2.3 实例级映射（A2UIRoot 层组合）

`A2UIRoot` 在构造 `RenderContext` 时通过 `createComponentMap(props.componentMap)` 计算出 **该实例专属的映射**：

```ts
{ ...defaultComponentMap, ...props.componentMap }
```

因此每个 `A2UIRoot` 实例可以覆盖同名 `type` 而不污染全局。合并优先级：**用户传入 props > 默认**。

### 2.4 Plugin 层注册

`createA2UI(options)` 在 `install` 时执行 `registerComponents(options.components)`（若提供），并把 `createComponentMap(options.components)` 注入到 `A2UIPluginSymbol` 与 `app.config.globalProperties.$a2ui`，方便宿主全局访问。

### 2.5 注册值的形态

`ComponentMapper` 的 value 支持两种：

- 直接的 `Component`（Vue 组件对象）；
- `() => Promise<{ default: Component }>`（异步加载函数）——为异步组件预留了类型位，运行时能否被 Renderer 正确使用取决于 Vue 的 `defineAsyncComponent` 惯例；当前内置注册全部使用同步组件。

---

## 3. 查找机制

Registry 的查找路径 **只有一条**：Renderer 通过 `context.componentMap[node.type]` 直接读取。

### 3.1 查找发生的时机

- 每次 `renderNode(node, context)` 都会做一次 `componentMap[node.type]` 的属性访问；
- 属性访问是 O(1)，无缓存额外成本；
- 查找结果不会被 Renderer 内部缓存——每次渲染重新查一次（保证映射变更后可立即生效）。

### 3.2 查什么

- 键：`node.type`（协议字符串，如 `'a2-card'`、`'a2-button'`）；
- 值：`Component | AsyncComponent`；
- 未命中时值为 `undefined`。

### 3.3 谁提供 `componentMap`

- `RenderContext.componentMap` 由 A2UIRoot 侧的 `createComponentMap(props.componentMap)` 产出；
- Renderer 只是消费者，自己不 `import defaultComponentMap`。这保证 Renderer 对 Registry 的具体来源无感。

### 3.4 谁不查

- MessageProcessor 不查 Registry；
- flatToTree 不查 Registry（只做 `PascalCase → a2-kebab-case` 的名称规范化，不校验 type 是否存在）；
- Bindings / Actions 不查 Registry。

因此「type 是否存在」是 **Renderer 唯一的判定点**。

---

## 4. schema type 如何映射组件

映射关系遵循 **一一对应** 的字符串键关联：

- **协议的 `A2Node.type`**：kebab-case，带 `a2-` 前缀，例如 `a2-card / a2-row / a2-column / a2-text-field / a2-choice-picker / a2-option-card / a2-info-field`。
- **Registry 的 key**：与协议 `type` 完全一致。
- **Registry 的 value**：对应的 Vue 组件（如 `A2Card / A2Row / ...`）。

内置映射由 `defaultComponentMap` 静态列出，形如：

```
'a2-button'         → A2Button
'a2-text'           → A2Text
'a2-input'          → A2Input
'a2-select'         → A2Select
'a2-date-picker'    → A2DatePicker
'a2-card'           → A2Card
'a2-row'            → A2Row
'a2-column'         → A2Column
'a2-list'           → A2List
'a2-text-field'     → A2TextField
'a2-icon'           → A2Icon
'a2-date-time-input'→ A2DateTimeInput
'a2-select-field'   → A2SelectField
'a2-choice-picker'  → A2ChoicePicker
'a2-option-card'    → A2OptionCard
'a2-info-field'     → A2InfoField
```

### 扁平格式 `component` 字段

扁平协议使用 `PascalCase` 的 `component` 字段（例如 `Card / Row / TextField / OptionCard`），由 flatToTree 内部通过命名规范化转成 `a2-kebab-case`（例如 `Card → a2-card`），再送入 Renderer。**Registry 只认 `a2-kebab-case` 一种键形式**，不额外维护 PascalCase → 组件的旁路映射。

### 覆盖策略

- 宿主在 `A2UIRoot` 传入 `componentMap: { 'a2-card': MyCard }` 时，会 **覆盖** 默认的 `A2Card`——`createComponentMap` 的合并顺序是「默认在前、自定义在后」；
- 覆盖只对该 `A2UIRoot` 实例生效，不修改全局；
- 若希望全局覆盖，可调用 `registerComponent('a2-card', MyCard)` 或使用 `createA2UI({ components: {...} })`。

### 命名的硬约束

- 协议 `type` 必须与 Registry key 严格相等（大小写敏感，含 `a2-` 前缀）；
- 未采用 `a2-` 前缀的自定义 type（如 `myapp:employee-card`）Registry 也能容纳——只要 key/value 一致即可，Registry 不做任何前缀校验。

---

## 5. fallback 机制

### 5.1 Registry 自身不 fallback

`getComponent(type)` 未命中时返回 `undefined`。Registry 不会返回一个「占位组件」，也不会打印警告。

### 5.2 Renderer 侧的 fallback

真正的降级发生在 Renderer 侧（[renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts)）：

- Renderer 用 `context.componentMap[node.type]` 取组件；
- 若结果为 `undefined`：
  - 打印 `console.warn` `Component not found: ${node.type}`；
  - 返回 `renderFallback(node)`，产生一个占位 `<div class="a2-fallback" data-a2-id="..." data-a2-type="...">Unknown component: {type}</div>`。

这个 fallback 是 **不可配置的默认行为**——Registry 自身不提供 fallback 组件的注册位，宿主要自定义占位行为，只能选择「注册一个覆盖同名 type 的组件」或「预先注册所有可能出现的 type」。

### 5.3 fallback 语义

- **不抛错**：未知 type 不会中断整棵树的渲染，只是该节点被替换为占位；
- **保留 id / type 元信息**：占位元素带 `data-a2-id` 与 `data-a2-type`，方便 devtools / e2e 定位；
- **兄弟节点不受影响**：Renderer 在 `renderTree` 中对 `renderNode` 返回值只做 `null` 过滤，fallback 是合法 VNode 会正常渲染。

### 5.4 边界情况

- 若 `componentMap[type]` 是异步函数：Renderer 直接把它作为 `h(...)` 的第一个参数——是否能正确渲染取决于宿主是否用 `defineAsyncComponent` 包装。Registry 本身不做校验。
- 若同一 `type` 被重复 `registerComponent`：后写覆盖先写，无警告。

---

## 6. 如何扩展新组件（重点）

Registry 的扩展路径是 **对扩展开放、对修改封闭**——绝大多数场景只需要「注册一个键值对」，不涉及 Runtime 主干任何改动。以下按 **场景** 说明。

### 6.1 库内扩展（贡献进内置组件）

面向组件源码开发者：

1. **实现组件**：在 `packages/a2ui-vue-engine/src/components/A2NewOne.vue` 写好组件；
2. **导出组件**：在 [`components/index.ts`](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/index.ts) 追加 `export { default as A2NewOne } from './A2NewOne.vue'`；
3. **注册到默认映射**：在 [`components/componentMap.ts`](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/componentMap.ts) 的 `defaultComponentMap` 追加 `'a2-new-one': A2NewOne`；
4. 完成——所有 `A2UIRoot` 实例默认可用。

此路径仅涉及三处「新增行」，不修改 Renderer / MessageProcessor / A2UIRoot 主流程。

### 6.2 宿主级扩展（应用层业务组件）

面向使用 A2UI 的应用：

**方式 A：通过 A2UIRoot props 注入（推荐，实例级）**

```html
<A2UIRoot :componentMap="{ 'a2-my-card': MyCard }" />
```

- 只对该 A2UIRoot 实例生效；
- 通过 `createComponentMap` 合并到默认之上；
- 不污染全局。

**方式 B：通过 Plugin 全局注册**

```ts
import { createA2UI } from 'a2ui-vue-engine'
app.use(createA2UI({ components: { 'a2-my-card': MyCard } }))
```

- 在 `install` 时调用 `registerComponents`；
- 所有后续 A2UIRoot 实例默认拥有；
- 顺便被注入到 `$a2ui` 全局属性与 `A2UIPluginSymbol`。

**方式 C：命令式调用**

```ts
import { registerComponent } from 'a2ui-vue-engine'
registerComponent('a2-my-card', MyCard)
```

- 任何时机可调用（例如懒加载路由中）；
- 直接修改 `globalComponentMap`；
- 对之后新建的 A2UIRoot 生效；对已挂载的实例，若其 `RenderContext.componentMap` 是在挂载时快照生成的，则不会立即感知——若需要热更新，宿主应通过 A2UIRoot 的 `updateTree` / 重新 render 触发上下文重算。

### 6.3 覆盖内置组件

覆盖只需要注册相同 `type`：

```ts
registerComponent('a2-card', MyCard)                     // 全局覆盖
<A2UIRoot :componentMap="{ 'a2-card': MyCard }" />       // 实例级覆盖
```

- 覆盖优先级：**A2UIRoot props > registerComponent 全局 > defaultComponentMap**（由 `createComponentMap` 的展开顺序保证）；
- 覆盖组件的 Props / Emit 契约必须与被覆盖组件一致，否则协议中原有 `props / bindings / actions` 会失效。

### 6.4 异步 / 懒加载组件

`ComponentMapper` 类型已包含 `() => Promise<{ default: Component }>`。若宿主希望某个组件按需加载：

```ts
registerComponent('a2-heavy', defineAsyncComponent(() => import('./A2Heavy.vue')))
```

Registry 侧无需其它变更——`defineAsyncComponent` 返回的仍是一个 `Component`，Renderer 端 `h(...)` 会正确处理异步组件的 loading / error 状态。

### 6.5 命名空间 / 业务隔离

若一个宿主同时装载多套 Schema 且组件命名可能碰撞，推荐做法：

- 采用命名空间前缀（如 `hr:employee-card`、`crm:customer-card`），Registry 对 key 不做前缀限制；
- 通过 A2UIRoot props 注入实例级 map，避免全局污染；
- 需要重置时调用 `resetComponentMap()` 回到默认。

### 6.6 卸载 / 撤销

Registry 未内置 `unregisterComponent`。若确实需要移除：

- 全局：调用 `resetComponentMap()` 后重新 `registerComponents` 想保留的部分；
- 实例：不重新创建 `A2UIRoot` 时不生效，`A2UIRoot` 挂载后其 `RenderContext.componentMap` 快照一般不再变化。

### 6.7 扩展的边界（不做的事）

- Registry 不负责组件的 Props 校验（宿主自行确保注册的组件与协议契约一致）；
- Registry 不负责默认样式注入（样式由组件自身或全局 CSS 提供）；
- Registry 不参与 flatToTree 的扁平字段映射——那是 Schema 适配层的职责；
- Registry 不监听事件、不参与 Action 编译。

---

_文档范围仅限 ComponentRegistry（`componentMap.ts`）及其接入边界。_
