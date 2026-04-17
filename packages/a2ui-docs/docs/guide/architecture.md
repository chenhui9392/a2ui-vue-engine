# 架构设计

## 整体架构

A2UI Vue Engine 采用模块化架构，职责分明：

```
┌─────────────────────────────────────────────────────────────┐
│                      应用层                                   │
│  (你的 Vue 应用 - 使用 A2UIRoot 渲染 JSON Schema)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    A2UIRoot 组件                              │
│  - 接收 JSON 消息                                             │
│  - 管理 state (tree, data)                                   │
│  - 向子组件提供 context                                       │
│  - 发出事件 (message, formDataChange)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    消息处理器                                  │
│  - 处理 JSONL 流                                              │
│  - 处理 node/data 消息                                        │
│  - 转换扁平格式为树形结构                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      渲染器                                   │
│  - 将树形结构渲染为 Vue 组件                                    │
│  - 处理数据绑定                                                │
│  - 执行动作                                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    组件库                                      │
│  - A2Card, A2Row, A2Column                                   │
│  - A2TextField, A2Input, A2SelectField                       │
│  - A2Text, A2Icon, A2Button                                  │
└─────────────────────────────────────────────────────────────┘
```

## 核心模块

### A2UIRoot.vue

根组件是主要入口点。它：

1. **接收 JSON 输入** 通过 `processMessage()` 或 `streamUrl`
2. **维护状态**：`tree`（渲染树）、`data`（表单值）
3. **提供表单数据**：通过 `getFormData()` 和 `formDataChange` 事件
4. **暴露方法**：
   - `updateTree(node)` - 更新渲染树
   - `updateData(values)` - 更新表单值
   - `getData()` - 获取当前数据
   - `getFormData()` - 获取提取的表单结构
   - `processMessage(msg)` - 处理 A2Message

### 消息处理器

处理 JSON 流消息：

```typescript
interface A2Message {
  type: 'node' | 'node_update' | 'data' | 'data_update' | 'action' | 'error' | 'complete'
  id: string
  // ... 各类型特定字段
}
```

### 渲染器

将树节点转换为 Vue VNode：

```typescript
function renderTree(node: A2Node, context: RenderContext): VNode
```

## 数据流

1. **输入**：JSON Schema → A2UIRoot.processMessage()
2. **处理**：MessageProcessor 解析并更新 tree
3. **渲染**：Renderer 从 tree 创建 VNode
4. **绑定**：Props 从数据上下文解析
5. **事件**：Actions 向父组件发出消息

## 表单数据提取

A2UIRoot 自动从 Schema 中提取表单字段：

```typescript
interface FormDataResult {
  form: Record<string, string>
}
```

字段提取来源：
- **树形格式**：表单组件的 `props.prop`
- **扁平格式**：匹配 `/form/{fieldName}` 的 `value.path`