---
name: a2ui-json-ui
description: Generate JSON Schema configurations for the A2UI Vue rendering engine. Use when the user needs to create UI layouts, forms, cards, or any interface using A2UI components, or when working with JSON-driven Vue component rendering.
---

# A2UI JSON UI Skill

## Overview

A2UI is a JSON Schema-driven Vue3 UI rendering engine. Components are declared via JSON and rendered dynamically. All UI construction tasks should output valid JSON configurations.

## JSON Format Spec

A2UI supports **two** formats:

### 1. Nested Format

```json
{
  "id": "uniqueId",
  "type": "a2-component",
  "props": { ... },
  "children": [ ... ],
  "action": { ... }
}
```

Rules:
- `type` uses kebab-case prefix: `a2-button`, `a2-card`, `a2-text-field`
- `props` contains all component properties
- `children` is an array of child nodes

### 2. Flat Format (Recommended)

All nodes are defined in a flat array. Parent-child relationships use `children` with ID strings:

```json
[
  {
    "id": "root",
    "component": "Card",
    "width": "sm",
    "children": ["titleText", "systemName", "submitBtn"]
  },
  {
    "id": "titleText",
    "component": "Text",
    "text": "Title",
    "variant": "h3",
    "bold": true,
    "color": "#F56C6C"
  },
  {
    "id": "systemName",
    "component": "InfoField",
    "label": "System",
    "content": "Value",
    "variant": "tag"
  },
  {
    "id": "submitBtn",
    "component": "Button",
    "text": "Submit",
    "type": "primary",
    "action": { "event": { "name": "submitForm" } }
  }
]
```

Rules:
- Input is an **array** of nodes, not a nested object
- **First node must have `id: "root"`** (required by engine)
- `component` uses PascalCase: `Button`, `Card`, `TextField`
- `child` (singular) references a **single** child node ID as string: `"child": "nodeId"`
- `children` (plural) is an array of child node IDs: `"children": ["id1", "id2"]`
- Properties are flattened at the top level (no nested `props` object)
- The engine auto-detects flat format and converts to tree internally

### Flat Format Property Mapping

| Flat Property | Maps To (Tree) | Components | Notes |
|---------------|----------------|------------|-------|
| `text` | `props.content` | Text | Text content |
| `text` | `props.text` | Button | Button label |
| `label` | `props.label` | InfoField, TextField, SelectField, DateTimeInput, ChoicePicker | Field label |
| `content` | `props.modelValue` | InfoField | Static display value |
| `content` | `props.content` | OptionCard | Card body text |
| `variant` | `props.variant` | Text, TextField, InfoField, ChoicePicker | Visual variant |
| `icon` | `props.icon` | Icon, Button, InfoField | Icon name or URL |
| `name` | `props.icon` | Icon, OptionCard | Fallback icon name |
| `type` | `props.type` | Button | Button style type |
| `width` | `props.width` | Card | Card width preset |
| `header` | `props.header` | Card | Card header title |
| `headerBgColor` | `props.headerBgColor` | Card | Header background color |
| `headerIcon` | `props.headerIcon` | Card | Header icon URL |
| `align` | `props.justify` + `props.align` | Row | Horizontal alignment |
| `justify` | `props.justify` | Row | Explicit horizontal distribution |
| `gap` | `props.gap` | Column | Spacing (px) |
| `color` | `props.color` | Text | Text color |
| `bold` | `props.bold` | Text | Bold text |
| `size` | `props.size` | Text, InfoField | Size preset |
| `action` | `actions` array | Button | Click event config |
| `value.path` | `bindings.modelValue` | Form fields, InfoField | Data binding path |
| `value.default` | Initial data value | Form fields, InfoField | Default value for data binding |

## Component Catalog

| Category | Component | Type (Nested) | Component (Flat) | Purpose |
|----------|-----------|---------------|------------------|---------|
| Layout | A2Card | `a2-card` | `Card` | Card container with width presets |
| Layout | A2Row | `a2-row` | `Row` | Horizontal row layout |
| Layout | A2Column | `a2-column` | `Column` | Vertical column layout |
| Layout | A2List | `a2-list` | `List` | Repeating item list |
| Form | A2TextField | `a2-text-field` | `TextField` | Labeled text input/textarea |
| Form | A2Input | `a2-input` | `Input` | Basic input box |
| Form | A2Select | `a2-select` | `Select` | Basic select (no label) |
| Form | A2SelectField | `a2-select-field` | `SelectField` | Labeled select dropdown |
| Form | A2DatePicker | `a2-date-picker` | `DatePicker` | Date picker |
| Form | A2DateTimeInput | `a2-date-time-input` | `DateTimeInput` | Date-time picker |
| Form | A2ChoicePicker | `a2-choice-picker` | `ChoicePicker` | Multi/single choice cards |
| Display | A2Text | `a2-text` | `Text` | Text display with variants |
| Display | A2Icon | `a2-icon` | `Icon` | Icon element (Element Plus Icons) |
| Display | A2InfoField | `a2-info-field` | `InfoField` | Label + value display |
| Action | A2Button | `a2-button` | `Button` | Button with action support |

## Data Binding

Form and display components use `value.path` for two-way data binding:

```json
{
  "props": {
    "value": { "path": "/form/fieldName", "default": "initialValue" }
  }
}
```

- `path`: Data binding path (e.g., `/form/username`)
- `default`: Optional initial value

