# A2Step

步骤进度组件，用于展示流程当前进度。组件不绑定表单数据。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| steps | `{ title: string; description?: string }[]` | `[]` | 按顺序展示的步骤 |
| active | `number` | `0` | 当前步骤索引，从 0 开始；超出范围时限制在有效范围内 |
| direction | `'horizontal' \| 'vertical'` | `'horizontal'` | 展示方向 |

空数组不显示步骤。

## JSON 示例

```json
[
  {
    "id": "progress",
    "component": "Step",
    "active": 1,
    "direction": "horizontal",
    "steps": [
      { "title": "提交申请", "description": "填写申请信息" },
      { "title": "部门审批" },
      { "title": "完成" }
    ]
  }
]
```
