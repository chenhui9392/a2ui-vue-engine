// 组件全览示例
// 演示所有 A2UI 基础组件：Text / Card / TextField / SelectField / DatePicker / DateTimeInput /
// Input / ChoicePicker / InfoField / Button / Icon / List 等各变体场景
export const allComponentsExample = `[
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
      "page-title",
      "section-divider-1",
      "text-variants-section",
      "section-divider-2",
      "card-widths-section",
      "section-divider-3",
      "form-fields-section",
      "section-divider-4",
      "choice-pickers-section",
      "section-divider-5",
      "buttons-section",
      "section-divider-6",
      "icons-section",
      "section-divider-7",
      "list-section",
      "action-buttons-row"
    ],
    "align": "stretch",
    "gap": 8
  },
  {
    "id": "page-title",
    "component": "Text",
    "text": "组件演示 - 所有场景",
    "variant": "h3"
  },
  {
    "id": "section-divider-1",
    "component": "Text",
    "text": "━━━ 文本变体展示 ━━━",
    "variant": "shortText"
  },
  {
    "id": "text-variants-section",
    "component": "Column",
    "children": [
      "text-h3-demo",
      "text-short-demo",
      "text-long-demo"
    ],
    "align": "stretch",
    "gap": 12
  },
  {
    "id": "text-h3-demo",
    "component": "Text",
    "text": "H3 标题样式",
    "variant": "h3"
  },
  {
    "id": "text-short-demo",
    "component": "Row",
    "children": ["text-short-label", "text-short-content"],
    "gap": 8,
    "align": "center"
  },
  {
    "id": "text-short-label",
    "component": "Text",
    "text": "短文本:",
    "variant": "shortText"
  },
  {
    "id": "text-short-content",
    "component": "Text",
    "text": "这是一段简短的描述文本",
    "variant": "shortText"
  },
  {
    "id": "text-long-demo",
    "component": "Text",
    "text": "长文本变体：支持多行文本展示，适用于详细说明、备注、条款等需要大量文字描述的场景。可以配合 variant: 'longText' 使用。",
    "variant": "longText"
  },
  {
    "id": "section-divider-2",
    "component": "Text",
    "text": "━━━ Card 宽度展示 ━━━",
    "variant": "shortText"
  },
  {
    "id": "card-widths-section",
    "component": "Row",
    "children": [
      "card-xs-info",
      "card-sm-info",
      "card-md-info",
      "card-lg-info"
    ],
    "gap": 12,
    "align": "stretch"
  },
  {
    "id": "card-xs-info",
    "component": "Text",
    "text": "xs=300px | sm=400px | md=560px | lg=720px | xl=960px | full=100%",
    "variant": "shortText"
  },
  {
    "id": "card-sm-info",
    "component": "Text",
    "text": "宽度规格适用于不同场景：xs适合侧边栏，md适合表单，xl适合复杂页面",
    "variant": "shortText"
  },
  {
    "id": "card-md-info",
    "component": "Text",
    "text": "默认宽度为 md (560px)，这是最常用的中等宽度",
    "variant": "shortText"
  },
  {
    "id": "card-lg-info",
    "component": "Text",
    "text": "lg/xl 适合数据密集型页面或需要展示大量信息",
    "variant": "shortText"
  },
  {
    "id": "section-divider-3",
    "component": "Text",
    "text": "━━━ 表单组件展示 ━━━",
    "variant": "shortText"
  },
  {
    "id": "form-fields-section",
    "component": "Column",
    "children": [
      "form-row-1",
      "form-row-2",
      "form-row-3",
      "form-row-4"
    ],
    "align": "stretch",
    "gap": 16
  },
  {
    "id": "form-row-1",
    "component": "Row",
    "children": ["textfield-short", "textfield-required"],
    "gap": 16,
    "align": "stretch"
  },
  {
    "id": "textfield-short",
    "component": "TextField",
    "label": "短文本输入",
    "placeholder": "请输入",
    "variant": "shortText",
    "value": { "path": "/form/shortInput", "default": "默认值示例" }
  },
  {
    "id": "textfield-required",
    "component": "TextField",
    "label": "必填字段",
    "placeholder": "此项必填",
    "required": true,
    "value": { "path": "/form/requiredField" }
  },
  {
    "id": "form-row-2",
    "component": "Row",
    "children": ["textfield-long", "selectfield-demo"],
    "gap": 16,
    "align": "stretch"
  },
  {
    "id": "textfield-long",
    "component": "TextField",
    "label": "长文本输入",
    "placeholder": "请输入详细描述...",
    "variant": "longText",
    "rows": 3,
    "value": { "path": "/form/longInput", "default": "这是一段默认的长文本内容，用于展示多行输入的效果。" }
  },
  {
    "id": "selectfield-demo",
    "component": "SelectField",
    "label": "下拉选择",
    "placeholder": "请选择选项",
    "options": [
      { "label": "选项一", "value": "opt1" },
      { "label": "选项二", "value": "opt2" },
      { "label": "选项三", "value": "opt3" },
      { "label": "选项四", "value": "opt4", "disabled": true }
    ],
    "clearable": true,
    "required": true,
    "value": { "path": "/form/selectField", "default": "opt1" }
  },
  {
    "id": "form-row-3",
    "component": "Row",
    "children": ["datepicker-demo", "datetime-demo"],
    "gap": 16,
    "align": "stretch"
  },
  {
    "id": "datepicker-demo",
    "component": "DatePicker",
    "label": "日期选择",
    "placeholder": "选择日期",
    "value": { "path": "/form/datePicker", "default": "2026-04-29" }
  },
  {
    "id": "datetime-demo",
    "component": "DateTimeInput",
    "label": "日期时间",
    "placeholder": "选择日期时间",
    "enableDate": true,
    "enableTime": true,
    "value": { "path": "/form/dateTime", "default": "2026-04-29 14:30:00" }
  },
  {
    "id": "form-row-4",
    "component": "Row",
    "children": ["input-demo", "input-disabled"],
    "gap": 16,
    "align": "stretch"
  },
  {
    "id": "input-demo",
    "component": "Input",
    "label": "基础输入",
    "placeholder": "普通输入框",
    "value": { "path": "/form/basicInput", "default": "基础输入默认值" }
  },
  {
    "id": "input-disabled",
    "component": "Input",
    "label": "禁用状态",
    "placeholder": "不可编辑",
    "disabled": true,
    "value": { "path": "/form/disabledInput" }
  },
  {
    "id": "section-divider-4",
    "component": "Text",
    "text": "━━━ ChoicePicker 展示 ━━━",
    "variant": "shortText"
  },
  {
    "id": "choice-pickers-section",
    "component": "Column",
    "children": [
      "choice-single-required-label",
      "choice-single-required-picker",
      "choice-single-optional-label",
      "choice-single-optional-picker",
      "choice-multi-label",
      "choice-multi-picker"
    ],
    "align": "stretch",
    "gap": 8
  },
  {
    "id": "choice-single-required-label",
    "component": "Text",
    "text": "单选模式 (必填 - 不可取消选中):",
    "variant": "shortText"
  },
  {
    "id": "choice-single-required-picker",
    "component": "ChoicePicker",
    "label": "",
    "variant": "mutuallyExclusive",
    "displayStyle": "chips",
    "required": true,
    "options": [
      { "label": "方案A", "value": "plan_a" },
      { "label": "方案B", "value": "plan_b" },
      { "label": "方案C", "value": "plan_c" },
      { "label": "自定义", "value": "custom" }
    ],
    "value": { "path": "/form/singleChoiceRequired", "default": "plan_a" }
  },
  {
    "id": "choice-single-optional-label",
    "component": "Text",
    "text": "单选模式 (非必填 - 点击已选中可取消):",
    "variant": "shortText"
  },
  {
    "id": "choice-single-optional-picker",
    "component": "ChoicePicker",
    "label": "",
    "variant": "mutuallyExclusive",
    "displayStyle": "chips",
    "required": false,
    "options": [
      { "label": "选项1", "value": "opt_1" },
      { "label": "选项2", "value": "opt_2" },
      { "label": "选项3", "value": "opt_3" }
    ],
    "value": { "path": "/form/singleChoiceOptional" }
  },
  {
    "id": "choice-multi-label",
    "component": "Text",
    "text": "多选模式 (默认):",
    "variant": "shortText"
  },
  {
    "id": "choice-multi-picker",
    "component": "ChoicePicker",
    "label": "",
    "variant": "default",
    "displayStyle": "chips",
    "options": [
      { "label": "功能1", "value": "feature_1", "description": "基础功能模块" },
      { "label": "功能2", "value": "feature_2", "description": "高级功能模块" },
      { "label": "功能3", "value": "feature_3", "description": "扩展功能模块" },
      { "label": "功能4", "value": "feature_4", "description": "可选功能模块" },
      { "label": "功能5", "value": "feature_5" },
      { "label": "功能6", "value": "feature_6", "disabled": true }
    ],
    "value": { "path": "/form/multiChoice", "default": ["feature_1", "feature_2"] }
  },
  {
    "id": "section-divider-5",
    "component": "Text",
    "text": "━━━ InfoField 信息展示 ━━━",
    "variant": "shortText"
  },
  {
    "id": "info-section",
    "component": "Column",
    "children": ["info-tag", "info-quote"],
    "align": "stretch",
    "gap": 12
  },
  {
    "id": "info-tag",
    "component": "InfoField",
    "label": "系统模块",
    "value": { "path": "/form/systemModule", "default": "订单管理" },
    "variant": "tag"
  },
  {
    "id": "info-quote",
    "component": "InfoField",
    "label": "问题描述",
    "value": { "path": "/form/issueDesc", "default": "系统提示订单状态异常，需要核实订单流转逻辑。" },
    "variant": "quote"
  },
  {
    "id": "section-divider-6",
    "component": "Text",
    "text": "━━━ 按钮类型展示 ━━━",
    "variant": "shortText"
  },
  {
    "id": "buttons-section",
    "component": "Row",
    "children": [
      "btn-primary-info",
      "btn-success-info",
      "btn-warning-info",
      "btn-danger-info",
      "btn-info-info",
      "btn-default-info"
    ],
    "gap": 12,
    "align": "center"
  },
  {
    "id": "btn-primary-info",
    "component": "Button",
    "text": "Primary",
    "type": "primary"
  },
  {
    "id": "btn-success-info",
    "component": "Button",
    "text": "Success",
    "type": "success"
  },
  {
    "id": "btn-warning-info",
    "component": "Button",
    "text": "Warning",
    "type": "warning"
  },
  {
    "id": "btn-danger-info",
    "component": "Button",
    "text": "Danger",
    "type": "danger"
  },
  {
    "id": "btn-info-info",
    "component": "Button",
    "text": "Info",
    "type": "info"
  },
  {
    "id": "btn-default-info",
    "component": "Button",
    "text": "Default",
    "type": "default"
  },
  {
    "id": "section-divider-7",
    "component": "Text",
    "text": "━━━ 图标展示 ━━━",
    "variant": "shortText"
  },
  {
    "id": "icons-section",
    "component": "Row",
    "children": [
      "icon-label",
      "icon-row"
    ],
    "gap": 16,
    "align": "center"
  },
  {
    "id": "icon-label",
    "component": "Text",
    "text": "Element Plus 图标:",
    "variant": "shortText"
  },
  {
    "id": "icon-row",
    "component": "Row",
    "children": [
      "icon-edit",
      "icon-delete",
      "icon-search",
      "icon-setting",
      "icon-user",
      "icon-folder"
    ],
    "gap": 12,
    "align": "center"
  },
  {
    "id": "icon-edit",
    "component": "Icon",
    "name": "Edit"
  },
  {
    "id": "icon-delete",
    "component": "Icon",
    "name": "Delete"
  },
  {
    "id": "icon-search",
    "component": "Icon",
    "name": "Search"
  },
  {
    "id": "icon-setting",
    "component": "Icon",
    "name": "Setting"
  },
  {
    "id": "icon-user",
    "component": "Icon",
    "name": "User"
  },
  {
    "id": "icon-folder",
    "component": "Icon",
    "name": "Folder"
  },
  {
    "id": "section-divider-8",
    "component": "Text",
    "text": "━━━ 列表展示 ━━━",
    "variant": "shortText"
  },
  {
    "id": "list-section",
    "component": "Column",
    "children": [
      "list-demo"
    ],
    "align": "stretch"
  },
  {
    "id": "list-demo",
    "component": "List",
    "items": [
      { "id": "item1", "label": "列表项一 - 基本信息" },
      { "id": "item2", "label": "列表项二 - 详细描述" },
      { "id": "item3", "label": "列表项三 - 扩展说明" },
      { "id": "item4", "label": "列表项四 - 补充内容" },
      "纯文本列表项"
    ],
    "value": { "path": "/form/listItems" }
  },
  {
    "id": "action-buttons-row",
    "component": "Row",
    "children": [
      "reset-btn",
      "cancel-btn",
      "submit-btn"
    ],
    "justify": "end",
    "gap": 12
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
    "child": "cancel-btn-text",
    "type": "default"
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
