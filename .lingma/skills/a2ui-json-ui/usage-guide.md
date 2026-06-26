# A2UI JSON UI Usage Guide

This guide explains how to convert natural language UI requests into A2UI Flat Format JSON.

## 1. Natural Language Interpretation

When the user asks for a UI, first infer the intent behind the wording.

### Strong trigger verbs

Treat these verbs as UI generation intent when paired with UI nouns or field descriptions:

- 中文：生成、创建、制作、做一个、写一个、搭一个、给我一个、帮我出一个、配置、输出、渲染
- English: generate, create, build, make, render, configure, give me, build me

### Strong UI nouns

| Category | Natural language signals |
|---|---|
| Form | 表单、申请单、录入界面、填写页、问卷、登录、注册、搜索条件、筛选条件 |
| Display | 卡片、详情、信息展示、资料、概览、看板、状态展示 |
| Layout | 页面、布局、面板、左右结构、上下结构、两栏、三栏、列表 |
| Components | 输入框、下拉、按钮、日期、时间、单选、多选、标签、选择器 |
| A2UI | A2UI、JSON Schema、Schema、Flat Format、组件配置 |

### Semantic triggers

Use this skill even without explicit UI nouns if the user describes:

- A set of fields: “包含姓名、部门、手机号、申请原因”
- A business process: “用户提交工单 / 申请权限 / 填写反馈 / 修改密码”
- A display requirement: “把订单信息展示出来 / 以卡片形式展示用户资料”
- Data binding: “绑定到 /form/xxx / 带默认值”
- A2UI component names: `A2Card`, `A2TextField`, `InfoField`, `ChoicePicker`, etc.

## 2. Field-to-Component Mapping

Use the following mapping when the user does not specify exact components.

| User field meaning | Preferred component | Notes |
|---|---|---|
| 姓名、标题、编号、部门、地址、系统名称 | `TextField` | Use `variant: "shortText"` |
| 密码、确认密码 | `Input` | Use `type: "password"` when supported; otherwise use `TextField` |
| 描述、原因、备注、说明、内容、意见 | `TextField` | Use `variant: "longText"` |
| 类型、状态、优先级、部门选择 | `SelectField` | Use when options are dropdown-like |
| 场景选择、权限选择、方案选择 | `ChoicePicker` | Use when options should be visually prominent |
| 单选 | `ChoicePicker` | Use `variant: "mutuallyExclusive"`; options should use `choiceOptions` |
| 多选 | `ChoicePicker` | Use `variant: "default"`; options should use `choiceOptions` |
| 日期 | `DatePicker` | Use for date-only values |
| 时间、开始时间、结束时间、生效时间、失效时间 | `DateTimeInput` | Use for date-time values |
| 只读展示字段 | `InfoField` | Use in detail cards |
| 标题、说明文字 | `Text` | Use `variant` such as `h3`, `p`, `shortText`, `longText` |
| 提交、保存、确认、查询、重置 | `Button` | Put action buttons inside a `Row` |

## 3. Layout Decision Rules

### Form

Default structure:

```json
[
  { "id": "root", "component": "Card", "width": "md", "header": "表单标题", "child": "formBody" },
  { "id": "formBody", "component": "Column", "gap": 16, "children": ["field1", "btnRow"] }
]
```

Rules:

- Use `Card` as the outer container.
- Use `Column` for vertical fields.
- Use `gap: 16` for normal field spacing.
- Put submit/save buttons at the bottom.
- Wrap buttons in `Row` with `justify: "end"`.

### Detail Card

Use this when the user asks to “展示 / 查看 / 详情 / 卡片”.

- Outer container: `Card`
- Body: `Column`
- Read-only fields: `InfoField`
- Status fields: `InfoField` with `variant: "tag"`
- Long descriptions: `InfoField` with `variant: "quote"`

### Selector UI

Use `ChoicePicker` when the user wants visible option cards/chips.

- Single selection: `variant: "mutuallyExclusive"`
- Multiple selection: `variant: "default"`
- Compact tag-like display: use `displayStyle: "chips"`
- In flat format, prefer `choiceOptions` for ChoicePicker options so they are mapped to component `props.options`

### Multi-section Page

Use `Row` + `Column` when the page has multiple visual areas:

- Left form + right preview
- Top filter + bottom result list
- Three metric cards
- Detail area + action area

