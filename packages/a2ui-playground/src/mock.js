export const defaultJson = `[
  {
    "id": "root",
    "component": "Card",
    "child": "main-column",
    "width": "md",
    "header": "创建工单"
  },
  {
    "id": "main-column",
    "component": "Column",
    "children": [
      "system-field",
      "module-field",
      "question-field",
      "submit-row"
    ],
    "align": "stretch",
    "gap": 20
  },
  {
    "id": "system-field",
    "component": "InfoField",
    "label": "系统名称",
    "value": { "path": "/form/systemName", "default": "国内GOMS" },
    "variant": "tag"
  },
  {
    "id": "module-field",
    "component": "InfoField",
    "label": "模块名称",
    "value": { "path": "/form/moduleName", "default": "订单管理" },
    "variant": "tag"
  },
  {
    "id": "question-field",
    "component": "InfoField",
    "label": "提问内容",
    "value": { "path": "/form/question", "default": "提问内容提问内容提问内容，提问内容提问内容提问内容提问内容提问内容提问内容提问内容提问内容提问内容，提问内容提问内容。" },
    "variant": "quote"
  },
  {
    "id": "submit-row",
    "component": "Row",
    "children": ["submit-btn"]
  },
  {
    "id": "submit-btn",
    "component": "Button",
    "text": "提交"
  }
]`

export const feedbackJson = `[
  {
    "id": "root",
    "component": "Card",
    "width": "sm",
    "child": "feedback-content"
  },
  {
    "id": "feedback-content",
    "component": "Column",
    "children": [
      "feedback-title",
      "feedback-subtitle",
      "feedback-actions"
    ],
    "align": "center",
    "gap": 16
  },
  {
    "id": "feedback-title",
    "component": "Text",
    "text": "当前内容是否已解决您的问题？",
    "size": "large",
    "bold": true
  },
  {
    "id": "feedback-subtitle",
    "component": "Text",
    "text": "您的反馈帮助我们不断优化服务质量",
    "type": "info",
    "size": "small"
  },
  {
    "id": "feedback-actions",
    "component": "Row",
    "children": [
      "resolved-btn",
      "unresolved-btn"
    ],
    "gap": 16,
    "justify": "center"
  },
  {
    "id": "resolved-btn",
    "component": "Button",
    "text": "已解决",
    "icon": "https://cloud-minio-test.tineco.com/tineco-cloud/agent-octopus/2055184566976921602.png",
    "color": "#018f75",
    "bgColor": "#ecfbf9",
    "borderColor": "#c2f0e7",
    "action": {
      "event": {
        "name": "feedbackResolved"
      }
    }
  },
  {
    "id": "unresolved-btn",
    "component": "Button",
    "text": "未解决",
    "icon": "https://cloud-minio-test.tineco.com/tineco-cloud/agent-octopus/2055184566976921603.png",
    "color": "#E0640C",
    "bgColor": "#FAF1EB",
    "borderColor": "#F5DAC6",
    "action": {
      "event": {
        "name": "feedbackUnresolved"
      }
    }
  }
]`
