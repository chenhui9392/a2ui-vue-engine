<!--
 * @Author: hui.chenn
 * @Description: A2UI JSON UI skill reference
 * @Date: 2026-05-15 16:45:46
-->
# A2UI JSON UI Reference

This file is the technical reference for generating valid A2UI JSON. For natural language generation decisions, see [usage-guide.md](usage-guide.md).

## 1. Supported Formats

A2UI supports two schema formats.

### Flat Format (Default for this skill)

Use this format for generated answers unless the user explicitly requests nested format.

```json
[
  {
    "id": "root",
    "component": "Card",
    "width": "md",
    "header": "Title",
    "child": "body"
  },
  {
    "id": "body",
    "component": "Column",
    "gap": 16,
    "children": ["field1", "submitBtn"]
  }
]
```

Rules:

- The input is an array of nodes.
- The first node must have `id: "root"`.
- `component` uses PascalCase: `Card`, `TextField`, `ChoicePicker`.
- Use `child` for one child ID.
- Use `children` for multiple child IDs.
- Node props are flattened at top level.
- The engine converts flat format to tree format internally.

### Nested Format

Use only when the user explicitly asks for tree/nested schema or when integrating with code that requires nested nodes.

```json
{
  "id": "root",
  "type": "a2-card",
  "props": {
    "width": "md",
    "header": "Title"
  },
  "children": [
    {
      "id": "field1",
      "type": "a2-text-field",
      "props": {
        "label": "姓名"
      }
    }
  ]
}
```

Rules:

- `type` uses kebab-case with `a2-` prefix.
- Component props are placed inside `props`.
- Children are nested node objects.

## 2. Flat Format Property Mapping

| Flat property | Maps to | Components | Notes |
|---|---|---|---|
| `text` | `props.content` | Text | Text content |
| `text` | `props.text` | Button | Button label |
| `label` | `props.label` | TextField, SelectField, DateTimeInput, ChoicePicker, InfoField | Field label |
| `variant` | `props.variant` | Text, TextField, InfoField, ChoicePicker | Visual variant / mode |
| `value.path` | `bindings.modelValue` | Form fields, InfoField | Data binding path |
| `value.default` | initial value / defaultValue | Form fields, ChoicePicker | Default value |
| `width` | `props.width` | Card | Width preset |
| `header` | `props.header` | Card | Header title |
| `headerBgColor` | `props.headerBgColor` | Card | Header background |
| `headerIcon` | `props.headerIcon` | Card | Header icon |
| `align` | `props.justify` or `props.align` | Row, Column | Row maps to justify |
| `justify` | `props.justify` | Row | Explicit row distribution |
| `gap` | `props.gap` | Column | Spacing in px |
| `type` | `props.type` | Button, Input | Button style or input type |
| `icon` / `name` | `props.icon` | Button, Icon, InfoField | Icon name or URL |
| `options` | `props.options` | Select, SelectField | Dropdown options |
| `choiceOptions` | `props.options` | ChoicePicker | ChoicePicker options |
| `displayStyle` | `props.displayStyle` | ChoicePicker | `default` or `chips` |
| `action` | `actions` | Button | Click event config |

## 3. Component Catalog

| Category | Component | Nested type | Flat component | Purpose |
|---|---|---|---|---|
| Layout | A2Card | `a2-card` | `Card` | Card container |
| Layout | A2Row | `a2-row` | `Row` | Horizontal layout |
| Layout | A2Column | `a2-column` | `Column` | Vertical layout |
| Layout | A2List | `a2-list` | `List` | Repeating list |
| Form | A2TextField | `a2-text-field` | `TextField` | Labeled text field |
| Form | A2Input | `a2-input` | `Input` | Basic input |
| Form | A2Select | `a2-select` | `Select` | Basic select |
| Form | A2SelectField | `a2-select-field` | `SelectField` | Labeled select |
| Form | A2DatePicker | `a2-date-picker` | `DatePicker` | Date picker |
| Form | A2DateTimeInput | `a2-date-time-input` | `DateTimeInput` | Date-time picker |
| Form | A2ChoicePicker | `a2-choice-picker` | `ChoicePicker` | Single/multiple choice cards |
| Display | A2Text | `a2-text` | `Text` | Text display |
| Display | A2Icon | `a2-icon` | `Icon` | Icon element |
| Display | A2InfoField | `a2-info-field` | `InfoField` | Label + value display |
| Action | A2Button | `a2-button` | `Button` | Action button |

