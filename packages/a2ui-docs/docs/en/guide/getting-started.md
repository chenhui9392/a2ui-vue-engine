# Getting Started

## Introduction

A2UI is a JSON-driven UI rendering engine for Vue3. Instead of writing Vue templates, you define your UI through JSON schemas, enabling dynamic, data-driven interfaces.

## Installation

Install A2UI Vue Engine in your project:

::: code-group
```bash [pnpm]
pnpm add a2ui-vue-engine element-plus
```

```bash [npm]
npm install a2ui-vue-engine element-plus
```

```bash [yarn]
yarn add a2ui-vue-engine element-plus
```
:::

## Quick Start

### 1. Register the Plugin

```typescript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import A2UIPlugin from 'a2ui-vue-engine'
import 'a2ui-vue-engine/style.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(A2UIPlugin)
app.mount('#app')
```

### 2. Use A2UIRoot Component

```vue
<template>
  <A2UIRoot
    ref="rootRef"
    @message="handleMessage"
    @formData-change="handleFormData"
  />
</template>

<script setup>
import { ref } from 'vue'
import { A2UIRoot } from 'a2ui-vue-engine'

const rootRef = ref()

function handleMessage(msg) {
  console.log('Message:', msg)
}

function handleFormData(formData) {
  console.log('Form Data:', formData)
}

// Render a JSON schema
function renderSchema(jsonSchema) {
  rootRef.value.processMessage({
    type: 'node',
    node: jsonSchema
  })
}
</script>
```

### 3. Define JSON Schema

```json
{
  "id": "root",
  "type": "a2-card",
  "props": {
    "width": "md",
    "title": "User Registration"
  },
  "children": [
    {
      "id": "name-field",
      "type": "a2-text-field",
      "props": {
        "label": "Name",
        "prop": "name",
        "placeholder": "Enter your name"
      }
    },
    {
      "id": "submit-btn",
      "type": "a2-button",
      "props": {
        "text": "Submit",
        "type": "primary"
      }
    }
  ]
}
```

## Core Concepts

### Components

A2UI provides a set of pre-built components:

| Category | Components |
|----------|-----------|
| Layout | A2Card, A2Row, A2Column, A2List |
| Form | A2TextField, A2Input, A2SelectField, A2DatePicker, A2DateTimeInput |
| Display | A2Text, A2Icon |
| Action | A2Button |

### JSON Schema Structure

Each component in the JSON schema follows this structure:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the node |
| `type` | string | Component type (e.g., `a2-card`) |
| `props` | object | Component properties |
| `children` | array | Child nodes |
| `bindings` | object | Data binding configuration |
| `actions` | array | Event action configuration |

## Next Steps

- [Architecture](/guide/architecture) - Learn about the internal architecture
- [JSON Schema](/guide/json-schema) - Detailed schema reference
- [Components](/components/) - Explore all available components