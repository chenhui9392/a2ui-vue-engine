# Runtime 模块地图

> 依据当前 `packages/a2ui-vue-engine/src/` 源码扫描整理，只列模块清单，不含流程、生命周期、架构图、设计分析或优化建议。

---

## A2UIRoot

- **文件位置**：[packages/a2ui-vue-engine/src/root/A2UIRoot.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/root/A2UIRoot.vue)
- **职责**：Runtime 对外的 Vue 根组件，持有全局 `tree / data / flatNodes` 状态并暴露命令式 API。
- **与其他模块的关系**：
  - 使用 MessageProcessor 解析 JSON 消息；
  - 使用 flatToTree 将扁平 Schema 转成 A2Node 树；
  - 使用 Renderer + Context 渲染 tree；
  - 通过 defineExpose 与 emit 与宿主应用交互。

## A2UIRoot 安装器

- **文件位置**：[packages/a2ui-vue-engine/src/root/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/root/index.ts)
- **职责**：导出 `A2UIRoot` 组件并提供 `installA2UIRoot(app)` 全局注册函数。
- **与其他模块的关系**：被 Plugin 使用完成 Vue app 级注册。

## MessageProcessor

- **文件位置**：[packages/a2ui-vue-engine/src/core/MessageProcessor.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/MessageProcessor.ts)
- **职责**：解析 JSONL 流协议，按 `type` 路由到 node / data / action / error / complete 回调，并维护 `nodeMap` 增量更新。
- **与其他模块的关系**：
  - 被 A2UIRoot 实例化并注入 `onNode / onData / onError / onComplete` 回调；
  - 消费 Types 中的 `A2Message / A2Node`。

## Core Barrel

- **文件位置**：[packages/a2ui-vue-engine/src/core/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/index.ts)
- **职责**：Core 层的统一导出，暴露 MessageProcessor 与 flatToTree 的公开 API。
- **与其他模块的关系**：被 A2UIRoot 引用。

## flatToTree（Schema Parser · 扁平→树）

- **文件位置**：[packages/a2ui-vue-engine/src/core/flatToTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/core/flatToTree.ts)
- **职责**：把扁平格式 `FlatA2Node[]` 转成树形 `A2Node`，同时提供 `extractFormDataPaths` 抽取表单字段。
- **与其他模块的关系**：
  - 被 A2UIRoot 在收到扁平 Schema 时调用；
  - 内部按组件名映射 props（Card / Row / Button / ChoicePicker 等）；
  - 依赖 Types 中的 `FlatA2Node / A2Node / BindingConfig / ActionConfig`。

## Renderer · renderNode

- **文件位置**：[packages/a2ui-vue-engine/src/renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts)
- **职责**：将单个 `A2Node` 编译成 Vue VNode，负责组件查表、props 解析、事件桥接、动作执行、`update:modelValue` 反向写入。
- **与其他模块的关系**：
  - 通过 `context.componentMap` 查 ComponentRegistry；
  - 调用 Bindings 的 `resolveProps` 解析绑定；
  - 内含 `executeAction`，与 Action 协议协作；
  - 被容器组件反向 import 递归渲染子节点。

## Renderer · renderTree

- **文件位置**：[packages/a2ui-vue-engine/src/renderer/renderTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderTree.ts)
- **职责**：遍历 `A2Node` 树调用 `renderNode`，并提供 `createRenderContext / updateRenderContextData / mergeRenderContext` 上下文工具函数。
- **与其他模块的关系**：
  - 被 A2UIRoot 使用；
  - 内部委托 renderNode 完成节点级渲染。

## Renderer Barrel

- **文件位置**：[packages/a2ui-vue-engine/src/renderer/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/index.ts)
- **职责**：Renderer 层的统一导出。
- **与其他模块的关系**：被 A2UIRoot 与外部消费者引用。

## Bindings · binding.ts

- **文件位置**：[packages/a2ui-vue-engine/src/mapper/binding.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/mapper/binding.ts)
- **职责**：解析 `BindingConfig`（`literal / path / expression`），提供 `resolvePath / evaluateExpression / transformValue / resolveProps` 等纯函数。
- **与其他模块的关系**：被 renderNode 调用完成 props 与绑定值的合并。

## Mapper Barrel

- **文件位置**：[packages/a2ui-vue-engine/src/mapper/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/mapper/index.ts)
- **职责**：Mapper 层的统一导出。
- **与其他模块的关系**：被 renderNode 与外部消费者引用。

## ComponentRegistry · componentMap

- **文件位置**：[packages/a2ui-vue-engine/src/components/componentMap.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/componentMap.ts)
- **职责**：维护 `type → Vue 组件` 的映射表，提供 `defaultComponentMap / registerComponent / registerComponents / getComponent / createComponentMap / resetComponentMap`。
- **与其他模块的关系**：
  - 内含所有内置 A2 组件的默认注册；
  - 由 A2UIRoot 合并宿主 `componentMap` 后传入 RenderContext；
  - 被 renderNode 通过 `context.componentMap[node.type]` 查询。

## Components Barrel

- **文件位置**：[packages/a2ui-vue-engine/src/components/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/index.ts)
- **职责**：导出 componentMap 相关函数与所有内置组件（A2Button / A2Card / A2Row / A2Column / ... 共 16 个）。
- **与其他模块的关系**：被库顶层 `src/index.ts` 与 A2UIRoot 引用。

