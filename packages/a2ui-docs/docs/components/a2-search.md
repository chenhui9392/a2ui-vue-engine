# A2Search

协议驱动的搜索表单组件，自动绑定 **Form / DataSource / Table**，支持 Search / Reset / Collapse / Default Search。

- 底层：[Search Runtime](/guide/data-source#与-search-runtime-联动) + [DataSource](/guide/data-source)
- 与 Table 之间通过 DataSource 桥接，**A2Search 不感知 Table**

## Schema

```ts
interface SearchRuntimeConfig {
  fields: SearchField[]
  dataSource?: string          // 关联 DataSource id
  defaultValues?: Record<string, any>
  defaultSearch?: boolean       // 是否首屏自动搜索
  collapsible?: boolean
  collapseAfter?: number        // 折叠阈值（默认 3）
  defaultCollapsed?: boolean
  submitText?: string           // 默认 "搜索"
  resetText?: string            // 默认 "重置"
  showReset?: boolean
  showCollapse?: boolean
}

interface SearchField {
  id: string
  label?: string
  type: 'text' | 'number' | 'select' | 'date' | 'daterange' | 'switch'
  placeholder?: string
  defaultValue?: any
  options?: SearchFieldOption[]
  filterKey?: string            // 提交到 DataSource 时的 key（默认与 id 一致）
  span?: number                 // 24 栅格
  collapsible?: boolean         // 折叠时是否隐藏（默认 true）
  clearable?: boolean
  disabled?: boolean
}
```

## Props

| 属性 | 类型 | 说明 |
|------|------|------|
| `config` | `SearchRuntimeConfig` | 协议配置 |
| `labelWidth` | `string` | label 宽度，默认 `80px` |
| `dataSource` | `DataSource` | 关联 DataSource 实例（宿主注入）|
| `formPrefix` | `string` | 写入 `data.form.<prefix>.*` 命名空间 |

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `submit` | `{ values, filter }` | 搜索时触发 |
| `reset` | `values` | 重置后触发 |
| `action` | `{ type, ... }` | 兜底通道 |

## 基础示例

<PlaygroundEmbed
  title="基础搜索表单"
  :json-example='{
  "id": "search1",
  "type": "a2-search",
  "props": {
    "config": {
      "fields": [
        { "id": "keyword", "label": "关键字", "type": "text", "placeholder": "工单号/标题" },
        { "id": "status", "label": "状态", "type": "select", "options": [
          { "label": "全部", "value": "" },
          { "label": "待处理", "value": "pending" },
          { "label": "处理中", "value": "processing" },
          { "label": "已完成", "value": "done" }
        ] },
        { "id": "date", "label": "日期", "type": "date" }
      ],
      "collapsible": false
    }
  }
}'
/>

## 可折叠搜索

<PlaygroundEmbed
  title="可折叠搜索"
  :json-example='{
  "id": "search2",
  "type": "a2-search",
  "props": {
    "config": {
      "fields": [
        { "id": "keyword", "label": "关键字", "type": "text" },
        { "id": "status", "label": "状态", "type": "select", "options": [
          { "label": "待处理", "value": "pending" },
          { "label": "已完成", "value": "done" }
        ] },
        { "id": "level", "label": "级别", "type": "select", "options": [
          { "label": "P0", "value": "P0" },
          { "label": "P1", "value": "P1" },
          { "label": "P2", "value": "P2" }
        ] },
        { "id": "assignee", "label": "负责人", "type": "text" },
        { "id": "createdRange", "label": "创建时间", "type": "daterange", "span": 12 }
      ],
      "collapsible": true,
      "collapseAfter": 3,
      "defaultCollapsed": true
    }
  }
}'
/>

## 默认搜索（Default Search）

`defaultSearch: true` 让组件挂载时立即触发一次 submit（在有 `dataSource` 时会自动带上默认值刷新数据）。

<PlaygroundEmbed
  title="默认搜索"
  :json-example='{
  "id": "search3",
  "type": "a2-search",
  "props": {
    "config": {
      "fields": [
        { "id": "keyword", "label": "关键字", "type": "text", "defaultValue": "工单" },
        { "id": "status", "label": "状态", "type": "select", "defaultValue": "pending", "options": [
          { "label": "待处理", "value": "pending" },
          { "label": "已完成", "value": "done" }
        ] }
      ],
      "defaultSearch": true
    }
  }
}'
/>

## 与 Form 联动

- 内嵌在 `<A2UIRoot>` 中时，A2Search 会自动通过 inject 拿到 `a2uiData / a2uiUpdateData`，把值写入 `data.form.*`；
- 也可以设置 `formPrefix: 'search'`，把值隔离到 `data.form.search.*`；
- `defaultValue` 会立即同步到 form；`reset` 恢复默认；`submit` 触发同步。

## 与 DataSource / Table 联动（协议驱动）

- 声明 `props.config.dataSource: 'orderList'`；
- 宿主注入 `dataSource` prop（DataSource 实例）；
- `submit` 内部调用 `dataSource.setFilter(filter)` → DataSource debounce → refresh → Table 自动更新；
- `reset` 调用 `dataSource.setFilter({})`。

A2Search **不 import 也不依赖 A2Table**，Table / Tree / Chart / Description 只要通过同一 DataSource 消费即可自动响应。

## JSON Schema

```json
{
  "id": "searchId",
  "type": "a2-search",
  "props": {
    "config": {
      "fields": [
        { "id": "keyword", "label": "关键字", "type": "text" }
      ],
      "collapsible": true,
      "defaultSearch": false
    }
  }
}
```
