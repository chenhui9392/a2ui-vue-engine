# 快速开始

## 简介

A2UI 是一个基于 JSON Schema 驱动的 Vue3 UI 渲染引擎。通过 JSON Schema 定义 UI 结构，实现数据驱动的动态界面，无需编写 Vue 模板。

## 安装

在项目中安装 A2UI Vue Engine：

::: code-group
```bash [pnpm]
pnpm add a2ui-vue-engine element-plus
```

```bash [npm]
npm install a2ui-vue-engine element-plus
```

```bash [yarn]
yarn add a2ui-vue-engine element-plus
```
:::

## 快速入门

### 1. 注册插件

```typescript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import A2UIPlugin from 'a2ui-vue-engine'
import 'a2ui-vue-engine/style.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(A2UIPlugin)
app.mount('#app')
```

### 2. 使用 A2UIRoot 组件

```vue
<template>
  <A2UIRoot
    ref="rootRef"
    @message="handleMessage"
    @formData-change="handleFormData"
  />
</template>

<script setup>
import { ref } from 'vue'
import { A2UIRoot } from 'a2ui-vue-engine'

const rootRef = ref()

function handleMessage(msg) {
  console.log('消息:', msg)
}

function handleFormData(formData) {
  console.log('表单数据:', formData)
}

// 渲染 JSON Schema
function renderSchema(jsonSchema) {
  rootRef.value.processMessage({
    type: 'node',
    node: jsonSchema
  })
}
</script>
```

### 3. 定义 JSON Schema

```json
{
  "id": "root",
  "type": "a2-card",
  "props": {
    "width": "md",
    "title": "用户注册"
  },
  "children": [
    {
      "id": "name-field",
      "type": "a2-text-field",
      "props": {
        "label": "姓名",
        "prop": "name",
        "placeholder": "请输入姓名"
      }
    },
    {
      "id": "submit-btn",
      "type": "a2-button",
      "props": {
        "text": "提交",
        "type": "primary"
      }
    }
  ]
}
```

## 核心概念

### 组件分类

A2UI 提供多种预构建组件：

| 类别 | 组件 |
|------|------|
| 布局 | A2Card, A2Row, A2Column, A2List |
| 表单 | A2TextField, A2Input, A2SelectField, A2DatePicker, A2DateTimeInput |
| 展示 | A2Text, A2Icon |
| 操作 | A2Button |

### JSON Schema 结构

每个组件节点遵循以下结构：

| 属性 | 类型 | 说明 |
|------|------|------|
| `id` | string | 节点唯一标识 |
| `type` | string | 组件类型（如 `a2-card`） |
| `props` | object | 组件属性 |
| `children` | array | 子节点 |
| `bindings` | object | 数据绑定配置 |
| `actions` | array | 事件动作配置 |

## 下一步

- [架构设计](/guide/architecture) - 了解内部架构
- [JSON 规范](/guide/json-schema) - 详细 Schema 参考
- [组件文档](/components/) - 浏览所有可用组件