## 4. Data Binding Rules

For generated form fields, always add `value.path` unless the field is purely decorative.

```json
{
  "id": "applicantName",
  "component": "TextField",
  "label": "申请人",
  "value": { "path": "/form/applicantName", "default": "" }
}
```

Rules:

- Use `/form/<camelCaseFieldName>` for form fields.
- Use `default` when the user gives an initial value.
- Use empty string `""` as default for text fields when no value is provided.
- For single-select defaults, use a string value.
- For multi-select defaults, use an array.

## 5. ID and Naming Rules

- Use English camelCase IDs: `applicantName`, `permissionType`, `submitBtn`.
- Avoid Chinese IDs.
- Ensure every `id` is unique.
- Ensure every ID referenced in `child` or `children` exists.
- Button rows should use names like `btnRow`, `actionRow`, `footerActions`.
- Button actions should use semantic event names, for example:
  - `submitForm`
  - `submitNetworkPermissionApply`
  - `saveUserInfo`
  - `queryOrderList`
  - `resetSearchForm`

## 6. Action Rules

For buttons, use this simplified action shape:

```json
{
  "id": "submitBtn",
  "component": "Button",
  "text": "提交",
  "type": "primary",
  "action": {
    "event": {
      "name": "submitForm"
    }
  }
}
```

Button type suggestions:

| Intent | Button type |
|---|---|
| 提交、保存、确认、查询 | `primary` |
| 成功、通过 | `success` |
| 警告、暂存 | `warning` |
| 删除、拒绝、作废 | `danger` |
| 取消、重置、返回 | `default` |

## 7. Getting Started / Integration Questions

When the user asks how to access, integrate, install, start, or use A2UI, do **not** focus on generating a large JSON example. Return a beginner-friendly quick integration guide.

Trigger examples:

- “A2UI 怎么接入？”
- “a2ui 怎么使用？”
- “怎么开始用 A2UI？”
- “如何把 A2UI 接到 Vue 项目里？”
- “how to integrate A2UI?”
- “A2UI getting started”

Recommended answer structure:

1. Start with a one-sentence summary:
   - “A2UI 接入可以理解为 4 步：安装依赖 → 注册插件 → 页面挂载 A2UIRoot → 调用 processMessage 渲染 JSON。”
2. Briefly explain what A2UI does:
   - “A2UI 是一个基于 JSON Schema 的 Vue3 UI 渲染引擎，用 JSON 描述界面，由 A2UIRoot 动态渲染。”
3. Provide the 4 steps in order:
   - Install dependencies
   - Register Element Plus and A2UI plugin
   - Use `A2UIRoot` in a page
   - Call `processMessage({ type: 'node', node: schema })`
4. Provide one minimal runnable Vue example.
5. Mention how to receive data and events:
   - `@formData-change` for form data
   - `@message` for button actions/messages
6. Mention project docs only as references, not as the main content:
   - `packages/a2ui-docs/docs/guide/getting-started.md`
   - `packages/a2ui-docs/docs/guide/json-schema.md`
7. Keep the answer focused on quick integration. Do not compare Flat Format and Nested Format in detail unless the user asks.

Recommended quick integration template:

````markdown
A2UI 接入可以理解为 4 步：**安装依赖 → 注册插件 → 页面挂载 A2UIRoot → 传入 JSON 渲染**。

A2UI 是一个基于 JSON Schema 的 Vue3 UI 渲染引擎，你只需要把界面描述成 JSON，然后交给 `A2UIRoot` 渲染。

## 1. 安装依赖

```bash
pnpm add a2ui-vue-engine element-plus
```

## 2. 注册插件

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import A2UIPlugin from 'a2ui-vue-engine'
import 'a2ui-vue-engine/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(A2UIPlugin)
app.mount('#app')
```

## 3. 页面中使用 A2UIRoot

```vue
<template>
  <A2UIRoot
    ref="rootRef"
    @message="handleMessage"
    @formData-change="handleFormData"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { A2UIRoot } from 'a2ui-vue-engine'

const rootRef = ref()

function handleMessage(msg: unknown) {
  console.log('A2UI 消息:', msg)
}

function handleFormData(formData: unknown) {
  console.log('表单数据:', formData)
}

