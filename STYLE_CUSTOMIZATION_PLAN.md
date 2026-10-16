# A2UI Vue Engine 样式解耦方案

## 目标

让引入 `a2ui-vue-engine` 的项目决定颜色、字体、圆角、间距和组件外观。组件包负责 JSON 转换、渲染、交互与必要布局，不向整个宿主页面强加品牌样式。新建的 Step、Table 同样遵循这个边界。

本文与 [Step 与基础表格组件方案](STEP_TABLE_COMPONENT_PLAN.md) 分成两份：组件扩展是一项局部功能，样式解耦会影响现有全部组件、打包入口和接入文档，适合独立实施与评审。

## 当前情况

- `src/index.ts` 自动导入 `src/styles/index.css`，后者导入 `variables.css`。该文件同时定义 `:root` 变量、`.a2-*` 工具类和全局 `.el-*` 覆盖，会影响宿主项目的 Element Plus 组件。
- 多数 `A2*.vue` 和 `A2UIRoot.vue` 含 `<style scoped>`，其中有固定颜色、字号、边框、阴影等。仅删除 `src/index.ts` 的 CSS 导入并不能去掉组件内样式。
- `A2Button.vue` 根据按钮文案自动决定类型、颜色和“提交”图标；`A2Card.vue` 固定头部图标、背景和宽度；`A2InfoField.vue` 通过内联样式设置 tag/quote 外观。这些视觉规则需要从组件逻辑中移出或改为显式配置。
- 组件使用 Element Plus。即使移除本包自定义 CSS，只要宿主引入 `element-plus/dist/index.css`，仍会看到 Element Plus 的默认外观。

## 建议采用的边界

采用“**无包内品牌主题、保留可用结构**”作为本次目标。

| 归属 | 内容 |
| --- | --- |
| 组件包 | DOM 结构、状态类、交互与无障碍属性，以及 `display`、必要宽度等保证布局可用的规则。 |
| 引入方 | Element Plus 基础 CSS、品牌主题、颜色、字体、边框、阴影、组件尺寸及业务页面布局。 |
| 文档站 / Playground | 为演示单独引入示例主题；示例主题不随组件 JS 自动应用到业务项目。 |

这仍是基于 Element Plus 的组件库。如果目标是完全不依赖 Element Plus 外观、由宿主替换所有 DOM 和控件实现，则需要另做无界面渲染核心与 UI 适配器拆分，属于更大的改造。

## 改造方案

### 1. 拆分样式入口

将当前 `variables.css` 中的内容分类：

- `base.css`：仅保留组件正常排版必需的中性结构规则；选择器限定在 `.a2-*` 内，避免影响宿主其他元素。
- `theme.css`：迁出目前的颜色、圆角、阴影、默认间距和视觉变体，作为**可选**的示例主题。
- 删除组件包对 `.el-button`、`.el-input`、`.el-table` 等全局选择器的直接覆盖；演示所需的 Element Plus 定制移入文档站或可选主题，并限定在演示容器内。

调整 `src/index.ts` 和 `package.json` 的样式入口，让使用方明确选择是否引入 `base.css`、`theme.css`。不再从 JS 入口自动引入品牌主题。构建产物和 `exports` 需要对应更新；现有 `style.css` 可在过渡期保留为旧主题的显式导入入口，并在文档标明用途。

### 2. 清理组件内的固定视觉规则

- 保留真正影响布局和可用性的规则，例如 Row/Column 排列、表单项对齐、图标尺寸；移出固定品牌色、阴影、边框和默认装饰。
- 移除 `A2Button` 的文案识别选色及自动“提交”图标；按钮类型由 JSON 的 `type` 或宿主主题决定。禁用状态交给 Element Plus 状态样式及宿主主题。
- `A2Card` 不默认插入固定头部图片，也不强制背景色。宽度由明确的 `width` 属性决定；需要修改当前默认 `md=560px` 的行为，并记录兼容性影响。
- `A2InfoField` 等组件的视觉变体保留语义 class，例如 tag、quote、selected、disabled；颜色和装饰交给宿主 CSS。去除用于固定颜色的内联样式，避免宿主覆盖时依赖 `!important`。
- Step、Table 只输出稳定的根 class 与必要结构；不增加包内专属视觉主题。

### 3. 提供稳定的自定义入口

为组件根元素及主要内部区域提供一致的 `a2-*` class；继续保留渲染器现有的 `data-a2-type`、`data-a2-id`。在文档中说明哪些 class 是稳定接口，以及哪些是 Element Plus 内部 class，避免接入方依赖易变的 DOM 层级。

推荐宿主通过页面容器限定主题范围，例如：

```css
.business-a2 .a2-card { border-radius: 8px; }
.business-a2 .a2-info-field--tag { color: #175cd3; }
.business-a2 { --el-color-primary: #175cd3; }
```

示例中的内部 class 命名需在改造时统一落实，不直接承诺当前已有该选择器。

### 4. 调整示例与接入说明

更新 README、组件文档、Playground 和 demo 的样式导入示例。接入项目应显式引入 Element Plus CSS、引擎基础布局样式和项目自己的主题；文档站可以额外引入可选示例主题，以保留可阅读的演示页面。

```ts
import 'element-plus/dist/index.css'
import 'a2ui-vue-engine/base.css'
import './my-a2ui-theme.css'
```

上述 `base.css` 是计划中的新导出路径，当前版本尚未提供。

## 实施顺序与兼容性

1. 盘点每个组件的样式和内联视觉逻辑，确定“布局必需”与“主题外观”的归属。
2. 建立 `base.css` / `theme.css` 的导出入口，移除全局 `.el-*` 覆盖。
3. 逐个迁移组件样式与固定视觉逻辑，统一可供宿主覆盖的 class。
4. 更新文档站、独立 Playground、demo 和 README 的显式样式导入。
5. 检查引入方不加载示例主题时组件仍可用，加载宿主主题时可修改外观，文档演示仍正常。

移除默认视觉、自动按钮选色以及 Card 默认宽度会改变现有页面观感，建议作为不兼容版本发布，附迁移说明。若需要先平滑过渡，可暂时保留旧 `style.css` 供现有项目显式导入。
