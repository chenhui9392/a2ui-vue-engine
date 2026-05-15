<!--
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-05-15 16:45:46
 * @LastEditTime: 2026-05-15 16:45:55
 * @LastEditors: hui.chenn
-->
# A2UI Component Reference

## A2Button

Button with action support.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | - | Button text |
| `type` | `primary \| success \| warning \| danger \| info \| default` | `default` | Button style |
| `size` | `large \| default \| small` | `default` | Button size |
| `disabled` | boolean | false | Disabled state |
| `icon` | string | - | Icon name or image URL (submit/save/confirm/ok auto-use `Promotion`) |
| `color` | string | - | Custom text color |
| `bgColor` | string | - | Custom background color |
| `borderColor` | string | - | Custom border color |
| `action` | object | - | Click event config |

**Action schema:**
```json
{
  "action": {
    "event": { "name": "eventName" }
  }
}
```

**Example:**
```json
{
  "id": "btn1",
  "type": "a2-button",
  "props": { "text": "提交", "type": "primary" },
  "action": { "event": { "name": "submitForm" } }
}
```

---

## A2Card

Card container with width presets.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `xs \| sm \| md \| lg \| xl \| full \| string` | `md` | Card width |
| `header` | string | - | Header title (auto shows Document icon) |
| `headerBgColor` | string | `#F8F8FB` | Header background |
| `shadow` | `always \| hover \| never` | `hover` | Shadow effect |

**Width presets:**

| Value | Pixel |
|-------|-------|
| `xs` | 300px |
| `sm` | 400px |
| `md` | 560px |
| `lg` | 720px |
| `xl` | 960px |
| `full` | 100% |

**Example:**
```json
{
  "id": "card1",
  "type": "a2-card",
  "props": { "width": "xs", "header": "Title" },
  "children": [...]
}
```

---

## A2Column

Vertical column layout.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `span` | number | 24 | Width ratio (1-24) |
| `align` | `start \| center \| end \| stretch` | `stretch` | Horizontal alignment |

**Example:**
```json
{
  "id": "col1",
  "type": "a2-column",
  "props": { "gap": 16, "align": "stretch" },
  "children": [...]
}
```

---

## A2Row

Horizontal row layout.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gutter` | number | 0 | Column spacing (px) |
| `justify` | `start \| end \| center \| space-around \| space-between` | `start` | Horizontal alignment |
| `align` | `top \| middle \| bottom` | `top` | Vertical alignment |

**Example:**
```json
{
  "id": "row1",
  "type": "a2-row",
  "props": { "gutter": 20, "justify": "center" },
  "children": [...]
}
```

---

## A2List

Repeating item list.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | array | [] | List item data |

**Example:**
```json
{
  "id": "list1",
  "type": "a2-list",
  "props": {
    "items": [
      { "label": "Item 1", "value": "v1" },
      { "label": "Item 2", "value": "v2" }
    ]
  }
}
```

---

## A2TextField

Labeled form text field.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Field label |
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Placeholder text |
| `variant` | `shortText \| longText` | `shortText` | Input type |
| `rows` | number | 4 | Rows for longText |
| `disabled` | boolean | false | Disabled state |
| `required` | boolean | false | Required field |
| `value` | `{ path, default? }` | - | Data binding |

**Example:**
```json
{
  "id": "nameField",
  "type": "a2-text-field",
  "props": {
    "label": "姓名",
    "prop": "name",
    "placeholder": "请输入姓名",
    "required": true,
    "value": { "path": "/form/name", "default": "张三" }
  }
}
```

---

## A2Input

Basic input box.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Placeholder text |
| `type` | `text \| password \| number` | `text` | Input type |
| `disabled` | boolean | false | Disabled state |
| `clearable` | boolean | false | Clear button |
| `value` | `{ path, default? }` | - | Data binding |

**Example:**
```json
{
  "id": "input1",
  "type": "a2-input",
  "props": { "prop": "search", "placeholder": "搜索...", "clearable": true }
}
```

---

## A2Select

Basic select without label wrapper.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | string | `请选择` | Placeholder |
| `options` | array | [] | Options list |
| `disabled` | boolean | false | Disabled |
| `clearable` | boolean | false | Clear button |
| `multiple` | boolean | false | Multi-select |
| `filterable` | boolean | false | Searchable |
| `multipleLimit` | number | 0 | Max multi-select count |
| `size` | `large \| default \| small` | `default` | Size |
| `value` | `{ path, default? }` | - | Data binding |

**Option structure:** `{ label: string, value: string | number, disabled?: boolean }`

**Example:**
```json
{
  "id": "sel1",
  "type": "a2-select",
  "props": {
    "placeholder": "请选择",
    "multiple": true,
    "clearable": true,
    "options": [
      { "label": "选项一", "value": "opt1" },
      { "label": "选项二", "value": "opt2" }
    ],
    "value": { "path": "/form/select", "default": ["opt1"] }
  }
}
```

---

## A2SelectField

Labeled select dropdown.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Field label |
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Placeholder |
| `options` | array | [] | Options list |
| `clearable` | boolean | false | Clear button |
| `disabled` | boolean | false | Disabled |
| `value` | `{ path, default? }` | - | Data binding |

**Example:**
```json
{
  "id": "gender",
  "type": "a2-select-field",
  "props": {
    "label": "性别",
    "prop": "gender",
    "options": [
      { "label": "男", "value": "male" },
      { "label": "女", "value": "female" }
    ],
    "value": { "path": "/form/gender", "default": "male" }
  }
}
```

---

## A2DatePicker

Date picker.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Placeholder |
| `format` | string | `YYYY-MM-DD` | Date format |
| `disabled` | boolean | false | Disabled |
| `value` | `{ path, default? }` | - | Data binding |

**Example:**
```json
{
  "id": "date1",
  "type": "a2-date-picker",
  "props": {
    "prop": "birthday",
    "placeholder": "请选择日期",
    "value": { "path": "/form/date", "default": "2026-04-29" }
  }
}
```

---

## A2DateTimeInput

Date-time picker.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prop` | string | - | Form data key |
| `placeholder` | string | - | Placeholder |
| `enableDate` | boolean | true | Enable date selection |
| `enableTime` | boolean | true | Enable time selection |
| `format` | string | `YYYY-MM-DD HH:mm:ss` | Format string |
| `disabled` | boolean | false | Disabled |
| `value` | `{ path, default? }` | - | Data binding |

