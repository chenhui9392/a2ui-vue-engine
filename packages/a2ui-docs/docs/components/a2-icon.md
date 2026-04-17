# A2Icon

图标展示组件。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | string | - | 图标名称（Element Plus Icons） |
| `size` | number | 16 | 图标大小（px） |
| `color` | string | - | 图标颜色 |

## 基础示例

<PlaygroundEmbed 
  title="基础图标"
  :json-example='{
  "id": "icon1",
  "type": "a2-icon",
  "props": {
    "name": "Check",
    "size": 24,
    "color": "#67c23a"
  }
}'
/>

## 多图标示例

<PlaygroundEmbed 
  title="图标集合"
  :json-example='{
  "id": "iconRow",
  "type": "a2-row",
  "props": { "gutter": 20 },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "children": [
        { "id": "icon1", "type": "a2-icon", "props": { "name": "Edit", "size": 32 } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "children": [
        { "id": "icon2", "type": "a2-icon", "props": { "name": "Delete", "size": 32, "color": "#f56c6c" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "children": [
        { "id": "icon3", "type": "a2-icon", "props": { "name": "Plus", "size": 32, "color": "#409eff" } }
      ]
    }
  ]
}'
/>

## JSON Schema

```json
{
  "id": "iconId",
  "type": "a2-icon",
  "props": {
    "name": "Check",
    "size": 24,
    "color": "#67c23a"
  }
}
```

## 可用图标

使用 Element Plus Icons，常用图标包括：

- `Check`, `Close`, `Plus`, `Minus`
- `Edit`, `Delete`, `Search`, `Refresh`
- `User`, `Setting`, `Document`, `Folder`
- `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`