## Components utils

- **文件位置**：[packages/a2ui-vue-engine/src/components/utils.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/utils.ts)
- **职责**：组件层共享工具函数。
- **与其他模块的关系**：被内置组件按需引用。

## 内置组件集合

- **文件位置**：`packages/a2ui-vue-engine/src/components/A2*.vue`（16 个）
  - [A2Button.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Button.vue)
  - [A2Card.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Card.vue)
  - [A2ChoicePicker.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2ChoicePicker.vue)
  - [A2Column.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Column.vue)
  - [A2DatePicker.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2DatePicker.vue)
  - [A2DateTimeInput.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2DateTimeInput.vue)
  - [A2Icon.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Icon.vue)
  - [A2InfoField.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2InfoField.vue)
  - [A2Input.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Input.vue)
  - [A2List.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2List.vue)
  - [A2OptionCard.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2OptionCard.vue)
  - [A2Row.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Row.vue)
  - [A2Select.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Select.vue)
  - [A2SelectField.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2SelectField.vue)
  - [A2Text.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2Text.vue)
  - [A2TextField.vue](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/components/A2TextField.vue)
- **职责**：Runtime 默认组件实现，作为 `type` 的具体渲染载体。
- **与其他模块的关系**：
  - 由 ComponentRegistry 注册；
  - 容器类组件（Card / Row / Column / List / TextField / Button / OptionCard）反向 import renderNode 递归渲染 children。

## Types · 类型定义

- **文件位置**：[packages/a2ui-vue-engine/src/types/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/types/index.ts)
- **职责**：集中定义 `A2Node / FlatA2Node / BindingConfig / ActionConfig / A2Message / RenderContext / ComponentContext / A2UIRootProps / A2UIPluginOptions / FormDataResult` 等接口。
- **与其他模块的关系**：几乎被所有 Runtime 模块引用，是跨层通信的契约。

## RenderContext（Context 层）

- **文件位置**：类型定义于 [types/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/types/index.ts)（`RenderContext`），构造与合并函数于 [renderer/renderTree.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderTree.ts)。
- **职责**：承载 `data / componentMap / globalProps / onEvent`，在渲染树中向下传递运行时上下文。
- **与其他模块的关系**：由 A2UIRoot 创建，被 Renderer 与容器组件消费。

## ComponentContext（每节点上下文）

- **文件位置**：类型定义于 [types/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/types/index.ts)（`ComponentContext`），构造发生在 [renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts)。
- **职责**：每个 `A2Node` 渲染时生成一份 `{ node, data, path, emit, resolveBinding, executeAction }`，作为 Action 执行时的上下文。
- **与其他模块的关系**：被 renderNode 构造并传递给 `executeAction`；`emit` 最终回调到 `RenderContext.onEvent`。

## Action 执行器（内嵌于 renderNode）

- **文件位置**：[packages/a2ui-vue-engine/src/renderer/renderNode.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/renderer/renderNode.ts)（`createEventHandlers` / `executeAction`）
- **职责**：把 `ActionConfig` 编译为 Vue 事件监听，并按 `type` 分发 `emit / callback / navigate / api` 四种执行分支。
- **与其他模块的关系**：
  - 消费 Types 中的 `ActionConfig`；
  - 通过 `ComponentContext.emit → RenderContext.onEvent → A2UIRoot.handleEvent` 上抛消息。

## Plugin

- **文件位置**：[packages/a2ui-vue-engine/src/plugin/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/plugin/index.ts)
- **职责**：提供 `createA2UI(options)` 与默认 `A2UIPlugin`，完成组件全局注册、错误处理器、全局属性挂载。
- **与其他模块的关系**：
  - 调用 `installA2UIRoot` 注册根组件；
  - 调用 `registerComponents / createComponentMap` 合并自定义组件；
  - 通过 `A2UIPluginSymbol` 注入插件上下文。

## Library Entry

- **文件位置**：[packages/a2ui-vue-engine/src/index.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/index.ts)
- **职责**：库顶层入口，统一 re-export Types / Core / Mapper / Renderer / Components / Root / Plugin。
- **与其他模块的关系**：宿主应用的唯一 import 入口。

## Styles

- **文件位置**：
  - [packages/a2ui-vue-engine/src/styles/index.css](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/styles/index.css)
  - [packages/a2ui-vue-engine/src/styles/variables.css](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/styles/variables.css)
- **职责**：Runtime 全局样式与 CSS 变量（`--a2-*`）。
- **与其他模块的关系**：在库入口 `src/index.ts` 中被首屏 import，供内置组件消费。

## Shims

- **文件位置**：[packages/a2ui-vue-engine/src/shims.d.ts](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/shims.d.ts)
- **职责**：TypeScript 类型补丁（`.vue` 模块声明等）。
- **与其他模块的关系**：编译时被 TypeScript 使用，不参与运行时。

## Assets

- **文件位置**：[packages/a2ui-vue-engine/src/assets/icons/](file:///d:/work/program/tineco/UI/a2ui-vue-engine/packages/a2ui-vue-engine/src/assets/icons)
- **职责**：Runtime 内置图标资源（`card-header.png / submit.png`）。
- **与其他模块的关系**：被 A2Card / A2Button 等组件 import 使用。
