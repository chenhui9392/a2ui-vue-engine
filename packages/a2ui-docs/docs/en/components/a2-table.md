# A2Table

Table component for rendering structured 2D data. Supports column declarations, custom cell renderers, single/multi-selection, sorting, loading and empty states.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `A2TableColumn[]` | `[]` | Column definitions |
| `data` | `any[]` | `[]` | Row data |
| `rowKey` | `string` | `'id'` | Unique row key |
| `size` | `'large' \| 'default' \| 'small'` | `'default'` | Table size |
| `stripe` | `boolean` | `true` | Stripe rows |
| `border` | `boolean` | `false` | Show borders |
| `loading` | `boolean` | `false` | Loading state |
| `selection` | `A2TableSelection` | — | Selection config |
| `empty` | `A2TableEmpty` | — | Empty state config |
| `emptyText` | `string` | `'No data'` | Empty text |

### `A2TableColumn`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Column unique id |
| `title` | `string` | Header text |
| `field` | `string` | Maps to `row[field]` |
| `width` / `minWidth` | `number \| string` | Column width |
| `align` | `'left' \| 'center' \| 'right'` | Alignment |
| `fixed` | `'left' \| 'right'` | Frozen column |
| `sortable` | `boolean` | Enable sort |
| `cellRender` | `A2Node` | Custom cell schema |
| `visible` | `boolean` | Column visibility |
| `format` | `'date' \| 'datetime' \| 'currency' \| 'number' \| 'percent'` | Value format |

### `A2TableSelection`

| Field | Type | Description |
|-------|------|-------------|
| `mode` | `'single' \| 'multiple'` | Selection mode |
| `preserveSelection` | `boolean` | Preserve across pages |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `rowClick` | `(row, index)` | Row click |
| `rowDblClick` | `(row, index)` | Row double click |
| `sortChange` | `{ field, order }` | Sort change |
| `selectionChange` | `(rows, keys)` | Selection change |

## Basic Example

<PlaygroundEmbed
  title="Basic Table"
  :json-example='{
  "id": "table1",
  "type": "a2-table",
  "props": {
    "rowKey": "id",
    "columns": [
      { "id": "no", "title": "Ticket", "field": "no", "width": 120 },
      { "id": "title", "title": "Title", "field": "title" },
      { "id": "status", "title": "Status", "field": "status", "width": 100, "align": "center" },
      { "id": "createdAt", "title": "Created", "field": "createdAt", "format": "datetime", "width": 180 }
    ],
    "data": [
      { "id": 1, "no": "WO-001", "title": "AC repair", "status": "Pending", "createdAt": "2026-07-01T09:12:00" },
      { "id": 2, "no": "WO-002", "title": "Network issue", "status": "In progress", "createdAt": "2026-07-01T10:30:00" }
    ]
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
      { "id": "colId", "title": "Column", "field": "fieldName", "width": 120 }
    ],
    "data": [ { "id": 1 } ],
    "selection": { "mode": "multiple", "preserveSelection": true },
    "empty": { "text": "No data" }
  }
}
```
