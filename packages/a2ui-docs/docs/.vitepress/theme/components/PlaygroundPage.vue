<template>
  <div class="playground-page">
    <!-- Header -->
    <div class="playground-header">
      <div class="header-left">
        <h1 class="title">A2UI Playground</h1>
        <el-tag type="info" size="small">JSON 调试工具</el-tag>
      </div>
      <div class="header-right">
        <el-select v-model="selectedExample" placeholder="选择示例" size="default" style="width: 180px; margin-right: 8px;">
          <el-option label="组件全览" value="allComponents" />
          <el-option label="员工信息登记表" value="employee" />
          <el-option label="网络权限申请单" value="network" />
          <el-option label="创建工单" value="workorder" />
        </el-select>
        <el-tooltip content="执行 JSON 渲染" placement="bottom">
          <el-button type="primary" @click="handleRun">
            <el-icon><VideoPlay /></el-icon>
            运行
          </el-button>
        </el-tooltip>
        <el-tooltip content="格式化 JSON" placement="bottom">
          <el-button @click="handleFormat">
            <el-icon><Document /></el-icon>
            格式化
          </el-button>
        </el-tooltip>
        <el-tooltip content="复制 JSON" placement="bottom">
          <el-button @click="handleCopy">
            <el-icon><CopyDocument /></el-icon>
            复制
          </el-button>
        </el-tooltip>
        <el-tooltip content="重置为默认" placement="bottom">
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- Main Content -->
    <div class="playground-main">
      <!-- Left Panel -->
      <div class="left-panel">
        <!-- JSON Editor -->
        <div class="editor-section">
          <div class="section-header">
            <span class="section-title">JSON Schema</span>
            <el-tag type="warning" size="small" v-if="jsonLines">{{ jsonLines }} 行</el-tag>
          </div>
          <div class="editor-body">
            <div class="code-editor">
              <div class="line-numbers">
                <span v-for="n in lineCount" :key="n" class="line-number">{{ n }}</span>
              </div>
              <div class="code-content" ref="codeContentRef">
                <pre class="code-highlight" ref="highlightRef"><code v-html="highlightedJson"></code></pre>
                <textarea
                  ref="textareaRef"
                  v-model="jsonContent"
                  class="code-input"
                  placeholder="在此输入 JSON..."
                  spellcheck="false"
                  @scroll="handleScroll"
                  @keydown="handleKeydown"
                ></textarea>
              </div>
            </div>
          </div>
          <div class="error-panel" v-if="errorMessage">
            <el-alert
              :title="errorMessage"
              type="error"
              :closable="false"
              show-icon
            />
          </div>
        </div>

        <!-- Form Data -->
        <div class="data-section">
          <div class="section-header">
            <span class="section-title">Form Data</span>
          </div>
          <div class="data-body">
            <div class="code-editor data-editor">
              <div class="line-numbers">
                <span v-for="n in dataLineCount" :key="n" class="line-number">{{ n }}</span>
              </div>
              <div class="code-content">
                <pre class="code-highlight"><code v-html="highlightedFormData"></code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Preview -->
      <div class="preview-panel">
        <div class="panel-header">
          <span class="panel-title">预览</span>
          <el-tag type="success" size="small" v-if="renderSuccess">
            已渲染
          </el-tag>
        </div>
        <div class="preview-body">
          <A2UIRoot
            ref="a2uiRootRef"
            @message="handleAction"
            @formData-change="handleFormDataChange"
          />
        </div>
      </div>
    </div>

    <!-- Status Bar -->
    <div class="playground-footer">
      <div class="footer-left">
        <span>消息数: {{ messageCount }}</span>
        <span v-if="lastRunTime">最后运行: {{ lastRunTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, Document, CopyDocument, Refresh } from '@element-plus/icons-vue'
import { A2UIRoot } from 'a2ui-vue-engine'
import type { A2Node, FormDataResult } from 'a2ui-vue-engine'

// Mock examples
const mockExamples: Record<string, string> = {
  employee: `[
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
]`,
  network: `[
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
]`,
  workorder: `[
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
]`,
  allComponents: `[
  {
    "id": "root",
    "component": "Card",
    "child": "main-column",
    "width": "xl"
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
    "value": { "path": "/form/longInput" }
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
    "value": { "path": "/form/datePicker" }
  },
  {
    "id": "datetime-demo",
    "component": "DateTimeInput",
    "label": "日期时间",
    "placeholder": "选择日期时间",
    "enableDate": true,
    "enableTime": true,
    "value": { "path": "/form/dateTime" }
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
    "value": { "path": "/form/basicInput" }
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
      "choice-single-label",
      "choice-single-picker",
      "choice-multi-label",
      "choice-multi-picker"
    ],
    "align": "stretch",
    "gap": 8
  },
  {
    "id": "choice-single-label",
    "component": "Text",
    "text": "单选模式 (mutuallyExclusive):",
    "variant": "shortText"
  },
  {
    "id": "choice-single-picker",
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
    "value": { "path": "/form/singleChoice" }
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
    "value": { "path": "/form/multiChoice" }
  },
  {
    "id": "section-divider-5",
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
    "id": "section-divider-6",
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
    "id": "section-divider-7",
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
]`,

}

// Refs
const selectedExample = ref('allComponents')
const a2uiRootRef = ref<InstanceType<typeof A2UIRoot>>()
const textareaRef = ref<HTMLTextAreaElement>()
const highlightRef = ref<HTMLElement>()
const codeContentRef = ref<HTMLElement>()
const jsonContent = ref(mockExamples.allComponents)
const errorMessage = ref('')
const renderSuccess = ref(false)
const messageCount = ref(0)
const lastRunTime = ref('')
const currentFormData = ref<FormDataResult>({ form: {} })

// Line count
const lineCount = computed(() => {
  if (!jsonContent.value) return 1
  return jsonContent.value.split('\n').length
})

const jsonLines = computed(() => lineCount.value)

const dataLineCount = computed(() => {
  if (!formDataJson.value) return 1
  return formDataJson.value.split('\n').length
})

// JSON syntax highlighting
function highlightJson(jsonStr: string): string {
  if (!jsonStr) return ''

  let escaped = jsonStr
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const lines = escaped.split('\n')
  const highlightedLines = lines.map(line => {
    line = line.replace(/"([^"]+)"(\s*:)/g, '<span class="hl-key">"$1"</span>$2')
    line = line.replace(/:\s*"([^"]*)"/g, ': <span class="hl-string">"$1"</span>')
    line = line.replace(/:\s*(-?\d+\.?\d*)(\s*[,\]\}])/g, ': <span class="hl-number">$1</span>$2')
    line = line.replace(/:\s*(true|false)(\s*[,\]\}])/g, ': <span class="hl-boolean">$1</span>$2')
    line = line.replace(/:\s*(null)(\s*[,\]\}])/g, ': <span class="hl-null">$1</span>$2')
    return line
  })

  return highlightedLines.join('\n')
}

