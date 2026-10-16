# A2Table

基础数据表格，用于按列展示静态行数据。表格不提供搜索、分页、排序、筛选、编辑或操作按钮，也不参与表单数据绑定。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| columns | `{ prop: string; label: string; width?: number \| string; align?: 'left' \| 'center' \| 'right' }[]` | `[]` | 列定义，`prop` 对应行数据字段 |
| data | `Record<string, string \| number \| boolean \| null>[]` | `[]` | 表格行数据 |

单元格按文本值显示，不支持 HTML 或嵌套字段路径。没有行数据时显示“暂无数据”。

## JSON 示例

```json
[
  {
    "id": "records",
    "component": "Table",
    "columns": [
      { "prop": "name", "label": "姓名", "width": 140 },
      { "prop": "department", "label": "部门" },
      { "prop": "status", "label": "状态", "align": "center" }
    ],
    "data": [
      { "name": "张三", "department": "研发部", "status": "审批中" },
      { "name": "李四", "department": "产品部", "status": "已完成" }
    ]
  }
]
```
