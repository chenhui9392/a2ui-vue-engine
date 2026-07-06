// 网络权限申请单示例
// 演示多分区表单结构 + ChoicePicker 多选 + DateTimeInput 日期组件
export const networkExample = `[
  {
    "id": "root",
    "component": "Card",
    "child": "main-column",
    "width": "lg"
  },
  {
    "id": "main-column",
    "component": "Column",
    "children": [
      "header-row",
      "applicant-section",
      "permission-section",
      "reason-section",
      "date-section",
      "action-row"
    ],
    "align": "stretch",
    "gap": 20
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
    "text": "网络权限申请单",
    "variant": "h3"
  },
  {
    "id": "applicant-section",
    "component": "Column",
    "children": [
      "applicant-row1",
      "applicant-row2"
    ],
    "align": "stretch",
    "gap": 16
  },
  {
    "id": "applicant-row1",
    "component": "Row",
    "children": ["name-field", "dept-field"],
    "gap": 16,
    "align": "stretch"
  },
  {
    "id": "applicant-row2",
    "component": "Row",
    "children": ["position-field", "empno-field"],
    "gap": 16,
    "align": "stretch"
  },
  {
    "id": "name-field",
    "component": "TextField",
    "label": "申请人姓名",
    "placeholder": "请输入姓名",
    "value": { "path": "/form/applicantName" }
  },
  {
    "id": "dept-field",
    "component": "SelectField",
    "label": "所属部门",
    "placeholder": "请选择部门",
    "options": [
      { "label": "技术研发部", "value": "tech" },
      { "label": "产品设计部", "value": "design" },
      { "label": "市场营销部", "value": "marketing" },
      { "label": "人力资源部", "value": "hr" },
      { "label": "财务部", "value": "finance" },
      { "label": "行政部", "value": "admin" }
    ],
    "value": { "path": "/form/department" }
  },
  {
    "id": "position-field",
    "component": "TextField",
    "label": "职位",
    "placeholder": "请输入职位",
    "value": { "path": "/form/position" }
  },
  {
    "id": "empno-field",
    "component": "TextField",
    "label": "工号",
    "placeholder": "请输入工号",
    "value": { "path": "/form/empNo" }
  },
  {
    "id": "permission-section",
    "component": "Column",
    "children": ["permission-label", "permission-picker"],
    "align": "stretch",
    "gap": 8
  },
  {
    "id": "permission-label",
    "component": "Text",
    "text": "申请权限类型",
    "variant": "shortText"
  },
  {
    "id": "permission-picker",
    "component": "ChoicePicker",
    "label": "",
    "columns": 2,
    "choiceOptions": [
      { "label": "外网访问权限", "value": "internet", "description": "访问外部网站和资源" },
      { "label": "邮件收发权限", "value": "email", "description": "发送和接收外部邮件" },
      { "label": "文件传输权限", "value": "ftp", "description": "上传下载外部文件" },
      { "label": "VPN接入权限", "value": "vpn", "description": "远程接入公司内网" }
    ],
    "value": { "path": "/form/permissions" }
  },
  {
    "id": "reason-section",
    "component": "Column",
    "children": ["reason-field"],
    "align": "stretch"
  },
  {
    "id": "reason-field",
    "component": "TextField",
    "label": "申请理由",
    "placeholder": "请详细说明申请理由...",
    "variant": "longText",
    "rows": 3,
    "value": { "path": "/form/reason" }
  },
  {
    "id": "date-section",
    "component": "Column",
    "children": ["apply-date-field"],
    "align": "stretch"
  },
  {
    "id": "apply-date-field",
    "component": "DateTimeInput",
    "label": "申请日期",
    "placeholder": "选择日期",
    "enableDate": true,
    "enableTime": false,
    "value": { "path": "/form/applyDate" }
  },
  {
    "id": "action-row",
    "component": "Row",
    "children": ["cancel-btn", "submit-btn"],
    "justify": "end",
    "gap": 12
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
    "text": "提交申请"
  },
  {
    "id": "submit-btn",
    "component": "Button",
    "child": "submit-btn-text",
    "type": "primary"
  }
]`
