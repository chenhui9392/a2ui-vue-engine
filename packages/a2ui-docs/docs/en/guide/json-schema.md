# JSON Schema Reference

## Schema Types

A2UI supports two schema formats:

### Tree Format (Recommended)

Nested structure where children are embedded:

```json
{
  "id": "root",
  "type": "a2-card",
  "props": { "title": "Form" },
  "children": [
    {
      "id": "field1",
      "type": "a2-text-field",
      "props": { "label": "Name", "prop": "name" }
    }
  ]
}
```

### Flat Format

Array of nodes with `id/component` fields, linked by `child/children`:

```json
[
  { "id": "root", "component": "Card", "title": "Form", "child": ["field1"] },
  { "id": "field1", "component": "TextField", "label": "Name", "value": { "path": "/form/name" } }
]
```

## Node Properties

### Common Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `type` | string | Yes | Component type (e.g., `a2-card`) |
| `props` | object | No | Component-specific props |

### A2Node Interface

```typescript
interface A2Node {
  id: string
  type: string
  props?: Record<string, any>
  children?: A2Node[] | string
  bindings?: Record<string, BindingConfig>
  actions?: ActionConfig[]
  slots?: Record<string, A2Node[]>
}
```

## Data Binding

Use bindings to connect component props to data:

```typescript
interface BindingConfig {
  type: 'path' | 'literal' | 'expression'
  value: string
  transform?: string
}
```

Example:

```json
{
  "id": "textField",
  "type": "a2-text-field",
  "bindings": {
    "value": {
      "type": "path",
      "value": "/form/username"
    }
  }
}
```

## Actions

Define event handlers:

```typescript
interface ActionConfig {
  event: string
  type: 'emit' | 'callback' | 'navigate' | 'api'
  payload?: Record<string, any>
  handler?: string
}
```

Example:

```json
{
  "id": "submitBtn",
  "type": "a2-button",
  "props": { "text": "Submit", "type": "primary" },
  "actions": [
    {
      "event": "click",
      "type": "emit",
      "payload": { "action": "submit" }
    }
  ]
}
```

## Component Types

| Type | Category | Description |
|------|----------|-------------|
| `a2-card` | Layout | Card container with width variants |
| `a2-row` | Layout | Horizontal row with alignment |
| `a2-column` | Layout | Vertical column with gap |
| `a2-list` | Layout | List of items |
| `a2-text-field` | Form | Form field with label |
| `a2-input` | Form | Basic input |
| `a2-select-field` | Form | Select dropdown with options |
| `a2-date-picker` | Form | Date picker |
| `a2-date-time-input` | Form | Date and time picker |
| `a2-text` | Display | Text display with variants |
| `a2-icon` | Display | Icon display |
| `a2-button` | Action | Button with variants |