const highlightedJson = computed(() => highlightJson(jsonContent.value))

const formDataJson = computed<string>(() => {
  return JSON.stringify(currentFormData.value, null, 2)
})

const highlightedFormData = computed(() => highlightJson(formDataJson.value))

// Scroll sync
function handleScroll() {
  if (textareaRef.value && highlightRef.value && codeContentRef.value) {
    const scrollTop = textareaRef.value.scrollTop
    const scrollLeft = textareaRef.value.scrollLeft
    highlightRef.value.scrollTop = scrollTop
    highlightRef.value.scrollLeft = scrollLeft
    const lineNumbersEl = codeContentRef.value.parentElement?.querySelector('.line-numbers')
    if (lineNumbersEl) {
      lineNumbersEl.scrollTop = scrollTop
    }
  }
}

// Keyboard handling (Tab key)
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const textarea = textareaRef.value
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end)
    textarea.selectionStart = textarea.selectionEnd = start + 2
    jsonContent.value = textarea.value
  }
}

// Parse JSON
function parseJsonContent(): A2Node | null {
  const content = jsonContent.value.trim()
  if (!content) {
    errorMessage.value = 'JSON 内容为空'
    return null
  }

  try {
    const node = JSON.parse(content)
    errorMessage.value = ''
    return node
  } catch (e) {
    errorMessage.value = `JSON 解析错误: ${e}`
    return null
  }
}

// Run rendering
function handleRun() {
  const node = parseJsonContent()
  if (!node) return

  try {
    if (a2uiRootRef.value) {
      a2uiRootRef.value.updateTree(null)
      a2uiRootRef.value.processMessage({
        type: 'node',
        node: node,
      })
      currentFormData.value = a2uiRootRef.value.getFormData()
    }

    messageCount.value++
    lastRunTime.value = new Date().toLocaleTimeString()
    renderSuccess.value = true
    errorMessage.value = ''
    ElMessage.success('渲染成功!')
  } catch (e) {
    errorMessage.value = `渲染错误: ${e}`
    renderSuccess.value = false
    ElMessage.error(errorMessage.value)
  }
}

