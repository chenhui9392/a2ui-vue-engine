# A2Dialog / A2Drawer

统一 **Dialog Runtime** 驱动的两种展示模式：**Dialog（居中弹窗）** 与 **Drawer（侧边抽屉）** 共享同一份 Runtime、Schema、Footer 与 Action 通道，不重复代码。

- 底层：`DialogRuntime` + `A2Overlay`（`mode='dialog' | 'drawer'`）
- 支持：**动态 Form / 动态 Table / 动态 Footer / Submit / Cancel / Action / API**
- 所有底部按钮统一走 [Action System](/architecture/action-system)

## 组件矩阵

| 组件 | mode | 用途 |
|------|------|------|
| `a2-dialog` | `'dialog'` | 居中弹窗（默认）|
| `a2-drawer` | `'drawer'` | 侧边抽屉 |
| `a2-overlay` | 显式指定 | 通用底层组件 |

三个组件消费同一份 [`DialogRuntimeConfig`](#schema-dialogruntimeconfig)。

## Schema (`DialogRuntimeConfig`)

```ts
interface DialogRuntimeConfig {
  mode?: 'dialog' | 'drawer'      // 展示模式
  title?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | string | number
  placement?: 'left' | 'right' | 'top' | 'bottom'  // drawer 位置
  modal?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  destroyOnClose?: boolean

  content?: A2Node | A2Node[]      // 主体：Form、Table、任意 A2Node

  footer?: OverlayFooterButton[]   // 底部按钮

  submitApi?: {                    // 可选：提交 API 描述
    url: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    payloadFrom?: 'formData' | 'context' | 'none'
    extraPayload?: Record<string, any>
  }
}

interface OverlayFooterButton extends A2Node {
  preset?: 'submit' | 'cancel' | 'reset' | 'confirm' | 'close' | 'custom'
  visible?: boolean
  autoClose?: boolean              // 默认 true；submit/confirm 类点击后自动关闭
}
```

## Props（组件级）

| 属性 | 类型 | 说明 |
|------|------|------|
| `config` | `DialogRuntimeConfig` | 协议配置 |
| `visible` | `boolean` | 受控可见性（推荐通过 `bindings.visible` 声明）|
| `formPrefix` | `string` | 表单命名空间（读取 `data.form.<prefix>.*`）|

## 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:visible` | `boolean` | 可见性变化（受控）|
| `submit` | `{ action, formData, api?, payload? }` | submit / confirm 触发 |
| `cancel` | — | cancel / close 触发 |
| `action` | `{ type, ... }` | 兜底通道 |

## Preset 默认表

| preset | 默认 text | 默认 type | action name | 语义 |
|--------|-----------|-----------|-------------|------|
| `submit` | 提交 | primary | `submit` | 提交 + autoClose |
| `confirm` | 确认 | primary | `confirm` | 同 submit |
| `cancel` | 取消 | default | `cancel` | 取消 + close |
| `close` | 关闭 | default | `close` | 同 cancel |
| `reset` | 重置 | warning | `reset` | 自定义 |
| `custom` | 按钮 | default | `custom` | 自定义 |

## Dialog · 动态 Form 示例

<PlaygroundEmbed
  title="Dialog + Form"
  :json-example='{
  "id": "createDialog",
  "type": "a2-dialog",
  "props": {
    "visible": true,
    "config": {
      "title": "新建工单",
      "size": "sm",
      "content": {
        "id": "form",
        "type": "a2-column",
        "props": { "gap": 12 },
        "children": [
          { "id": "titleField", "type": "a2-text-field", "props": { "label": "标题", "placeholder": "请输入" } },
          { "id": "levelField", "type": "a2-select-field", "props": { "label": "级别", "options": [
            { "label": "P0", "value": "P0" }, { "label": "P1", "value": "P1" }, { "label": "P2", "value": "P2" }
          ] } },
          { "id": "descField", "type": "a2-text-field", "props": { "label": "描述", "variant": "longText", "rows": 3 } }
        ]
      },
      "footer": [
        { "id": "cancel", "preset": "cancel" },
        { "id": "ok", "preset": "submit" }
      ]
    }
  }
}'
/>

## Drawer · 动态 Table 示例

<PlaygroundEmbed
  title="Drawer + Table"
  :json-example='{
  "id": "detailDrawer",
  "type": "a2-drawer",
  "props": {
    "visible": true,
    "config": {
      "title": "工单详情",
      "size": "lg",
      "placement": "right",
      "content": {
        "id": "detailTable",
        "type": "a2-table",
        "props": {
          "rowKey": "id",
          "columns": [
            { "id": "no", "title": "编号", "field": "no", "width": 120 },
            { "id": "title", "title": "标题", "field": "title" },
            { "id": "status", "title": "状态", "field": "status", "width": 100 }
          ],
          "data": [
            { "id": 1, "no": "WO-001", "title": "空调维修", "status": "处理中" },
            { "id": 2, "no": "WO-002", "title": "网络故障", "status": "已完成" }
          ]
        }
      },
      "footer": [
        { "id": "close", "preset": "close" }
      ]
    }
  }
}'
/>

## Submit + Cancel + Action + API

`submitApi` 声明后，`submit` payload 会自动带上 `api = { url, method, payload }` 供宿主发起请求（Runtime 不直接 fetch，符合协议：API 走 Action System）：

```json
{
  "id": "createDialog",
  "type": "a2-dialog",
  "props": {
    "config": {
      "title": "新建工单",
      "content": { "id": "form", "type": "a2-column", "children": [ /* ... */ ] },
      "footer": [
        { "id": "cancel", "preset": "cancel" },
        { "id": "ok",     "preset": "submit" },
        {
          "id": "reset", "preset": "reset",
          "actions": [
            { "event": "click", "type": "emit", "payload": { "action": "resetForm" } }
          ]
        }
      ],
      "submitApi": {
        "url": "/api/orders",
        "method": "POST",
        "payloadFrom": "formData",
        "extraPayload": { "source": "ui" }
      }
    }
  }
}
```

宿主在 `@submit` 中读到：

```json
{
  "action": "submit",
  "formData": { "title": "...", "level": "P1", "desc": "..." },
  "api": {
    "url": "/api/orders",
    "method": "POST",
    "payload": { "title": "...", "level": "P1", "desc": "...", "source": "ui" }
  }
}
```

## 与 Action System 的关系

- 底部按钮 emit 走既有 `A2UIRoot.emit('message', ...)`；
- 宿主一处 `handleMessage` 消费所有 `submit / cancel / confirm / reset / custom`；
- `submitApi` 只描述请求，实际请求由宿主 / DataSource / MCP 客户端执行——**Runtime 不发 HTTP**，与 [Action System 设计](/architecture/action-system) 保持一致。

## 不重复代码

- `A2Dialog` 与 `A2Drawer` 只是 `A2Overlay` 的 mode 预设包装；
- 全部逻辑（visible / submit / cancel / footer 归一化 / API payload）在 [`DialogRuntime`](/architecture/page-runtime-design#8-page-runtime-如何管理-dialog) 类中；
- Dialog / Drawer 切换只需要改一个 `mode` 字段。