## 4. Common Props

| Pattern | Values | Components |
|---|---|---|
| Card width | `xs`, `sm`, `md`, `lg`, `xl`, `full` | Card |
| Button type | `primary`, `success`, `warning`, `danger`, `info`, `default` | Button |
| Text variant | `h1`, `h2`, `h3`, `h4`, `p`, `shortText`, `longText` | Text |
| TextField variant | `shortText`, `longText` | TextField |
| InfoField variant | `text`, `tag`, `quote` | InfoField |
| ChoicePicker variant | `default`, `mutuallyExclusive` | ChoicePicker |
| ChoicePicker display | `default`, `chips` | ChoicePicker `displayStyle` |
| Row justify | `start`, `end`, `center`, `space-around`, `space-between` | Row |
| Column align | `start`, `center`, `end`, `stretch` | Column |

## 5. Component Reference

### Card

Container with optional header and width preset.

```json
{
  "id": "root",
  "component": "Card",
  "width": "md",
  "header": "申请单",
  "child": "body"
}
```

Useful props:

| Prop | Values | Notes |
|---|---|---|
| `width` | `xs`, `sm`, `md`, `lg`, `xl`, `full` | Default-like forms usually use `md` |
| `header` | string | Header title |
| `headerBgColor` | color string | Header background |
| `headerIcon` | string | Icon name or URL |

### Column

Vertical layout container.

```json
{
  "id": "formBody",
  "component": "Column",
  "gap": 16,
  "children": ["field1", "field2", "btnRow"]
}
```

### Row

Horizontal layout container.

```json
{
  "id": "btnRow",
  "component": "Row",
  "justify": "end",
  "children": ["submitBtn"]
}
```

If a Row only contains Button children and no justify is set, the engine may auto-align it to the end. Prefer setting `justify: "end"` explicitly for generated output.

### TextField

Labeled text input or textarea.

```json
{
  "id": "reason",
  "component": "TextField",
  "label": "申请原因",
  "variant": "longText",
  "value": {
    "path": "/form/reason",
    "default": ""
  }
}
```

Useful props:

| Prop | Values | Notes |
|---|---|---|
| `label` | string | Field label |
| `variant` | `shortText`, `longText` | `longText` maps to textarea |
| `rows` | number | Textarea rows |
| `placeholder` | string | Placeholder |
| `required` | boolean | Required marker |
| `disabled` | boolean | Disabled state |
| `value` | `{ path, default? }` | Data binding |

### Input

Basic input. Use mainly for password or simple standalone inputs.

```json
{
  "id": "password",
  "component": "Input",
  "type": "password",
  "placeholder": "请输入密码",
  "value": {
    "path": "/form/password",
    "default": ""
  }
}
```

### SelectField

Labeled dropdown select.

```json
{
  "id": "priority",
  "component": "SelectField",
  "label": "优先级",
  "options": [
    { "label": "高", "value": "high" },
    { "label": "中", "value": "medium" },
    { "label": "低", "value": "low" }
  ],
  "value": {
    "path": "/form/priority",
    "default": "medium"
  }
}
```

### DatePicker

Date-only picker.

```json
{
  "id": "applyDate",
  "component": "DatePicker",
  "placeholder": "请选择日期",
  "value": {
    "path": "/form/applyDate",
    "default": ""
  }
}
```

### DateTimeInput

Date-time picker.

```json
{
  "id": "startTime",
  "component": "DateTimeInput",
  "label": "开始时间",
  "enableDate": true,
  "enableTime": true,
  "value": {
    "path": "/form/startTime",
    "default": ""
  }
}
```

### ChoicePicker

