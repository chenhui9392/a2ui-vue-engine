# Step 与基础表格组件方案

## 目标与范围

在 `a2ui-vue-engine` 中新增两个可由 A2UI JSON 渲染的展示组件：

- `Step`：展示流程步骤及当前进度。
- `Table`：展示列标题和数据行。

首版的 Step 由 JSON 指定当前步骤，不提供点击切换；Table 只负责查看数据，不提供操作按钮、搜索栏、分页、排序、筛选、勾选或行内编辑。

## JSON 接口

两个组件均支持现有的扁平节点格式。组件名分别映射为 `a2-step` 和 `a2-table`；树形节点格式可直接在 `props` 中使用相同属性。

### Step

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `steps` | `{ title: string; description?: string }[]` | 是 | 按显示顺序排列的步骤。 |
| `active` | `number` | 否 | 当前步骤索引，从 0 开始；默认 0。 |
| `direction` | `'horizontal' \| 'vertical'` | 否 | 展示方向，默认 `horizontal`。 |

使用 Element Plus 的 `el-steps`、`el-step` 实现。传入空步骤时不渲染步骤条；越界的 `active` 值按有效范围处理，避免错误状态。

### Table

| 属性 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `columns` | `{ prop: string; label: string; width?: number \| string; align?: 'left' \| 'center' \| 'right' }[]` | 是 | 列定义；`prop` 对应数据对象的字段。 |
| `data` | `Record<string, string \| number \| boolean \| null>[]` | 否 | 静态数据行，默认空数组。 |

使用 Element Plus 的 `el-table`、`el-table-column` 实现，默认宽度为 `100%`。空数组显示组件自带的“暂无数据”状态。首版仅显示文本值，不解析单元格中的 HTML，也不支持嵌套字段路径。

### 完整示例

```json
[
  {
    "id": "root",
    "component": "Column",
    "children": ["progress", "result"],
    "gap": 20
  },
  {
    "id": "progress",
    "component": "Step",
    "active": 1,
    "steps": [
      { "title": "提交申请" },
      { "title": "审批中", "description": "等待审批结果" },
      { "title": "已完成" }
    ]
  },
  {
    "id": "result",
    "component": "Table",
    "columns": [
      { "prop": "name", "label": "姓名" },
      { "prop": "department", "label": "部门" }
    ],
    "data": [
      { "name": "张三", "department": "研发部" },
      { "name": "李四", "department": "产品部" }
    ]
  }
]
```

## 改动位置

1. 在 `packages/a2ui-vue-engine/src/components/` 新增 `A2Step.vue` 和 `A2Table.vue`，封装展示逻辑。组件只保留布局所需的基础规则，不写固定品牌颜色、阴影或装饰样式；视觉处理遵循 [样式解耦方案](STYLE_CUSTOMIZATION_PLAN.md)。
2. 在 `componentMap.ts` 注册 `a2-step`、`a2-table`，并从 `components/index.ts` 导出。现有根入口会继续导出组件。
3. 在 `types/index.ts` 扩展 `FlatA2Node` 的 `steps`、`active`、`direction`、`data` 和 `columns` 类型。当前 `columns` 已用于 ChoicePicker 的列数，需要保留数字类型，并允许 Table 使用列定义数组。
4. 在 `core/flatToTree.ts` 中按组件类型传递新属性：Step 接收步骤配置；Table 接收列定义和数据。现有 ChoicePicker 的 `columns: number` 行为保持不变。
5. 在文档站增加 Step、Table 的组件说明，并在 `PlaygroundPage.vue` 增加一个包含两者的示例，便于直接查看效果。

首版只接收 JSON 内的表格数据。后续如果需要通过 `data_update` 实时替换表格行，再单独设计数据路径绑定；避免把展示数据误放进现有的表单数据提取流程。

## 实施顺序与验收标准

先完成类型与扁平节点转换，再实现并注册组件，最后补文档和 Playground 示例。

完成后应满足：示例 JSON 能同时显示步骤条与表格；修改 `active` 后当前步骤正确变化；空表格显示空状态；现有 ChoicePicker 的数字 `columns` 仍正常工作；表格界面没有操作按钮、搜索栏和分页。