onMounted(() => {
  rootRef.value?.processMessage({
    type: 'node',
    node: [
      { id: 'root', component: 'Card', width: 'md', header: '用户信息', child: 'formBody' },
      { id: 'formBody', component: 'Column', gap: 16, children: ['userName', 'submitBtn'] },
      { id: 'userName', component: 'TextField', label: '用户名', value: { path: '/form/userName', default: '' } },
      { id: 'submitBtn', component: 'Button', text: '提交', type: 'primary', action: { event: { name: 'submitForm' } } }
    ]
  })
})
</script>
```

## 4. 监听数据和事件

- 表单数据变化：监听 `formData-change`
- 按钮点击 / 动作消息：监听 `message`
- 动态渲染：调用 `rootRef.value.processMessage({ type: 'node', node: schema })`
````

## 8. Install and Integrate into an Existing Project

When the user explicitly asks to install, add, configure, or integrate A2UI into the current project, treat it as a **project modification task**, not just a documentation answer.

Trigger examples:

- “帮我安装 A2UI 并接入”
- “把 A2UI 接入当前项目”
- “帮我在这个 Vue 项目里加上 A2UI”
- “安装 a2ui-vue-engine 和 element-plus”
- “install and integrate A2UI into this project”

Execution workflow:

1. Inspect the project structure.
2. Read `package.json` to determine framework, dependencies, and package manager.
3. Verify that the project is a Vue 3 project before installing or modifying files.
4. Check whether `a2ui-vue-engine` and `element-plus` are already installed.
5. If dependencies are missing and command execution is available, run the appropriate install command:
   - `pnpm add a2ui-vue-engine element-plus`
   - `npm install a2ui-vue-engine element-plus`
   - `yarn add a2ui-vue-engine element-plus`
6. Locate the Vue entry file, usually one of:
   - `src/main.ts`
   - `src/main.js`
   - `main.ts`
   - `main.js`
7. Register Element Plus and A2UI in the entry file:

```ts
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import A2UIPlugin from 'a2ui-vue-engine'
import 'a2ui-vue-engine/style.css'

app.use(ElementPlus)
app.use(A2UIPlugin)
```

8. If the user also asks for a demo page, add or update a Vue page with a minimal `A2UIRoot` example.
9. If command execution or file modification is not available, do not pretend the project was changed. Provide exact manual commands and code changes.

### Environment validation and incompatible cases

Before installing dependencies or editing files, validate the project environment. If the environment is incompatible or ambiguous, **stop and explain clearly** instead of forcing changes.

| Case | How to detect | Required behavior |
|---|---|---|
| React project | `react` / `react-dom` dependencies, `@vitejs/plugin-react`, `src/main.tsx`, `createRoot` | Do not install or edit. Explain that A2UI is Vue3-based and cannot be directly mounted in React. Suggest Vue sub-app, iframe, micro-frontend, or a React JSON UI alternative. |
| Vue 2 project | `vue` dependency version starts with `2`, uses `new Vue(...)`, `vue-template-compiler` | Do not directly integrate. Explain that A2UI requires Vue3. Suggest upgrading to Vue3 or using a Vue3 sub-app. |
| Non-frontend / backend-only project | No frontend entry, no Vue/React/Vite/Webpack app, only server files | Do not install blindly. Ask user to point to the frontend app directory. |
| No `package.json` | Missing package manifest in current workspace | Stop and ask for the correct project root. |
| Monorepo / multiple apps | Multiple `package.json` files or packages/apps directories | Ask which app/package should receive A2UI before installing. |
| No Vue entry file | Vue dependency exists, but no `main.ts` / `main.js` / equivalent entry can be found | Do not guess. Ask user to identify the entry file. |
| Existing Element Plus registration | Existing `element-plus` import or `app.use(ElementPlus)` | Reuse it. Do not duplicate imports or plugin registration. |
| Existing A2UI registration | Existing `a2ui-vue-engine` import or `app.use(A2UIPlugin)` | Do not reinstall or duplicate. Report that A2UI appears already registered. |
| Package manager conflict | Multiple lockfiles exist, or package manager cannot be inferred | Prefer lockfile if clear; otherwise ask user which package manager to use. |
| Dependency install blocked | Command denied, offline network, registry error, permission issue | Stop and report the exact blocker. Provide manual command alternatives. |
| SSR / Nuxt project | `nuxt` dependency or Nuxt config | Do not apply plain Vue entry-file steps blindly. Explain that Nuxt integration may require plugin/client-only registration and ask whether to proceed with Nuxt-specific setup. |
| Taro / mini-app project | Taro dependencies or mini-app config | Do not integrate directly. Explain that A2UI is Vue3 web-oriented unless the project explicitly supports Vue3 web rendering. |
| TypeScript strict errors likely | No types or incompatible entry style | Preserve project style and avoid unnecessary demo files. If needed, provide code but ask before broad refactors. |

Recommended incompatible React response:

```markdown
当前项目看起来是 React 项目，而 A2UI 是基于 Vue3 的 JSON Schema 渲染引擎，需要 Vue3 运行环境和 `A2UIRoot` 组件，因此不能直接接入到 React 根节点中。