Single or multiple choice card/chip picker.

```json
{
  "id": "permissionType",
  "component": "ChoicePicker",
  "label": "权限类型",
  "variant": "mutuallyExclusive",
  "displayStyle": "chips",
  "required": true,
  "choiceOptions": [
    { "label": "内网访问", "value": "intranet" },
    { "label": "外网访问", "value": "internet" },
    { "label": "VPN 权限", "value": "vpn" }
  ],
  "value": {
    "path": "/form/permissionType",
    "default": "intranet"
  }
}
```

Rules:

- Use `variant: "default"` for multiple selection.
- Use `variant: "mutuallyExclusive"` for single selection.
- Use `displayStyle: "chips"` for compact chip-like display.
- In flat format, prefer `choiceOptions` for options. It is mapped to `props.options` internally.
- Multi-select default values should be arrays.
- Single-select default values should be a string or number.

### InfoField

Read-only label + value display.

```json
{
  "id": "status",
  "component": "InfoField",
  "label": "状态",
  "variant": "tag",
  "value": {
    "path": "/form/status",
    "default": "进行中"
  }
}
```

Variants:

| Variant | Use case |
|---|---|
| `text` | Normal display value |
| `tag` | Status/type labels |
| `quote` | Long descriptions or quoted content |

### Text

Display text content.

```json
{
  "id": "title",
  "component": "Text",
  "text": "网络权限申请",
  "variant": "h3",
  "bold": true
}
```

### Button

Action button.

```json
{
  "id": "submitBtn",
  "component": "Button",
  "text": "提交申请",
  "type": "primary",
  "action": {
    "event": {
      "name": "submitApply"
    }
  }
}
```

Action output is handled by the engine as a click action event.

### Icon

Element Plus icon element.

```json
{
  "id": "checkIcon",
  "component": "Icon",
  "name": "Check",
  "size": "default",
  "color": "#67c23a"
}
```

Common icons: `Check`, `Close`, `Plus`, `Minus`, `Edit`, `Delete`, `Search`, `Refresh`, `User`, `Setting`, `Document`, `Folder`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`.

## 6. Common Layout Patterns

### Card + Column Form

```json
[
  { "id": "root", "component": "Card", "width": "md", "header": "表单标题", "child": "formBody" },
  { "id": "formBody", "component": "Column", "gap": 16, "children": ["name", "remark", "btnRow"] },
  { "id": "name", "component": "TextField", "label": "姓名", "value": { "path": "/form/name", "default": "" } },
  { "id": "remark", "component": "TextField", "label": "备注", "variant": "longText", "value": { "path": "/form/remark", "default": "" } },
  { "id": "btnRow", "component": "Row", "justify": "end", "children": ["submitBtn"] },
  { "id": "submitBtn", "component": "Button", "text": "提交", "type": "primary", "action": { "event": { "name": "submitForm" } } }
]
```

### Read-only Detail Card

```json
[
  { "id": "root", "component": "Card", "width": "md", "header": "详情", "child": "detailBody" },
  { "id": "detailBody", "component": "Column", "gap": 12, "children": ["orderNo", "status", "description"] },
  { "id": "orderNo", "component": "InfoField", "label": "订单号", "value": { "path": "/form/orderNo", "default": "SO20260625001" } },
  { "id": "status", "component": "InfoField", "label": "状态", "variant": "tag", "value": { "path": "/form/status", "default": "处理中" } },
  { "id": "description", "component": "InfoField", "label": "说明", "variant": "quote", "value": { "path": "/form/description", "default": "这里展示较长说明内容。" } }
]
```

## 7. Validation Prompt

When returning generated JSON to users, append:

> **在线验证提示**
>
> 生成的 A2UI JSON 配置可以前往以下 Playground 进行实时预览与验证：
>
> [A2UI Playground - 在线调试](https://chenhui9392.github.io/a2ui-vue-engine/playground.html)
>
> 将生成的 JSON 粘贴至 Playground 编辑器后，点击【运行】按钮，即可查看渲染效果并验证配置正确性。
