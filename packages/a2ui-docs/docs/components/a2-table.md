# A2Table

表格组件，用于展示结构化二维数据，支持列声明、单元格自定义渲染、单选/多选、排序、加载态与空态。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `columns` | `A2TableColumn[]` | `[]` | 列定义数组 |
| `data` | `any[]` | `[]` | 行数据 |
| `rowKey` | `string` | `'id'` | 行唯一标识字段 |
| `size` | `'large' \| 'default' \| 'small'` | `'default'` | 表格尺寸 |
| `stripe` | `boolean` | `true` | 是否斑马线 |
| `border` | `boolean` | `false` | 是否显示边框 |
| `loading` | `boolean` | `false` | 加载态 |
| `selection` | `A2TableSelection` | — | 选择配置 |
| `empty` | `A2TableEmpty` | — | 空态自定义配置 |
| `emptyText` | `string` | `'暂无数据'` | 空态默认文本 |
| `pagination` | `A2TablePagination` | — | 分页配置（可选，V2.1 新增）|
| `dataSource` | `DataSource` | — | DataSource 实例（宿主注入，V2.1 新增）|

### `A2TableColumn`

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 列唯一 id |
| `title` | `string` | 列头文案 |
| `field` | `string` | 对应 `row[field]` |
| `width` / `minWidth` | `number \| string` | 列宽 |
| `align` | `'left' \| 'center' \| 'right'` | 对齐方式 |
| `fixed` | `'left' \| 'right'` | 冻结列 |
| `sortable` | `boolean` | 启用排序 |
| `cellRender` | `A2Node` | 自定义单元格 Schema |
| `visible` | `boolean` | 列是否可见 |
| `format` | `'date' \| 'datetime' \| 'currency' \| 'number' \| 'percent'` | 值格式化 |

### `A2TableSelection`

| 字段 | 类型 | 说明 |
|------|------|------|
| `mode` | `'single' \| 'multiple'` | 单选或多选 |
| `preserveSelection` | `boolean` | 跨页保留选择 |

### `A2TablePagination`（V2.1 新增）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | `boolean` | — | 显式开关；未设时若 dataSource 有 total 则自动开启 |
| `pageSize` | `number` | `10` | 每页条数 |
| `pageSizes` | `number[]` | `[10, 20, 50]` | 每页大小可选项 |
| `layout` | `string` | `'total, sizes, prev, pager, next, jumper'` | el-pagination layout |
| `small` | `boolean` | `false` | 小尺寸 |
| `background` | `boolean` | `true` | 背景色分页样式 |

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `rowClick` | `(row, index)` | 行点击 |
| `rowDblClick` | `(row, index)` | 行双击 |
| `sortChange` | `{ field, order }` | 排序变化 |
| `selectionChange` | `(rows, keys)` | 选择变化 |
| `pageChange` | `page` | 页码变化（V2.1）|
| `pageSizeChange` | `pageSize` | 每页大小变化（V2.1）|
| `paginationChange` | `{ page, pageSize, total }` | 综合分页变化（V2.1）|

所有事件同时通过 `action` 兜底 emit，统一走 [Action System](/architecture/action-system)。

## 基础示例

<PlaygroundEmbed
  title="基础表格"
  :json-example='{
  "id": "table1",
  "type": "a2-table",
  "props": {
    "rowKey": "id",
    "columns": [
      { "id": "no", "title": "工单号", "field": "no", "width": 120 },
      { "id": "title", "title": "标题", "field": "title" },
      { "id": "status", "title": "状态", "field": "status", "width": 100, "align": "center" },
      { "id": "createdAt", "title": "创建时间", "field": "createdAt", "format": "datetime", "width": 180 }
    ],
    "data": [
      { "id": 1, "no": "WO-001", "title": "空调维修", "status": "待处理", "createdAt": "2026-07-01T09:12:00" },
      { "id": 2, "no": "WO-002", "title": "网络故障", "status": "处理中", "createdAt": "2026-07-01T10:30:00" },
      { "id": 3, "no": "WO-003", "title": "门禁异常", "status": "已完成", "createdAt": "2026-06-30T18:45:00" }
    ]
  }
}'
/>

## 单元格自定义渲染

单元格可以通过 `cellRender` 内嵌任意 A2 组件；单元格上下文中可用 `row`、`rowIndex`。

<PlaygroundEmbed
  title="操作列"
  :json-example='{
  "id": "table2",
  "type": "a2-table",
  "props": {
    "rowKey": "id",
    "columns": [
      { "id": "no", "title": "工单号", "field": "no", "width": 120 },
      { "id": "title", "title": "标题", "field": "title" },
      {
        "id": "actions",
        "title": "操作",
        "width": 200,
        "align": "center",
        "cellRender": {
          "id": "actionRow",
          "type": "a2-row",
          "props": { "justify": "center", "gap": 8 },
          "children": [
            {
              "id": "viewBtn",
              "type": "a2-button",
              "props": { "text": "查看", "type": "primary" }
            },
            {
              "id": "deleteBtn",
              "type": "a2-button",
              "props": { "text": "删除", "type": "danger" }
            }
          ]
        }
      }
    ],
    "data": [
      { "id": 1, "no": "WO-001", "title": "空调维修" },
      { "id": 2, "no": "WO-002", "title": "网络故障" }
    ]
  }
}'
/>

## 多选与批量

