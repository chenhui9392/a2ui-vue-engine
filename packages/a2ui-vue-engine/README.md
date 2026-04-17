# A2UI Vue Engine

JSON Schema driven UI rendering engine for Vue3 applications.

## Features

- 🚀 **Dynamic Rendering** - Render UI from JSON Schema without Vue templates
- 📦 **Rich Components** - Pre-built components: Card, Row, Column, TextField, SelectField, DateTimeInput, Button, ChoicePicker, etc.
- 🔌 **Element Plus Integration** - Seamless integration with Element Plus
- 🌐 **Internationalization** - Built-in Chinese/English support
- 📝 **Form Data Extraction** - Automatic form field extraction from JSON Schema
- 🔄 **Real-time Preview** - Interactive Playground for testing

## Installation

```bash
# npm
npm install a2ui-vue-engine

# pnpm
pnpm add a2ui-vue-engine

# yarn
yarn add a2ui-vue-engine
```

## Usage

### Global Registration

```typescript
import { createApp } from 'vue'
import A2UIPlugin from 'a2ui-vue-engine'
import 'a2ui-vue-engine/style.css'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(A2UIPlugin)
```

### Basic Example

```vue
<template>
  <A2UIRoot
    ref="a2uiRootRef"
    @message="handleMessage"
    @formData-change="handleFormDataChange"
  />
</template>

<script setup>
import { ref } from 'vue'
import { A2UIRoot } from 'a2ui-vue-engine'

const a2uiRootRef = ref()

// Process JSON schema
const schema = [
  {
    id: "root",
    component: "Card",
    child: "main-column",
    width: "md"
  },
  {
    id: "main-column",
    component: "Column",
    children: ["name-field", "submit-btn"],
    align: "stretch"
  },
  {
    id: "name-field",
    component: "TextField",
    label: "Name",
    value: { path: "/form/name" }
  },
  {
    id: "submit-btn",
    component: "Button",
    child: "submit-btn-text",
    type: "primary"
  },
  {
    id: "submit-btn-text",
    component: "Text",
    text: "Submit"
  }
]

// Render the schema
a2uiRootRef.value.processMessage({
  type: 'node',
  node: schema
})

// Get form data
const formData = a2uiRootRef.value.getFormData()
</script>
```

## Components

### Layout Components

| Component | Description |
|-----------|-------------|
| `A2Card` | Card container with configurable width (xs/sm/md/lg/xl/full) |
| `A2Row` | Horizontal layout container |
| `A2Column` | Vertical layout container |
| `A2List` | List container |

### Form Components

| Component | Description |
|-----------|-------------|
| `A2TextField` | Text input field |
| `A2Input` | Generic input |
| `A2SelectField` | Select dropdown field |
| `A2DatePicker` | Date picker |
| `A2DateTimeInput` | Date and time input |
| `A2ChoicePicker` | Multi-choice picker (supports mutuallyExclusive mode) |

### Display Components

| Component | Description |
|-----------|-------------|
| `A2Text` | Text display |
| `A2Icon` | Icon display |

### Action Components

| Component | Description |
|-----------|-------------|
| `A2Button` | Action button |

## JSON Schema Format

```json
[
  {
    "id": "unique-id",
    "component": "ComponentName",
    "label": "Label text",
    "value": { "path": "/form/fieldName" },
    "options": [
      { "label": "Option 1", "value": "opt1" }
    ],
    "variant": "shortText|longText|h3",
    "required": true,
    "disabled": false
  }
]
```

## A2ChoicePicker Features

- `variant: "mutuallyExclusive"` - Single selection mode
- `displayStyle: "chips"` - Chips/tag style display
- `required: true` - Required field with asterisk
- `disabled: true` - Disabled/readonly mode

## API

### A2UIRoot Props

| Prop | Type | Description |
|------|------|-------------|
| `initialData` | `Record<string, any>` | Initial data state |
| `initialTree` | `A2Node` | Initial tree schema |
| `streamUrl` | `string` | JSONL stream URL |
| `componentMap` | `ComponentMapper` | Custom component map |

### A2UIRoot Methods

| Method | Description |
|--------|-------------|
| `updateData(data)` | Update data state |
| `updateTree(tree)` | Update tree schema |
| `getData()` | Get current data |
| `getTree()` | Get current tree |
| `getFormData()` | Get form data structure |
| `processMessage(msg)` | Process JSONL message |
| `processStream(url)` | Process JSONL stream |

### A2UIRoot Events

| Event | Description |
|-------|-------------|
| `message` | Message from A2UI |
| `error` | Error occurred |
| `ready` | Component ready |
| `complete` | Render complete |
| `formDataChange` | Form data changed |

## License

MIT License

## Links

- [Documentation](https://github.com/a2ui/a2ui-vue-engine#readme)
- [GitHub](https://github.com/a2ui/a2ui-vue-engine)
- [Issues](https://github.com/a2ui/a2ui-vue-engine/issues)