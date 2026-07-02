# A2Search

Schema-driven search form component. Automatically binds to **Form / DataSource / Table** and supports Search / Reset / Collapse / Default Search.

- Backed by Search Runtime + DataSource
- Never imports Table — Table listens to the same DataSource

## Schema

```ts
interface SearchRuntimeConfig {
  fields: SearchField[]
  dataSource?: string
  defaultValues?: Record<string, any>
  defaultSearch?: boolean
  collapsible?: boolean
  collapseAfter?: number
  defaultCollapsed?: boolean
  submitText?: string
  resetText?: string
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
  filterKey?: string
  span?: number
  collapsible?: boolean
  clearable?: boolean
  disabled?: boolean
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `SearchRuntimeConfig` | Search configuration |
| `labelWidth` | `string` | Label width, default `80px` |
| `dataSource` | `DataSource` | Related DataSource instance |
| `formPrefix` | `string` | Namespace under `data.form.<prefix>.*` |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `submit` | `{ values, filter }` | Fired on search |
| `reset` | `values` | Fired on reset |
| `action` | `{ type, ... }` | Fallback channel |

## Basic Example

<PlaygroundEmbed
  title="Basic Search Form"
  :json-example='{
  "id": "search1",
  "type": "a2-search",
  "props": {
    "config": {
      "fields": [
        { "id": "keyword", "label": "Keyword", "type": "text", "placeholder": "Ticket / title" },
        { "id": "status", "label": "Status", "type": "select", "options": [
          { "label": "All", "value": "" },
          { "label": "Pending", "value": "pending" },
          { "label": "Done", "value": "done" }
        ] }
      ]
    }
  }
}'
/>

## JSON Schema

```json
{
  "id": "searchId",
  "type": "a2-search",
  "props": {
    "config": {
      "fields": [
        { "id": "keyword", "label": "Keyword", "type": "text" }
      ]
    }
  }
}
```