<PlaygroundEmbed
  title="多选表格"
  :json-example='{
  "id": "table3",
  "type": "a2-table",
  "props": {
    "rowKey": "id",
    "selection": { "mode": "multiple" },
    "columns": [
      { "id": "no", "title": "编号", "field": "no", "width": 120 },
      { "id": "name", "title": "名称", "field": "name" },
      { "id": "score", "title": "分数", "field": "score", "format": "number", "width": 120, "align": "right" }
    ],
    "data": [
      { "id": 1, "no": "S-01", "name": "张三", "score": 92 },
      { "id": 2, "no": "S-02", "name": "李四", "score": 85 },
      { "id": 3, "no": "S-03", "name": "王五", "score": 78 }
    ]
  }
}'
/>

## 空态

<PlaygroundEmbed
  title="空态"
  :json-example='{
  "id": "table4",
  "type": "a2-table",
  "props": {
    "rowKey": "id",
    "empty": { "text": "暂无工单" },
    "columns": [
      { "id": "no", "title": "编号", "field": "no", "width": 120 },
      { "id": "name", "title": "名称", "field": "name" }
    ],
    "data": []
  }
}'
/>

## JSON Schema

```json
{
  "id": "tableId",
  "type": "a2-table",
  "props": {
    "rowKey": "id",
    "columns": [
      { "id": "colId", "title": "列标题", "field": "字段名", "width": 120 }
    ],
    "data": [ { "id": 1, "..." : "..." } ],
    "selection": { "mode": "multiple", "preserveSelection": true },
    "empty": { "text": "暂无数据" },
    "pagination": {
      "enabled": true,
      "pageSize": 10,
      "pageSizes": [10, 20, 50],
      "layout": "total, sizes, prev, pager, next, jumper"
    }
  }
}
```

## 分页（V2.1）

分页能力遵循「Table 展示、DataSource 请求、Search 联动」的分层：

- **Table 只负责**：渲染分页栏、emit `pageChange / pageSizeChange / paginationChange`
- **DataSource 负责**：接收 `setPage / setPageSize / setFilter / setSort` 并自动 refresh
- **Search 联动**：`submit → setFilter` 时 DataSource 内部自动回到第 1 页
- **Table 从不发请求**

### 场景 1：客户端分页（静态 data）

<PlaygroundEmbed
  title="客户端分页"
  :json-example='{
  "id": "clientPaging",
  "type": "a2-table",
  "props": {
    "rowKey": "id",
    "pagination": {
      "enabled": true,
      "pageSize": 5,
      "pageSizes": [5, 10, 20]
    },
    "columns": [
      { "id": "no", "title": "编号", "field": "no", "width": 120 },
      { "id": "title", "title": "标题", "field": "title" },
      { "id": "status", "title": "状态", "field": "status", "width": 100, "align": "center" }
    ],
    "data": [
      { "id": 1,  "no": "WO-001", "title": "空调无法制冷", "status": "待处理" },
      { "id": 2,  "no": "WO-002", "title": "网络故障", "status": "处理中" },
      { "id": 3,  "no": "WO-003", "title": "打印机卡纸", "status": "处理中" },
      { "id": 4,  "no": "WO-004", "title": "门禁失效", "status": "已完成" },
      { "id": 5,  "no": "WO-005", "title": "邮箱异常", "status": "待处理" },
      { "id": 6,  "no": "WO-006", "title": "会议室投屏", "status": "已完成" },
      { "id": 7,  "no": "WO-007", "title": "打印机缺纸", "status": "已完成" },
      { "id": 8,  "no": "WO-008", "title": "电脑蓝屏", "status": "处理中" },
      { "id": 9,  "no": "WO-009", "title": "VPN 无法连接", "status": "待处理" },
      { "id": 10, "no": "WO-010", "title": "座位调整", "status": "已完成" },
      { "id": 11, "no": "WO-011", "title": "工位改造", "status": "处理中" },
      { "id": 12, "no": "WO-012", "title": "耗材申领", "status": "待处理" }
    ]
  }
}'
/>

### 场景 2：DataSource 服务端分页

DataSource 存在时 Table 自动开启分页；`total` 从接口返回值获取；翻页 / 换页大小 / 排序 / 搜索均由 DataSource 统一发起请求。

```ts
import { createDataSource } from 'a2ui-vue-engine'

// 1) 创建 DataSource
const orderList = createDataSource({
  id: 'orderList',
  config: {
    kind: 'http',
    request: {
      url: '/api/orders',
      method: 'GET',
      responseMap: { list: 'data.list', total: 'data.total' },
    },
    pagination: { enabled: true, pageSize: 10 },
    cache: { enabled: true, ttl: 60_000 },
    retry: { count: 2 },
  },
})
orderList.init()

// 2) 通过组件 prop 注入（宿主装配层）：Table 自动读 data/total/loading
// <A2Table :columns="cols" :dataSource="orderList" />
```

- 翻页 → `orderList.setPage(2)` → 自动 fetch
- 换页大小 → `orderList.setPageSize(20)` → 回首页 + fetch
- 排序 → Table 内部 `handleSortChange` 自动 `orderList.setSort(...)`
- Search 提交 → SearchRuntime 自动 `orderList.setFilter(...)` → 回首页 + fetch

### 场景 3：完整闭环（Search + Table + Pagination）

Search / Table 通过 **同一 DataSource 实例** 联动，三方之间无直接依赖：

```
User -> Search.submit()  ->  DataSource.setFilter()   ->  refresh
User -> Table.pageChange -> DataSource.setPage()     ->  refresh
User -> Table.sortChange -> DataSource.setSort()     ->  refresh
DataSource -> Table.state.data / meta.total (响应式)
DataSource -> Search 从不读（Search 只写）
```