// Format JSON
function handleFormat() {
  try {
    const parsed = JSON.parse(jsonContent.value)
    jsonContent.value = JSON.stringify(parsed, null, 2)
    ElMessage.success('JSON 格式化成功!')
  } catch (e) {
    ElMessage.error('JSON 格式无效')
  }
}

// Copy JSON
async function handleCopy() {
  try {
    await navigator.clipboard.writeText(jsonContent.value)
    ElMessage.success('已复制到剪贴板!')
  } catch (e) {
    ElMessage.error('复制失败!')
  }
}

// Reset to current example
function handleReset() {
  jsonContent.value = mockExamples[selectedExample.value]
  errorMessage.value = ''
  handleRun()
}

// Handle action
function handleAction(payload: any) {
  console.log('A2UI Action:', payload)

  ElMessage.info(`Action: ${payload.type}`)
}

// Handle form data change
function handleFormDataChange(formData: FormDataResult) {
  currentFormData.value = formData
}

// Watch example selection change
watch(selectedExample, (newExample) => {
  jsonContent.value = mockExamples[newExample]
  errorMessage.value = ''
  renderSuccess.value = false
})

// Initialize on mount
onMounted(() => {
  handleRun()
})
</script>

<style scoped>
.playground-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  min-height: 500px;
  overflow: hidden;
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

/* Header */
.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Main Content */
.playground-main {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Left Panel */
.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-right: 1px solid #e4e7ed;
  overflow: hidden;
  background: #fff;
}

/* Editor Section (70%) */
.editor-section {
  flex: 7;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  border-bottom: 1px solid #e4e7ed;
}

/* Data Section (30%) */
.data-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 36px;
  padding: 8px 16px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

/* Editor Body */
.editor-body,
.data-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Code Editor Container */
.code-editor {
  display: flex;
  height: 100%;
  background: #fff;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

/* Line Numbers */
.line-numbers {
  width: 40px;
  padding: 8px 0;
  background: #fafafa;
  color: #909399;
  text-align: right;
  user-select: none;
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
  border-right: 1px solid #e8e8e8;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.line-numbers::-webkit-scrollbar {
  display: none;
}

.line-number {
  display: block;
  padding-right: 8px;
  height: 19.5px;
  line-height: 19.5px;
  font-size: 12px;
}

/* Code Content */
.code-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Highlight Layer */
.code-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 12px;
  margin: 0;
  color: #303133;
  white-space: pre;
  overflow: auto;
  font-size: 13px;
  line-height: 1.5;
  pointer-events: none;
}

.code-highlight code {
  display: block;
  white-space: pre;
}

/* Input Layer */
.code-input {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 8px 12px;
  background: transparent;
  color: transparent;
  caret-color: #303133;
  border: none;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre;
  overflow: auto;
  tab-size: 2;
}

.code-input::selection {
  background: rgba(64, 158, 255, 0.25);
}

/* Syntax Highlight Colors */
:deep(.hl-key) {
  color: #0451a5;
}

:deep(.hl-string) {
  color: #a31515;
}

:deep(.hl-number) {
  color: #09885a;
}

:deep(.hl-boolean) {
  color: #0451a5;
}

:deep(.hl-null) {
  color: #0451a5;
}

/* Data Editor */
.data-editor {
  background: #fafbfc;
}

.data-editor .line-numbers {
  background: #f5f6f7;
}

.data-editor .code-content {
  overflow: auto;
}

.data-editor .code-highlight {
  background: #fafbfc;
  pointer-events: auto;
  overflow: auto;
}

/* Error Panel */
.error-panel {
  padding: 8px 12px;
  background: #fef0f0;
  flex-shrink: 0;
}

/* Preview Panel */
.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 50%;
  overflow: hidden;
  background: #fff;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 36px;
  padding: 8px 16px;
  background: #f0f2f5;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.panel-title {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

/* Preview Body */
.preview-body {
  flex: 1;
  min-height: 0;
  padding: 16px 20px;
  overflow: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.preview-body :deep(.el-form) {
  width: auto;
}

/* Footer */
.playground-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
  padding: 4px 16px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}
</style>
