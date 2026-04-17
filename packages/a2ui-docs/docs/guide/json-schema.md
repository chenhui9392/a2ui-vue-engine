# JSON 规范

## Schema 格式

A2UI 支持两种 Schema 格式：

### 树形格式（推荐）

嵌套结构，子节点内嵌在父节点中：

```json
{
  "id": "root",
  "type": "a2-card",
  "props": { "title": "表单" },
  "children": [
    {
      "id": "field1",
      "type": "a2-text-field",
      "props": { "label": "姓名", "prop": "name" }
    }
  ]
}
```

### 扁平格式

节点数组，通过 `child/children` 字段关联：

```json
[
  { "id": "root", "component": "Card", "title": "表单", "child": ["field1"] },
  { "id": "field1", "component": "TextField", "label": "姓名", "value": { "path": "/form/name" } }
]
```

## 节点属性

### 通用属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 唯一标识 |
| `type` | string | 是 | 组件类型（如 `a2-card`） |
| `props` | object | 否 | 组件特定属性 |

### A2Node 类型定义

```typescript
interface A2Node {
  id: string
  type: string
  props?: Record<string, any>
  children?: A2Node[] | string
  bindings?: Record<string, BindingConfig>
  actions?: ActionConfig[]
  slots?: Record<string, A2Node[]>
}
```

## 数据绑定

使用 bindings 将组件属性与数据关联：

```typescript
interface BindingConfig {
  type: 'path' | 'literal' | 'expression'
  value: string
  transform?: string
}
```

示例：

```json
{
  "id": "textField",
  "type": "a2-text-field",
  "bindings": {
    "value": {
      "type": "path",
      "value": "/form/username"
    }
  }
}
```

## 动作配置

定义事件处理：

```typescript
interface ActionConfig {
  event: string
  type: 'emit' | 'callback' | 'navigate' | 'api'
  payload?: Record<string, any>
  handler?: string
}
```

示例：

```json
{
  "id": "submitBtn",
  "type": "a2-button",
  "props": { "text": "提交", "type": "primary" },
  "actions": [
    {
      "event": "click",
      "type": "emit",
      "payload": { "action": "submit" }
    }
  ]
}
```

## 组件类型

| 类型 | 类别 | 说明 |
|------|------|------|
| `a2-card` | 布局 | 卡片容器，多种宽度规格 |
| `a2-row` | 布局 | 氧行布局，支持对齐 |
| `a2-column` | 布局 | 列行布局，支持间距 |
| `a2-list` | 布局 | 列表组件 |
| `a2-text-field` | 表单 | 带标签的表单字段 |
| `a2-input` | 表单 | 基础输入框 |
| `a2-select-field` | 表单 | 下拉选择框 |
| `a2-date-picker` | 表单 | 日期选择器 |
| `a2-date-time-input` | 表单 | 日期时间选择器 |
| `a2-text` | 展示 | 文本展示，多种样式 |
| `a2-icon` | 展示 | 图标展示 |
| `a2-button` | 操作 | 按钮组件 |