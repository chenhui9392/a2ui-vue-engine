# A2Table

A basic data table for displaying rows by column. It does not include search, pagination, sorting, filtering, editing, or action buttons, and is not bound to form data.

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| columns | `{ prop: string; label: string; width?: number \| string; align?: 'left' \| 'center' \| 'right' }[]` | `[]` | Column definitions; `prop` maps to a row field |
| data | `Record<string, string \| number \| boolean \| null>[]` | `[]` | Table rows |

Cells display text values. HTML and nested field paths are not supported. An empty data array displays “No data”.

## JSON example

```json
[
  {
    "id": "records",
    "component": "Table",
    "columns": [
      { "prop": "name", "label": "Name", "width": 140 },
      { "prop": "department", "label": "Department" },
      { "prop": "status", "label": "Status", "align": "center" }
    ],
    "data": [
      { "name": "Alex", "department": "Engineering", "status": "Pending" },
      { "name": "Sam", "department": "Product", "status": "Complete" }
    ]
  }
]
```
