// ✨ CRUD 页面 (PageSchema + Runtime) 示例
// 声明式 schema，由 createRuntime 执行
// 含 apis / datasources / state / actions / components，行内按钮用 events 声明式映射
export const crudPageSchemaExample = `{
  "page": {
    "id": "systemFaultRulePage",
    "title": "系统问题与故障上报规则库",
    "project": "systemFaultRule",
    "version": "1.1"
  },
  "apis": {
    "systemFaultRule.list":   { "url": "/systemFaultRule/pageList",    "method": "POST" },
    "systemFaultRule.detail": { "url": "/systemFaultRule/getDetail",   "method": "GET"  },
    "systemFaultRule.save":   { "url": "/systemFaultRule/addOrUpdate", "method": "POST" }
  },
  "datasources": {
    "list": {
      "apiKey": "systemFaultRule.list",
      "responseMap": { "list": "data.records", "total": "data.total" },
      "pagination": { "enabled": true, "pageSize": 10 },
      "debounce": 300,
      "auto": true
    },
    "detail": { "apiKey": "systemFaultRule.detail" },
    "save":   { "apiKey": "systemFaultRule.save" }
  },
  "state": {
    "ui": { "detailVisible": false, "editorVisible": false, "creatorVisible": false },
    "business": { "detailData": {}, "editingId": null },
    "forms": { "default": {} }
  },
  "actions": {
    "view":         { "type": "ui.open", "target": "detailDrawer", "datasource": "detail", "param": "row.id", "bind": "business.detailData" },
    "edit":         { "type": "ui.open", "target": "editDrawer",   "datasource": "detail", "param": "row.id", "bind": "forms.default", "set": { "business.editingId": "row.id" } },
    "create":       { "type": "ui.open", "target": "createDialog", "bind": "forms.default", "defaults": { "status": "active", "faultLevel": "P2" } },
    "closeDetail":  { "type": "ui.close", "target": "detailDrawer" },
    "closeEditor":  { "type": "ui.close", "target": "editDrawer" },
    "closeCreator": { "type": "ui.close", "target": "createDialog" },
    "search":       { "type": "request", "datasource": "list" },
    "refresh":      { "type": "request", "datasource": "list", "toast": "已刷新" },
    "submitEdit": {
      "type": "request", "datasource": "save",
      "body": { "from": "forms.default", "merge": { "id": "$business.editingId" } },
      "onSuccess": { "type": "ui.close", "target": "editDrawer" },
      "refresh": "list", "toast": "保存成功"
    },
    "submitCreate": {
      "type": "request", "datasource": "save",
      "body": { "from": "forms.default", "merge": { "id": null } },
      "onSuccess": { "type": "ui.close", "target": "createDialog" },
      "refresh": "list", "toast": "新建成功"
    }
  },
  "components": {
    "root": {
      "component": "container.list",
      "children": ["pageSearch", "pageToolbar", "pageTable", "detailDrawer", "editDrawer", "createDialog"]
    },
    "pageSearch": {
      "component": "input.search",
      "props": {
        "labelWidth": "80px",
        "config": {
          "fields": [
            { "id": "ruleNo", "label": "规则编号", "type": "text", "placeholder": "请输入" },
            { "id": "ruleType", "label": "规则类型", "type": "text", "placeholder": "请输入" },
            { "id": "faultLevel", "label": "故障等级", "type": "select", "options": [{ "label": "P1", "value": "P1" }, { "label": "P2", "value": "P2" }, { "label": "P3", "value": "P3" }] },
            { "id": "status", "label": "状态", "type": "select", "options": [{ "label": "有效", "value": "active" }, { "label": "失效", "value": "inactive" }] },
            { "id": "productName", "label": "产品名称", "type": "text", "placeholder": "请输入" },
            { "id": "productModule", "label": "产品模块", "type": "text", "placeholder": "请输入" },
            { "id": "submitterName", "label": "创建人", "type": "text", "placeholder": "请输入" }
          ],
          "collapsible": true,
          "collapseAfter": 3,
          "defaultCollapsed": true,
          "submitText": "搜索",
          "resetText": "重置"
        }
      }
    },
    "pageToolbar": {
      "component": "action.toolbar",
      "props": {
        "bordered": false,
        "buttons": [
          { "id": "createBtn", "type": "a2-button", "props": { "text": "新建规则"}, "events": { "click": "create" } }
        ],
        "rightButtons": [
          { "id": "refresh", "type": "a2-button", "props": { "text": "刷新", "variant": "text", "color": "#2260FA" }, "events": { "click": "refresh" } }
        ]
      }
    },
    "pageTable": {
      "component": "display.table",
      "props": {
        "rowKey": "id", "border": true, "stripe": true, "height": 480,
        "columns": [
          { "id": "c1", "field": "ruleNo", "title": "规则编号", "width": 140 },
          { "id": "c2", "field": "ruleType", "title": "规则类型", "width": 120 },
          { "id": "c3", "field": "faultLevel", "title": "故障等级", "width": 100 },
          { "id": "c4", "field": "applicableDepartments", "title": "适用部门", "width": 140 },
          { "id": "c5", "field": "productName", "title": "产品名称", "width": 140 },
          { "id": "c6", "field": "productModule", "title": "产品模块", "width": 140 },
          { "id": "c7", "field": "status", "title": "状态", "width": 90 },
          { "id": "c8", "field": "validDate", "title": "生效日期", "width": 170 },
          { "id": "c9", "field": "submitterName", "title": "创建人", "width": 110 },
          {
            "id": "c-actions", "title": "操作", "width": 170, "fixed": "right", "align": "center",
            "cellRender": {
              "id": "actionRow", "type": "a2-row", "props": { "justify": "center", "gap": 4, "wrap": false },
              "children": [
                { "id": "viewBtn", "type": "a2-button", "props": { "text": "查看", "variant": "text", "color": "#2260FA" }, "events": { "click": "view" } },
                { "id": "editBtn", "type": "a2-button", "props": { "text": "编辑", "variant": "text", "color": "#2260FA" }, "events": { "click": "edit" } }
              ]
            }
          }
        ]
      }
    },
    "detailDrawer": {
      "component": "container.drawer",
      "bindings": { "visible": { "type": "path", "value": "ui.detailVisible" } },
      "props": {
        "config": {
          "title": "规则详情", "size": "md", "placement": "right",
          "content": {
            "id": "detailBody", "type": "a2-column", "props": { "gap": 12 },
            "children": [
              { "id": "d-ruleNo", "type": "display.info", "props": { "label": "规则编号" }, "bindings": { "modelValue": { "type": "path", "value": "business.detailData.ruleNo" } } },
              { "id": "d-ruleType", "type": "display.info", "props": { "label": "规则类型" }, "bindings": { "modelValue": { "type": "path", "value": "business.detailData.ruleType" } } },
              { "id": "d-faultLevel", "type": "display.info", "props": { "label": "故障等级" }, "bindings": { "modelValue": { "type": "path", "value": "business.detailData.faultLevel" } } },
              { "id": "d-status", "type": "display.info", "props": { "label": "状态" }, "bindings": { "modelValue": { "type": "path", "value": "business.detailData.status" } } },
              { "id": "d-productName", "type": "display.info", "props": { "label": "产品名称" }, "bindings": { "modelValue": { "type": "path", "value": "business.detailData.productName" } } },
              { "id": "d-validDate", "type": "display.info", "props": { "label": "生效日期" }, "bindings": { "modelValue": { "type": "path", "value": "business.detailData.validDate" } } },
              { "id": "d-submitterName", "type": "display.info", "props": { "label": "创建人" }, "bindings": { "modelValue": { "type": "path", "value": "business.detailData.submitterName" } } }
            ]
          },
          "footer": [
            { "id": "close", "type": "a2-button", "props": { "text": "关闭" }, "events": { "click": "closeDetail" } }
          ]
        }
      }
    },
    "editDrawer": {
      "component": "container.drawer",
      "bindings": { "visible": { "type": "path", "value": "ui.editorVisible" } },
      "props": {
        "config": {
          "title": "编辑规则", "size": "md", "placement": "right",
          "columns": 2,
          "content": {
            "id": "editBody", "type": "a2-column", "props": { "gap": 12 },
            "children": [
              { "id": "e-ruleNo", "type": "input.text", "props": { "label": "规则编号", "placeholder": "请输入" }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.ruleNo" } } },
              { "id": "e-ruleType", "type": "input.text", "props": { "label": "规则类型", "placeholder": "请输入" }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.ruleType" } } },
              { "id": "e-faultLevel", "type": "input.select", "props": { "label": "故障等级", "options": [{ "label": "P1", "value": "P1" }, { "label": "P2", "value": "P2" }, { "label": "P3", "value": "P3" }] }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.faultLevel" } } },
              { "id": "e-status", "type": "input.select", "props": { "label": "状态", "options": [{ "label": "有效", "value": "active" }, { "label": "失效", "value": "inactive" }] }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.status" } } },
              { "id": "e-productName", "type": "input.text", "props": { "label": "产品名称", "placeholder": "请输入" }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.productName" } } },
              { "id": "e-validDate", "type": "input.datetime", "props": { "label": "生效日期", "placeholder": "选择生效日期", "enableDate": true, "enableTime": true }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.validDate" } } },
              { "id": "e-submitterName", "type": "input.text", "props": { "label": "创建人名称", "placeholder": "请输入" }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.submitterName" } } }
            ]
          },
          "footer": [
            { "id": "e-cancel", "type": "a2-button", "props": { "text": "取消" }, "events": { "click": "closeEditor" } },
            { "id": "e-submit", "type": "a2-button", "props": { "text": "保存", "type": "primary" }, "events": { "click": "submitEdit" } }
          ]
        }
      }
    },
    "createDialog": {
      "component": "container.dialog",
      "bindings": { "visible": { "type": "path", "value": "ui.creatorVisible" } },
      "props": {
        "config": {
          "title": "新建规则", "size": "md",
          "columns": 2,
          "content": {
            "id": "createBody", "type": "a2-column", "props": { "gap": 12 },
            "children": [
              { "id": "c-ruleNo", "type": "input.text", "props": { "label": "规则编号", "placeholder": "请输入" }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.ruleNo" } } },
              { "id": "c-ruleType", "type": "input.text", "props": { "label": "规则类型", "placeholder": "请输入" }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.ruleType" } } },
              { "id": "c-faultLevel", "type": "input.select", "props": { "label": "故障等级", "options": [{ "label": "P1", "value": "P1" }, { "label": "P2", "value": "P2" }, { "label": "P3", "value": "P3" }] }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.faultLevel" } } },
              { "id": "c-status", "type": "input.select", "props": { "label": "状态", "options": [{ "label": "有效", "value": "active" }, { "label": "失效", "value": "inactive" }] }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.status" } } },
              { "id": "c-productName", "type": "input.text", "props": { "label": "产品名称", "placeholder": "请输入" }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.productName" } } },
              { "id": "c-validDate", "type": "input.datetime", "props": { "label": "生效日期", "placeholder": "选择生效日期", "enableDate": true, "enableTime": true }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.validDate" } } },
              { "id": "c-submitterName", "type": "input.text", "props": { "label": "创建人名称", "placeholder": "请输入" }, "bindings": { "modelValue": { "type": "path", "value": "forms.default.submitterName" } } }
            ]
          },
          "footer": [
            { "id": "c-cancel", "type": "a2-button", "props": { "text": "取消" }, "events": { "click": "closeCreator" } },
            { "id": "c-submit", "type": "a2-button", "props": { "text": "保存", "type": "primary" }, "events": { "click": "submitCreate" } }
          ]
        }
      }
    }
  }
}`
