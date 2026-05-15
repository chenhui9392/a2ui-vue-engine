# A2Button

按钮组件，支持动作配置。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | string | - | 按钮文字 |
| `type` | `primary \| success \| warning \| danger \| info \| default` | `default` | 按钮类型 |
| `size` | `large \| default \| small` | `default` | 按钮大小 |
| `disabled` | boolean | false | 禁用状态 |
| `icon` | string | - | 图标名称或图片 URL（提交/保存/确认/确定类按钮自动使用 `Promotion` 图标，无需配置） |
| `color` | string | - | 自定义文字颜色（如 `#018f75`） |
| `bgColor` | string | - | 自定义背景色（如 `#ecfbf9`） |
| `borderColor` | string | - | 自定义边框颜色（如 `#c2f0e7`） |
| `action` | object | - | 点击事件配置，格式见下方说明 |

## 基础示例

<PlaygroundEmbed 
  title="基础按钮"
  :json-example='{
  "id": "btn1",
  "type": "a2-button",
  "props": {
    "text": "点击",
    "type": "primary"
  }
}'
/>

## 按钮类型

<PlaygroundEmbed 
  title="按钮类型"
  :json-example='{
  "id": "btnRow",
  "type": "a2-row",
  "props": { "gutter": 10 },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "children": [
        { "id": "btn1", "type": "a2-button", "props": { "text": "主要", "type": "primary" } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "children": [
        { "id": "btn2", "type": "a2-button", "props": { "text": "成功", "type": "success" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "children": [
        { "id": "btn3", "type": "a2-button", "props": { "text": "警告", "type": "warning" } }
      ]
    },
    {
      "id": "col4",
      "type": "a2-column",
      "children": [
        { "id": "btn4", "type": "a2-button", "props": { "text": "危险", "type": "danger" } }
      ]
    }
  ]
}'
/>

## 按钮大小

<PlaygroundEmbed 
  title="按钮大小"
  :json-example='{
  "id": "sizeRow",
  "type": "a2-row",
  "props": { "gutter": 10 },
  "children": [
    {
      "id": "col1",
      "type": "a2-column",
      "children": [
        { "id": "btnLarge", "type": "a2-button", "props": { "text": "大", "type": "primary", "size": "large" } }
      ]
    },
    {
      "id": "col2",
      "type": "a2-column",
      "children": [
        { "id": "btnDefault", "type": "a2-button", "props": { "text": "默认", "type": "primary" } }
      ]
    },
    {
      "id": "col3",
      "type": "a2-column",
      "children": [
        { "id": "btnSmall", "type": "a2-button", "props": { "text": "小", "type": "primary", "size": "small" } }
      ]
    }
  ]
}'
/>

## 自定义样式示例

<PlaygroundEmbed 
  title="自定义样式按钮"
  :json-example='{
  "id": "customRow",
  "type": "a2-row",
  "props": { "gutter": 16 },
  "children": [
    {
      "id": "resolvedBtn",
      "type": "a2-button",
      "props": {
        "text": "已解决",
        "color": "#018f75",
        "bgColor": "#ecfbf9",
        "borderColor": "#c2f0e7"
      }
    },
    {
      "id": "unresolvedBtn",
      "type": "a2-button",
      "props": {
        "text": "未解决",
        "color": "#E0640C",
        "bgColor": "#FAF1EB",
        "borderColor": "#F5DAC6"
      }
    }
  ]
}'
/>

## 带图标按钮

`icon` 属性支持传入图片 URL，会显示在文字左侧。

<PlaygroundEmbed 
  title="带图标的按钮"
  :json-example='{
  "id": "iconRow",
  "type": "a2-row",
  "props": { "gutter": 16 },
  "children": [
    {
      "id": "iconBtn1",
      "type": "a2-button",
      "props": {
        "text": "已解决",
        "icon": "https://cloud-minio-test.tineco.com/tineco-cloud/agent-octopus/2055184566976921603.png",
        "color": "#018f75",
        "bgColor": "#ecfbf9",
        "borderColor": "#c2f0e7"
      }
    }
  ]
}'
/>

## 点击事件

通过 `action` 属性配置点击事件，外部通过监听 `@message` 接收。

```json
{
  "id": "feedbackBtn",
  "type": "a2-button",
  "props": {
    "text": "已解决"
  },
  "action": {
    "event": {
      "name": "feedbackResolved"
    }
  }
}
```

事件触发后，外部会收到：

```js
{
  type: 'action',
  action: 'click',
  payload: { eventName: 'feedbackResolved' }
}
```

## JSON Schema

```json
{
  "id": "buttonId",
  "type": "a2-button",
  "props": {
    "text": "提交",
    "type": "primary",
    "size": "default",
    "icon": "Check",
    "color": "#2260FA",
    "bgColor": "#2260FA",
    "borderColor": "#2260FA"
  },
  "action": {
    "event": {
      "name": "customEvent"
    }
  }
}
```
