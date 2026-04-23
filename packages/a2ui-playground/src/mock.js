export const defaultJson = `[
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
      "marital-field",
      "email-field",
      "phone-field",
      "hire-date-field",
      "birth-date-field",
      "salary-field",
      "address-field"
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
    "id": "marital-field",
    "component": "SelectField",
    "label": "婚姻状况",
    "placeholder": "请选择婚姻状况",
    "options": [
      { "label": "未婚", "value": "single" },
      { "label": "已婚", "value": "married" },
      { "label": "离异", "value": "divorced" }
    ],
    "value": { "path": "/form/marital" }
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
    "id": "hire-date-field",
    "component": "DateTimeInput",
    "label": "入职日期",
    "placeholder": "请选择入职日期",
    "value": { "path": "/form/hireDate" }
  },
  {
    "id": "birth-date-field",
    "component": "DateTimeInput",
    "label": "出生日期",
    "placeholder": "请选择出生日期",
    "value": { "path": "/form/birthDate" }
  },
  {
    "id": "salary-field",
    "component": "TextField",
    "label": "薪资",
    "placeholder": "请输入薪资",
    "value": { "path": "/form/salary" }
  },
  {
    "id": "address-field",
    "component": "TextField",
    "label": "家庭住址",
    "placeholder": "请输入详细地址",
    "value": { "path": "/form/address" },
    "variant": "longText",
    "rows": 2
  },
  {
    "id": "submit-row",
    "component": "Row",
    "children": ["reset-btn", "cancel-btn", "submit-btn"],
    "justify": "end"
  },
  {
    "id": "reset-btn-text",
    "component": "Text",
    "text": "重置"
  },
  {
    "id": "reset-btn",
    "component": "Button",
    "child": "reset-btn-text",
    "type": "warning"
  },
  {
    "id": "cancel-btn-text",
    "component": "Text",
    "text": "取消"
  },
  {
    "id": "cancel-btn",
    "component": "Button",
    "child": "cancel-btn-text"
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
