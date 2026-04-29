<!--
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-27 15:48:31
 * @LastEditTime: 2026-04-27 15:48:47
 * @LastEditors: hui.chenn
-->
# A2InfoField

信息展示字段组件，支持图标+标签+值布局，值支持多种样式变体。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `label` | string | - | 标签文字 |
| `modelValue` | string | - | 显示的值 |
| `icon` | string | - | 图标名称（Element Plus 图标）或图片 URL |
| `variant` | `tag | text | quote` | `text` | 值的样式变体 |
| `size` | `large | default` | `default` | 标签字体大小 |
| `bgColor` | string | - | 整行背景色（设置后自动贴边显示） |
| `value` | `{ path: string, default?: any }` | - | 数据绑定路径与默认值 |

## 变体说明

| 变体 | 效果 |
|------|------|
| `text` | 普通文本样式 |
| `tag` | 蓝色标签样式（背景 `#EFF4FF`，文字 `#2260FA`） |
| `quote` | 灰色引用块样式（背景 `#F5F7FA`，圆角 `8px`） |

## 扁平格式默认值

在扁平格式中，可以通过 `value.default` 设置初始显示值：

```json
{
  "id": "infoField",
  "component": "InfoField",
  "label": "系统名称",
  "value": { "path": "/form/system", "default": "国内GOMS" }
}
```

<PlaygroundEmbed 
  title="带默认值的InfoField"
  :json-example='[
  {
    "id": "root",
    "component": "Card",
    "child": "infoField",
    "width": "xs"
  },
  {
    "id": "infoField",
    "component": "InfoField",
    "label": "系统名称",
    "value": { "path": "/form/system", "default": "国内GOMS" }
  }
]'
/>

## 基础示例

<PlaygroundEmbed 
  title="基础信息字段"
  :json-example='{
  "id": "field1",
  "type": "a2-info-field",
  "props": {
    "label": "系统名称",
    "modelValue": "国内GOMS"
  }
}'
/>

## Tag 变体示例

<PlaygroundEmbed 
  title="标签样式"
  :json-example='{
  "id": "tagField",
  "type": "a2-info-field",
  "props": {
    "label": "模块名称",
    "modelValue": "订单管理",
    "variant": "tag"
  }
}'
/>

## Quote 变体示例

<PlaygroundEmbed 
  title="引用块样式"
  :json-example='{
  "id": "quoteField",
  "type": "a2-info-field",
  "props": {
    "label": "提问内容",
    "modelValue": "这是一个问题描述内容...",
    "variant": "quote"
  }
}'
/>

## 带图标示例

<PlaygroundEmbed 
  title="带图标的信息字段"
  :json-example='{
  "id": "iconField",
  "type": "a2-info-field",
  "props": {
    "label": "系统名称",
    "modelValue": "国内GOMS",
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
    "label": "标签名称",
    "modelValue": "显示值",
    "variant": "tag",
    "icon": "Monitor",
    "size": "default",
    "bgColor": "#F8F8FB"
  }
}
```
