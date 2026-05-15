---
name: a2ui-json-ui
description: Generate JSON Schema configurations for the A2UI Vue rendering engine. Use when the user needs to create UI layouts, forms, cards, or any interface using A2UI components, or when working with JSON-driven Vue component rendering.
---

# A2UI JSON UI Skill

## Overview

A2UI is a JSON Schema-driven Vue3 UI rendering engine. Components are declared via JSON and rendered dynamically. All UI construction tasks should output valid JSON configurations.

## JSON Format Spec

A2UI supports **two** formats:

### 1. Nested Format (Recommended)

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

### 2. Flat Format

```json
{
  "id": "uniqueId",
  "component": "ComponentName",
  "propName": "value"
}
```

Rules:
- `component` uses PascalCase: `Button`, `Card`, `TextField`
- Properties are flattened at the top level
- `child` references another component's id (singular, not `children`)

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
2. **Use nested format** for new code; flat format for simple flat lists
3. **Wrap forms in `a2-card`** with `a2-column` for consistent spacing
4. **Use `a2-row` + `a2-column`** for multi-column layouts
5. **Use `value.path`** for all form data binding; set `default` when initial value needed
6. **Auto icon for buttons**: Submit/save/confirm/ok buttons auto-use `Promotion` icon, no manual config needed
7. **InfoField tag variant**: Use for status labels (blue: `#EFF4FF` bg, `#2260FA` text)
8. **Minimize nesting depth**: Use `a2-card` `header` prop instead of manual Row+Icon+Text for card titles (saves 2+ levels). Keep layout to `Card > Column > children` (3 levels max) when possible
9. **A2Column gap is fixed at 10px**: Do not set `gap` prop on Column; spacing is automatic
10. **Correct prop names**: A2Text uses `content` (not `text`); A2Icon uses `icon` (not `name`)

## Reference

For complete component props and examples, see [reference.md](reference.md).