可选方案：

1. 在 Vue3 项目中接入 A2UI
2. 新建一个 Vue3 子应用 / 独立页面承载 A2UI
3. 在 React 项目中通过 iframe 或微前端方式嵌入 Vue A2UI 页面
4. 如果必须保持 React 技术栈，改用 React 生态的 JSON Schema UI / 表单渲染方案

如果你希望我继续处理，请告诉我要采用哪种方案。
```

Recommended Vue2 response:

```markdown
当前项目看起来是 Vue2 项目，而 A2UI 依赖 Vue3 运行环境，不能按 Vue3 插件方式直接接入。

建议选择：

1. 升级项目到 Vue3 后接入 A2UI
2. 新建 Vue3 子应用承载 A2UI
3. 使用 iframe / 微前端方式把 Vue3 A2UI 页面嵌入当前系统
```

Recommended monorepo response:

```markdown
当前仓库包含多个应用/包，我需要先确认要把 A2UI 接入到哪个项目中。

请指定目标目录，例如：

- `packages/admin-web`
- `apps/web`
- `packages/a2ui-docs`
```

Important behavior rules:

- Before modifying files, read the existing file content and preserve existing plugin registrations.
- Do not duplicate imports or `app.use(...)` calls if they already exist.
- Do not create demo files unless the user asks for a runnable example or no suitable page exists.
- Prefer editing existing entry files over creating new files.
- If multiple package managers are present, prefer the one indicated by the lockfile:
  - `pnpm-lock.yaml` → pnpm
  - `package-lock.json` → npm
  - `yarn.lock` → yarn
- If dependency installation requires user approval, request/trigger approval through the available command mechanism.

Recommended response after successful modification:

```markdown
已完成 A2UI 接入：

- 已安装 `a2ui-vue-engine` 和 `element-plus`
- 已在入口文件注册 Element Plus 和 A2UI
- 已引入必要样式
- 可通过 `A2UIRoot` + `processMessage` 渲染 A2UI JSON

