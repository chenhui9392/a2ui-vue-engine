# A2List

列表组件，用于渲染重复项。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | array | [] | 列表项数据 |

## 基础示例

<PlaygroundEmbed 
  title="基础列表"
  :json-example='{
  "id": "list1",
  "type": "a2-list",
  "props": {
    "items": [
      { "label": "项目 1", "value": "value1" },
      { "label": "项目 2", "value": "value2" },
      { "label": "项目 3", "value": "value3" }
    ]
  }
}'
/>

## JSON Schema

```json
{
  "id": "listId",
  "type": "a2-list",
  "props": {
    "items": [
      { "label": "标签", "value": "值" }
    ]
  }
}
```