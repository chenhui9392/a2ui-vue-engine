// 员工信息登记表示例
// 演示基础表单组件：Card / Column / Row / Text / TextField / SelectField / Button
export const employeeExample = `[
  {
    "id": "root",
    "component": "Card",
    "child": "main-column",
    "width": "md"
  },
  {
    "id": "main-column",
    "component": "Column",
    "children": [
      "header-row",
      "form-column",
      "submit-row"
    ],
    "align": "stretch"
  },
  {
    "id": "header-row",
    "component": "Row",
    "children": ["title-text"],
    "align": "center"
  },
  {
    "id": "title-text",
    "component": "Text",
    "text": "员工信息登记表",
    "variant": "h3"
  },
  {
    "id": "form-column",
    "component": "Column",
    "children": [
      "name-field",
      "gender-field",
      "education-field",
      "email-field",
      "phone-field"
    ],
    "align": "stretch"
  },
  {
    "id": "name-field",
    "component": "TextField",
    "label": "姓名",
    "placeholder": "请输入员工姓名",
    "value": { "path": "/form/name", "default": "张三" }
  },
  {
    "id": "gender-field",
    "component": "SelectField",
    "label": "性别",
    "placeholder": "请选择性别",
    "options": [
      { "label": "男", "value": "male" },
      { "label": "女", "value": "female" }
    ],
    "value": { "path": "/form/gender", "default": "male" }
  },
  {
    "id": "education-field",
    "component": "SelectField",
    "label": "学历",
    "placeholder": "请选择学历",
    "options": [
      { "label": "高中", "value": "high" },
      { "label": "大专", "value": "college" },
      { "label": "本科", "value": "bachelor" },
      { "label": "硕士", "value": "master" },
      { "label": "博士", "value": "doctor" }
    ],
    "value": { "path": "/form/education" }
  },
  {
    "id": "email-field",
    "component": "TextField",
    "label": "邮箱",
    "placeholder": "请输入邮箱地址",
    "value": { "path": "/form/email" }
  },
  {
    "id": "phone-field",
    "component": "TextField",
    "label": "手机号",
    "placeholder": "请输入手机号码",
    "value": { "path": "/form/phone" }
  },
  {
    "id": "submit-row",
    "component": "Row",
    "children": ["submit-btn"],
    "justify": "end"
  },
  {
    "id": "submit-btn-text",
    "component": "Text",
    "text": "提交"
  },
  {
    "id": "submit-btn",
    "component": "Button",
    "child": "submit-btn-text",
    "type": "primary"
  }
]`
