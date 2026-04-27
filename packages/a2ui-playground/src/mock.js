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