**Example:**
```json
{
  "id": "dt1",
  "type": "a2-date-time-input",
  "props": {
    "prop": "scheduleTime",
    "placeholder": "请选择日期和时间",
    "enableDate": true,
    "enableTime": true,
    "value": { "path": "/form/datetime", "default": "2026-04-29 10:30:00" }
  }
}
```

---

## A2ChoicePicker

Multi/single choice card picker.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Label text |
| `options` | array | [] | Options list |
| `variant` | `default \| mutuallyExclusive` | `default` | Selection mode |
| `displayStyle` | `default \| chips` | `default` | Display style |
| `required` | boolean | false | Required |
| `disabled` | boolean | false | Disabled |
| `value` | `{ path, default? }` | - | Data binding |

**Option structure:** `{ label: string, value: string | number, description?: string, disabled?: boolean }`

- `default` variant: multi-select
- `mutuallyExclusive` variant: single-select
- When `required` is false in single-select mode, clicking selected item deselects it

**Example:**
```json
{
  "id": "picker",
  "type": "a2-choice-picker",
  "props": {
    "label": "选择权限",
    "variant": "mutuallyExclusive",
    "displayStyle": "chips",
    "required": true,
    "options": [
      { "label": "外网访问", "value": "internet", "description": "访问外部网站" },
      { "label": "邮件收发", "value": "email" }
    ],
    "value": { "path": "/form/permission", "default": "internet" }
  }
}
```

---

## A2Text

Text display with variants.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | string | - | Text content |
| `variant` | `h1 \| h2 \| h3 \| h4 \| p \| shortText \| longText` | `p` | Text style |
| `size` | `large \| default \| small` | `default` | Font size |
| `bold` | boolean | false | Bold |
| `color` | string | - | Custom color |
| `type` | `primary \| success \| warning \| danger \| info` | - | Type color |
| `italic` | boolean | false | Italic |
| `underline` | boolean | false | Underline |

**Example:**
```json
{
  "id": "t1",
  "type": "a2-text",
  "props": { "content": "标题", "variant": "h3", "bold": true, "color": "#2260FA" }
}
```

---

## A2Icon

Icon element (Element Plus Icons).

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | string | - | Icon name |
| `size` | number | 16 | Icon size (px) |
| `color` | string | - | Icon color |

**Common icons:** `Check`, `Close`, `Plus`, `Minus`, `Edit`, `Delete`, `Search`, `Refresh`, `User`, `Setting`, `Document`, `Folder`, `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`

**Example:**
```json
{
  "id": "icon1",
  "type": "a2-icon",
  "props": { "icon": "Check", "size": 24, "color": "#67c23a" }
}
```

---

## A2InfoField

Label + value display field.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | Label text |
| `modelValue` | string | - | Display value |
| `icon` | string | - | Icon name or image URL |
| `variant` | `tag \| text \| quote` | `text` | Value style |
| `size` | `large \| default` | `default` | Label font size |
| `bgColor` | string | - | Row background color |
| `value` | `{ path, default? }` | - | Data binding |

**Variant styles:**
- `text`: Normal text
- `tag`: Blue tag (`#EFF4FF` bg, `#2260FA` text)
- `quote`: Gray quote block (`#F5F7FA` bg, 8px radius)

**Example:**
```json
{
  "id": "info1",
  "type": "a2-info-field",
  "props": {
    "label": "状态",
    "modelValue": "进行中",
    "variant": "tag",
    "icon": "Monitor"
  }
}
```
