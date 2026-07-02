# A2Dialog / A2Drawer

Unified **Dialog Runtime** with two display modes: **Dialog (centered)** and **Drawer (side sheet)**. They share the same Runtime, Schema, Footer and Action channel — no duplicated code.

- Backed by `DialogRuntime` + `A2Overlay` (`mode='dialog' | 'drawer'`)
- Supports: **dynamic Form / dynamic Table / dynamic Footer / Submit / Cancel / Action / API**
- All footer buttons go through the Action System

## Components

| Component | mode | Purpose |
|-----------|------|---------|
| `a2-dialog` | `'dialog'` | Centered modal |
| `a2-drawer` | `'drawer'` | Side sheet |
| `a2-overlay` | explicit | Low-level unified component |

## Schema

```ts
interface DialogRuntimeConfig {
  mode?: 'dialog' | 'drawer'
  title?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | string | number
  placement?: 'left' | 'right' | 'top' | 'bottom'
  modal?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  destroyOnClose?: boolean
  content?: A2Node | A2Node[]
  footer?: OverlayFooterButton[]
  submitApi?: {
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    payloadFrom?: 'formData' | 'context' | 'none'
    extraPayload?: Record<string, any>
  }
}
```

## Preset

| preset | default text | default type | action | role |
|--------|--------------|--------------|--------|------|
| `submit` | Submit | primary | `submit` | submit |
| `confirm` | Confirm | primary | `confirm` | submit |
| `cancel` | Cancel | default | `cancel` | cancel |
| `close` | Close | default | `close` | cancel |
| `reset` | Reset | warning | `reset` | custom |
| `custom` | Button | default | `custom` | custom |

## Basic Example

<PlaygroundEmbed
  title="Dialog + Form"
  :json-example='{
  "id": "createDialog",
  "type": "a2-dialog",
  "props": {
    "visible": true,
    "config": {
      "title": "Create Ticket",
      "size": "sm",
      "content": {
        "id": "form",
        "type": "a2-column",
        "children": [
          { "id": "titleField", "type": "a2-text-field", "props": { "label": "Title" } }
        ]
      },
      "footer": [
        { "id": "cancel", "preset": "cancel" },
        { "id": "ok",     "preset": "submit" }
      ]
    }
  }
}'
/>
