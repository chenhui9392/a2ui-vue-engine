# A2InfoField

Information display field component with icon + label + value layout. Supports multiple value style variants.

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | - | Label text |
| `modelValue` | string | - | Display value |
| `icon` | string | - | Icon name (Element Plus icon) or image URL |
| `variant` | `tag | text | quote` | `text` | Value style variant |
| `size` | `large | default` | `default` | Label font size |
| `bgColor` | string | - | Row background color (auto edge-to-edge when set) |

## Variant Reference

| Variant | Effect |
|---------|--------|
| `text` | Plain text style |
| `tag` | Blue tag style (bg `#EFF4FF`, text `#2260FA`) |
| `quote` | Gray quote block style (bg `#F5F7FA`, radius `8px`) |

## Basic Example

<PlaygroundEmbed 
  title="Basic Info Field"
  :json-example='{
  "id": "field1",
  "type": "a2-info-field",
  "props": {
    "label": "System Name",
    "modelValue": "GOMS"
  }
}'
/>

## Tag Variant Example

<PlaygroundEmbed 
  title="Tag Style"
  :json-example='{
  "id": "tagField",
  "type": "a2-info-field",
  "props": {
    "label": "Module",
    "modelValue": "Order Management",
    "variant": "tag"
  }
}'
/>

## Quote Variant Example

<PlaygroundEmbed 
  title="Quote Block Style"
  :json-example='{
  "id": "quoteField",
  "type": "a2-info-field",
  "props": {
    "label": "Question",
    "modelValue": "This is a question description...",
    "variant": "quote"
  }
}'
/>

## With Icon Example

<PlaygroundEmbed 
  title="Info Field with Icon"
  :json-example='{
  "id": "iconField",
  "type": "a2-info-field",
  "props": {
    "label": "System Name",
    "modelValue": "GOMS",
    "icon": "Monitor"
  }
}'
/>

## JSON Schema

```json
{
  "id": "infoFieldId",
  "type": "a2-info-field",
  "props": {
    "label": "Label Name",
    "modelValue": "Display Value",
    "variant": "tag",
    "icon": "Monitor",
    "size": "default",
    "bgColor": "#F8F8FB"
  }
}
```