For flat format:
```json
{
  "component": "TextField",
  "value": { "path": "/form/name", "default": "张三" }
}
```

InfoField with data binding and default value:
```json
{
  "component": "InfoField",
  "label": "系统名称",
  "value": { "path": "/form/systemName", "default": "国内GOMS" },
  "variant": "tag"
}
```

## Layout Patterns

### Card + Column Form

```json
{
  "id": "formCard",
  "type": "a2-card",
  "props": { "width": "xs", "header": "Title" },
  "children": [
    {
      "id": "formCol",
      "type": "a2-column",
      "props": { "gap": 16 },
      "children": [
        { "id": "name", "type": "a2-text-field", "props": { "label": "Name", "prop": "name" } },
        { "id": "email", "type": "a2-text-field", "props": { "label": "Email", "prop": "email" } },
        { "id": "btn", "type": "a2-button", "props": { "text": "Submit", "type": "primary" } }
      ]
    }
  ]
}
```

### Row + Column Grid

```json
{
  "id": "row1",
  "type": "a2-row",
  "props": { "gutter": 20 },
  "children": [
    { "id": "c1", "type": "a2-column", "props": { "span": 12 }, "children": [...] },
    { "id": "c2", "type": "a2-column", "props": { "span": 12 }, "children": [...] }
  ]
}
```

### Minimal Flat Layout (Flat Format)

For absolute minimum nesting, use flat format with ID references:

```json
[
  {
    "id": "root",
    "component": "Card",
    "width": "sm",
    "header": "【创建工单2】",
    "child": "bodyFields"
  },
  {
    "id": "bodyFields",
    "component": "Column",
    "children": ["systemName", "moduleName", "questionContent", "btnRow"]
  },
  {
    "id": "systemName",
    "component": "InfoField",
    "label": "系统名称",
    "value": { "path": "/form/systemName", "default": "国内GOMS" },
    "variant": "tag"
  },
  {
    "id": "moduleName",
    "component": "InfoField",
    "label": "模块名称",
    "value": { "path": "/form/moduleName", "default": "订单管理" },
    "variant": "tag"
  },
  {
    "id": "questionContent",
    "component": "InfoField",
    "label": "提问内容",
    "value": { "path": "/form/question", "default": "提问内容提问内容提问内容，提问内容提问内容提问内容提问内容提问内容提问内容提问内容提问内容，提问内容提问内容。" },
    "variant": "quote"
  },
  {
    "id": "btnRow",
    "component": "Row",
    "children": ["submitBtn"]
  },
  {
    "id": "submitBtn",
    "component": "Button",
    "text": "提交",
    "type": "primary",
    "action": { "event": { "name": "submitForm" } }
  }
]
```

Rules for minimal flat layout:
- All nodes are siblings in a single flat array
- Use `child` (string) for single child reference; use `children` (array) for multiple children
- No nested objects or arrays inside node definitions
- Logical depth: 2 levels (`Card > child`)
- Use `value.path` + `value.default` for field values (data binding with default)
- Use `header` on Card for title (auto-renders icon + gray bar + title text)
- Wrap Button in Row for right-alignment (Row auto-applies `justify: end` when containing Button)

## Common Prop Patterns

| Pattern | Value | Components |
|---------|-------|------------|
| Width preset | `xs` (300px), `sm` (400px), `md` (560px), `lg` (720px), `xl` (960px), `full` | A2Card |
| Button type | `primary`, `success`, `warning`, `danger`, `info`, `default` | A2Button |
| Text variant | `h1`, `h2`, `h3`, `h4`, `p`, `shortText`, `longText` | A2Text |
| InfoField variant | `text`, `tag`, `quote` | A2InfoField |
| ChoicePicker variant | `default` (multi), `mutuallyExclusive` (single) | A2ChoicePicker |
| ChoicePicker display | `default`, `chips` | A2ChoicePicker |
| TextField variant | `shortText`, `longText` | A2TextField |
| Row justify | `start`, `end`, `center`, `space-around`, `space-between` | A2Row |
| Column align | `start`, `center`, `end`, `stretch` | A2Column |

## Button Action

Configure click events via `action`:

```json
{
  "id": "btn",
  "type": "a2-button",
  "props": { "text": "确认" },
  "action": {
    "event": { "name": "confirmAction" }
  }
}
```

External receives: `{ type: 'action', action: 'click', payload: { eventName: 'confirmAction' } }`

## Best Practices

1. **Always assign unique `id`** to every component node
2. **Prefer flat format as default**: Use flat format for all A2UI JSON generation unless complex deep nesting is unavoidable; nested format is secondary
3. **Wrap forms in `a2-card`** with `a2-column` for consistent spacing
4. **Use `a2-row` + `a2-column`** for multi-column layouts
5. **Use `value.path`** for all form data binding; set `default` when initial value needed
6. **Auto icon for buttons**: Submit/save/confirm/ok buttons auto-use `Promotion` icon, no manual config needed
7. **InfoField tag variant**: Use for status labels (blue: `#EFF4FF` bg, `#2260FA` text)
8. **Prefer flat format for read-only cards**: Flat format with ID references is ideal for info display cards (no deep nesting, easy to maintain)
9. **InfoField value in flat format**: Use `value.path` + `value.default` for data binding; use `content` only for hardcoded static values without data binding
10. **Flat format component names**: Use PascalCase `Card`, `Text`, `InfoField`, `Button` (not kebab-case)

## Reference

For complete component props and examples, see [reference.md](reference.md).
