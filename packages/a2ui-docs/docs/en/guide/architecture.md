# Architecture

## Overview

A2UI Vue Engine follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  (Your Vue App - Uses A2UIRoot to render JSON schemas)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      A2UIRoot Component                      │
│  - Receives JSON messages                                    │
│  - Manages state (tree, data)                                │
│  - Provides context to children                              │
│  - Emits events (message, formDataChange)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Message Processor                         │
│  - Processes JSONL stream                                    │
│  - Handles node/data messages                                │
│  - Converts flat format to tree                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Renderer                                │
│  - Renders tree to Vue components                            │
│  - Handles data binding                                       │
│  - Executes actions                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Component Library                          │
│  - A2Card, A2Row, A2Column                                   │
│  - A2TextField, A2Input, A2SelectField                       │
│  - A2Text, A2Icon, A2Button                                  │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

### A2UIRoot.vue

The root component is the main entry point. It:

1. **Accepts JSON input** via `processMessage()` or `streamUrl`
2. **Maintains state**: `tree` (render tree), `data` (form values)
3. **Provides form data**: via `getFormData()` and `formDataChange` event
4. **Exposes methods**:
   - `updateTree(node)` - Update the render tree
   - `updateData(values)` - Update form values
   - `getData()` - Get current data
   - `getFormData()` - Get extracted form structure
   - `processMessage(msg)` - Process A2Message

### MessageProcessor

Handles streaming JSON messages:

```typescript
interface A2Message {
  type: 'node' | 'node_update' | 'data' | 'data_update' | 'action' | 'error' | 'complete'
  id: string
  // ... specific fields per type
}
```

### Renderer

Converts tree nodes to Vue VNodes:

```typescript
function renderTree(node: A2Node, context: RenderContext): VNode
```

## Data Flow

1. **Input**: JSON schema → A2UIRoot.processMessage()
2. **Processing**: MessageProcessor parses and updates tree
3. **Rendering**: Renderer creates VNodes from tree
4. **Binding**: Props are resolved from data context
5. **Events**: Actions emit messages back to parent

## Form Data Extraction

A2UIRoot automatically extracts form fields from the schema:

```typescript
interface FormDataResult {
  form: Record<string, string>
}
```

Fields are extracted from:
- **Tree format**: `props.prop` on form components
- **Flat format**: `value.path` matching `/form/{fieldName}`