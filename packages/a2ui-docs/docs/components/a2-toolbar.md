# A2Toolbar

工具栏组件，协议驱动，**所有按钮统一走 [Action System](/architecture/action-system)**。支持内置预设：新增 / 删除 / 刷新 / 导出 / 批量操作 / 自定义。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | — | 工具栏标题 |
| `centerText` | `string` | — | 中间提示文案 |
| `buttons` | `A2ToolbarButton[]` | `[]` | 左区按钮（主操作） |
| `rightButtons` | `A2ToolbarButton[]` | `[]` | 右区按钮（辅助操作） |
| `size` | `'large' \| 'default' \| 'small'` | `'default'` | 尺寸 |
| `bordered` | `boolean` | `true` | 是否显示边框 |

### `A2ToolbarButton`

继承 `A2Node` 的所有字段，额外扩展：

| 字段 | 类型 | 说明 |
|------|------|------|
| `preset` | `'add' \| 'delete' \| 'refresh' \| 'export' \| 'batch' \| 'custom'` | 预设动作快捷方式；未提供 actions 时会生成对应 emit action |
| `visible` | `boolean` | 是否显示 |

预设 `preset` 的默认文案与 action name：

| preset | 默认 text | 默认 type | 默认 action name |
|--------|-----------|-----------|------------------|
| `add` | 新增 | `primary` | `add` |
| `delete` | 删除 | `danger` | `delete` |
| `refresh` | 刷新 | `default` | `refresh` |
| `export` | 导出 | `default` | `export` |
| `batch` | 批量操作 | `default` | `batch` |
| `custom` | 自定义 | `default` | `custom` |

宿主监听 `@message` 即可通过 `payload.action` 区分预设动作。

## 事件

Toolbar 内部所有按钮 emit 的事件都通过既有 [Action System](/architecture/action-system) 上抛到 `A2UIRoot.emit('message', ...)`，宿主统一消费。

## 基础示例

<PlaygroundEmbed
  title="基础工具栏"
  :json-example='{
  "id": "toolbar1",
  "type": "a2-toolbar",
  "props": {
    "buttons": [
      { "id": "add", "preset": "add" },
      { "id": "delete", "preset": "delete" },
      { "id": "batch", "preset": "batch" }
    ],
    "rightButtons": [
      { "id": "refresh", "preset": "refresh" },
      { "id": "export", "preset": "export" }
    ]
  }
}'
/>

## 自定义按钮

预设不满足时可以完全自定义（走 A2Button 的完整协议）：

<PlaygroundEmbed
  title="自定义按钮"
  :json-example='{
  "id": "toolbar2",
  "type": "a2-toolbar",
  "props": {
    "title": "工单管理",
    "buttons": [
      {
        "id": "createOrder",
        "type": "a2-button",
        "props": { "text": "新建工单", "type": "primary" },
        "actions": [
          { "event": "click", "type": "emit", "payload": { "action": "openCreateDialog" } }
        ]
      },
      {
        "id": "importOrder",
        "type": "a2-button",
        "props": { "text": "导入 Excel" },
        "actions": [
          { "event": "click", "type": "emit", "payload": { "action": "importExcel" } }
        ]
      }
    ],
    "rightButtons": [
      { "id": "refresh", "preset": "refresh" },
      { "id": "export", "preset": "export" }
    ]
  }
}'
/>

## 批量操作

批量按钮通常需要根据「是否有选中行」启用/禁用，配合 `bindings.disabled` 声明：

<PlaygroundEmbed
  title="批量操作"
  :json-example='{
  "id": "toolbar3",
  "type": "a2-toolbar",
  "props": {
    "buttons": [
      { "id": "add", "preset": "add" },
      {
        "id": "batchDelete",
        "preset": "delete",
        "props": { "text": "批量删除" }
      },
      {
        "id": "batchApprove",
        "type": "a2-button",
        "props": { "text": "批量审批", "type": "success" },
        "actions": [
          { "event": "click", "type": "emit", "payload": { "action": "batchApprove" } }
        ]
      }
    ],
    "rightButtons": [
      { "id": "refresh", "preset": "refresh" },
      { "id": "export", "preset": "export" }
    ]
  }
}'
/>

## 与 Action System 的关系

- Toolbar **不** 引入独立事件系统；
- 预设按钮生成 `{ event: 'click', type: 'emit', payload: { action, preset } }`；
- 自定义按钮完全等同于普通 `a2-button`：可 emit / callback / navigate / api；
- 宿主监听 `A2UIRoot` 的 `@message` 事件即可接收所有动作；
- Toolbar 内部不发起 HTTP、不调 DataSource，符合 [Action System 设计原则](/architecture/action-system)。

## JSON Schema

```json
{
  "id": "toolbarId",
  "type": "a2-toolbar",
  "props": {
    "title": "标题（可选）",
    "buttons": [
      { "id": "add", "preset": "add" },
      { "id": "delete", "preset": "delete" }
    ],
    "rightButtons": [
      { "id": "refresh", "preset": "refresh" },
      { "id": "export", "preset": "export" }
    ]
  }
}
```