你可以运行项目后打开页面验证。
```

## 9. JSON Self-check Rules

Before returning any generated A2UI JSON, mentally validate it with this checklist. Fix issues before responding.

### Required JSON checks

- The JSON must be valid and parseable.
- Do not include comments inside JSON.
- For Flat Format, the top-level value must be an array.
- The first node must have `id: "root"`.
- Every node must have a unique `id`.
- Every node must have a valid `component` name in PascalCase.
- Every `child` reference must point to an existing node ID.
- Every `children` reference must point to existing node IDs.
- Do not mix Flat Format and Nested Format in the same JSON.
- In Flat Format, do not use nested `props` objects.
- In Flat Format, `children` must be an array of ID strings, not child objects.

### Component-specific checks

- Form fields should include `value.path` unless they are purely decorative.
- Default form binding path should use `/form/<camelCaseFieldName>`.
- `ChoicePicker` should use `choiceOptions` for options in Flat Format.
- `ChoicePicker` single-select should use `variant: "mutuallyExclusive"` and a string/number default.
- `ChoicePicker` multi-select should use `variant: "default"` and an array default.
- Buttons should include `text`, `type`, and `action.event.name` when they trigger behavior.
- Action event names should be semantic English camelCase, such as `submitForm` or `queryOrderList`.
- Long text fields should use `TextField` with `variant: "longText"`.
- Status display fields should usually use `InfoField` with `variant: "tag"`.
- Long read-only descriptions should usually use `InfoField` with `variant: "quote"`.

### Layout checks

- Forms should usually be `Card > Column > fields + btnRow`.
- Bottom action buttons should be wrapped in `Row` with `justify: "end"`.
- Do not create unnecessary nested layout nodes.
- Keep IDs readable and stable.

## 10. Default Field Inference Rules

When the user gives a business UI name but does not list all fields, infer a reasonable minimal set of fields. Prefer practical defaults over asking too many questions.

| User intent | Default inferred fields / components |
|---|---|
| 通用申请单 | 申请人、所属部门、申请类型、申请原因、开始时间、结束时间、备注、提交按钮 |
| 网络权限申请单 | 申请人、所属部门、员工编号、权限类型、目标系统/地址、访问资源、申请原因、生效时间、失效时间、备注、提交申请按钮 |
| 请假申请单 | 申请人、所属部门、请假类型、开始时间、结束时间、请假事由、工作交接、提交按钮 |
| 费用报销单 | 报销人、所属部门、费用类型、报销金额、发生日期、费用说明、附件说明、提交按钮 |
| 工单创建表单 | 系统名称、模块名称、问题类型、优先级、问题描述、期望完成时间、提交按钮 |
| 用户登录表单 | 用户名、密码、登录按钮 |
| 用户注册表单 | 用户名、手机号/邮箱、密码、确认密码、注册按钮 |
| 查询筛选区 | 关键词、状态、开始日期、结束日期、查询按钮、重置按钮 |
| 详情展示卡片 | 编号、状态、创建人、创建时间、所属部门、详情说明、操作按钮（如需要） |
| 审批处理表单 | 审批结果、审批意见、通过按钮、驳回按钮 |
| 问卷/调查表 | 基本信息、单选题、多选题、意见建议、提交按钮 |

Inference rules:

- If the user names a specific business object, use that object as the `Card.header`.
- If fields are inferred, keep them common and minimal.
- Do not invent highly domain-specific fields unless the user provides the domain context.
- If a required option list is unknown, provide a small reasonable option set or ask when accuracy matters.
- If the user provides explicit fields, user-provided fields override inferred fields.
- For forms, add one primary submit button unless the user asks otherwise.

## 11. Generation Prohibitions

Avoid these mistakes when generating A2UI JSON:

- Do not output components that are not supported by A2UI unless the user explicitly says the project has custom components.
- Do not invent complex props that are not documented in `reference.md`.
- Do not use Chinese as `id` values.
- Do not use spaces, punctuation, or path-like strings in `id` values.
- Do not put `props` inside Flat Format nodes.
- Do not write `children` as nested child node objects in Flat Format.
- Do not use `options` for `ChoicePicker` in Flat Format; prefer `choiceOptions`.
- Do not omit `value.path` for real form fields.
- Do not omit `action.event.name` for action buttons.
- Do not include Markdown comments or JavaScript comments inside JSON.
- Do not output HTML, Vue templates, or CSS when the user asks for A2UI JSON.
- Do not over-explain generated JSON; keep the response concise.
- Do not add unnecessary fields, validation logic, API calls, routing, or state management unless requested.
- If component behavior is uncertain, prefer documented components and simpler layouts.
- If `reference.md` conflicts with project source or `packages/a2ui-docs`, trust the project source and docs.

## 12. Output Style

When returning generated JSON:

1. Start with a short sentence naming the UI.
2. Return a valid JSON code block.
3. Avoid unrelated explanations.
4. End with the validation prompt from `SKILL.md`.

## 10. When to Ask Clarifying Questions

Ask a follow-up question only when generation would be unreliable without more information, for example:

- The user asks for “一个表单” but gives no business subject or fields.
- The user requires exact options but does not provide them.
- The user asks for both display and editing but does not clarify which mode is primary.
- The user mentions permissions, approval, or workflow but does not specify required fields.

If the missing details are minor, make reasonable defaults and generate a complete usable JSON.

## 14. Relationship with Project Docs

The formal human-facing documentation lives in `packages/a2ui-docs`:

- `docs/guide/getting-started.md`: installation and runtime usage
- `docs/guide/json-schema.md`: schema concepts and binding rules
- `docs/components/index.md`: component overview
- `docs/components/*.md`: component-specific documentation

This skill should not copy the full docs. It should summarize the parts needed to generate high-quality A2UI JSON from natural language.
