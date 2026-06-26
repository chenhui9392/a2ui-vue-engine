---
name: a2ui-json-ui
description: Generate A2UI Vue JSON Schema. Invoke when users ask to create forms, cards, layouts, pages, or UI from natural language.
---

# A2UI JSON UI Skill

A2UI is a JSON Schema-driven Vue3 UI rendering engine. Use this skill to convert natural language UI requirements into valid A2UI JSON configurations.

## When to Use

Use this skill when the user wants to generate, create, build, render, or configure any UI that can be expressed with A2UI components, including:

- Forms: application forms, login/register forms, feedback forms, search/filter forms, questionnaires
- Display cards: user info cards, order details, work order details, dashboards, notification cards
- Layouts: pages, panels, two-column/three-column layouts, list/detail layouts
- Components: buttons, inputs, selects, date pickers, choice pickers, info fields
- JSON-driven UI: A2UI JSON, JSON Schema, flat schema, component configuration
- Getting started / integration: how to install, import, register, use, access, or integrate A2UI
- Project setup tasks: install A2UI dependencies and modify an existing Vue project to register and use A2UI

Also use this skill when the user describes a group of fields or a business UI process, even if they do not explicitly mention A2UI.

For questions like "A2UI 怎么接入", "怎么使用 A2UI", "如何开始", "getting started", "how to integrate A2UI", return a beginner-friendly quick integration guide instead of generating complex JSON.

For requests like "帮我安装 A2UI 并接入", "把 A2UI 接到当前项目", or "install and integrate A2UI", treat it as a project modification task: inspect the package manager and Vue entry file, install dependencies if tools/permissions allow, then update the entry file and optionally add a minimal A2UIRoot example. If command execution or file modification is not available, provide exact manual steps.

Before installing or editing, validate that the target project is compatible with A2UI: it must be a Vue 3 frontend project. If the project is React, Vue2, Nuxt/SSR without confirmed setup, Taro/mini-app, backend-only, missing `package.json`, monorepo with unclear target app, missing Vue entry file, or otherwise ambiguous, stop and explain the issue clearly instead of forcing changes. Offer safe alternatives such as a Vue3 sub-app, iframe/micro-frontend integration, or asking the user to specify the target app/entry file.

## Do Not Use

Do not use this skill when the user asks about:

- Generic Vue / JavaScript / TypeScript syntax
- Debugging or modifying component source code
- Backend APIs, databases, deployment, or infrastructure
- Native HTML/CSS templates instead of A2UI JSON

## Required Output Rules

1. Prefer **Flat Format** for all generated JSON unless the user explicitly requests nested format.
2. The output must be a JSON array.
3. The first node must be `{ "id": "root", ... }`.
4. Use PascalCase component names in flat format, such as `Card`, `Column`, `TextField`, `InfoField`, `ChoicePicker`, `Button`.
5. Use `child` for one child ID and `children` for multiple child IDs.
6. Use `value.path` for data binding. Default form paths should use `/form/<fieldName>`.
7. Use semantic English camelCase IDs and action event names.
8. Keep the answer focused: output the JSON, with only brief explanatory text when useful.
9. Before returning A2UI JSON, always run the self-check rules in `usage-guide.md` to validate IDs, child references, format consistency, bindings, and actions.
10. Every response that returns A2UI JSON must end with the validation prompt in the "Validation Prompt" section.

## Generation Workflow

Follow this workflow for natural language requests:

1. Identify the UI type: form, display card, layout, list, selector, or mixed page.
2. Extract fields, labels, options, default values, and actions from the user request.
3. Choose components using `usage-guide.md` field-to-component rules.
4. Build the layout using `Card` + `Column` as the default structure.
5. Add action buttons in a bottom `Row` aligned to the end.
6. Validate that every node has a unique `id` and all `child/children` references exist.
7. Return the JSON and the validation prompt.

## Supporting Files

- `usage-guide.md`: AI generation guide for turning natural language into A2UI JSON.
- `reference.md`: Component catalog, flat format rules, prop mappings, and common patterns.

Use `usage-guide.md` for generation decisions and `reference.md` for component details.

## Validation Prompt

Append this prompt after every generated A2UI JSON response:

> **在线验证提示**
>
> 生成的 A2UI JSON 配置可以前往以下 Playground 进行实时预览与验证：
>
> [A2UI Playground - 在线调试](https://chenhui9392.github.io/a2ui-vue-engine/playground.html)
>
> 将生成的 JSON 粘贴至 Playground 编辑器后，点击【运行】按钮，即可查看渲染效果并验证配置正确性。
