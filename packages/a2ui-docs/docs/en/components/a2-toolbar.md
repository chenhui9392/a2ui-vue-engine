# A2Toolbar

Toolbar component. Schema-driven, **all buttons unified through the Action System**. Presets: add / delete / refresh / export / batch / custom.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | — | Toolbar title |
| `centerText` | `string` | — | Center hint text |
| `buttons` | `A2ToolbarButton[]` | `[]` | Left buttons (primary actions) |
| `rightButtons` | `A2ToolbarButton[]` | `[]` | Right buttons (secondary actions) |
| `size` | `'large' \| 'default' \| 'small'` | `'default'` | Size |
| `bordered` | `boolean` | `true` | Show border |

### `A2ToolbarButton`

Extends `A2Node`. Additional fields:

| Field | Type | Description |
|-------|------|-------------|
| `preset` | `'add' \| 'delete' \| 'refresh' \| 'export' \| 'batch' \| 'custom'` | Preset action shortcut |
| `visible` | `boolean` | Whether to show |

## Basic Example

<PlaygroundEmbed
  title="Basic Toolbar"
  :json-example='{
  "id": "toolbar1",
  "type": "a2-toolbar",
  "props": {
    "buttons": [
      { "id": "add", "preset": "add" },
      { "id": "delete", "preset": "delete" },
      { "id": "batch", "preset": "batch" }
    ],
    "rightButtons": [
      { "id": "refresh", "preset": "refresh" },
      { "id": "export", "preset": "export" }
    ]
  }
}'
/>

## JSON Schema

```json
{
  "id": "toolbarId",
  "type": "a2-toolbar",
  "props": {
    "buttons": [ { "id": "add", "preset": "add" } ],
    "rightButtons": [ { "id": "refresh", "preset": "refresh" } ]
  }
}
```
