<!--
 * @Author: hui.chenn
 * @Description: A2Toolbar - 工具栏组件，协议驱动，所有按钮统一走 Action System
 *   支持：新增 / 删除 / 刷新 / 导出 / 批量操作 / 自定义按钮
 *   位置：左区 / 右区（left / right），可通过 slots 或 buttons 声明
 * @Date: 2026-07-01 10:00:00
 * @LastEditTime: 2026-07-02 15:19:02
 * @LastEditors: hui.chenn
-->
<template>
  <div :class="rootClass">
    <div v-if="title || $slots.title" class="a2-toolbar__title">
      <slot name="title">{{ title }}</slot>
    </div>

    <!-- 左区 -->
    <div class="a2-toolbar__left">
      <template v-if="leftButtons && leftButtons.length > 0">
        <component
          v-for="(child, index) in leftButtons"
          :key="child.id || `left-${index}`"
          :is="renderButton(child)"
        />
      </template>
      <slot name="left" />
    </div>

    <!-- 中区（可选，用于状态 / 计数）-->
    <div v-if="$slots.center || centerText" class="a2-toolbar__center">
      <slot name="center">
        <span class="a2-toolbar__hint">{{ centerText }}</span>
      </slot>
    </div>

    <!-- 右区 -->
    <div class="a2-toolbar__right">
      <template v-if="rightButtons && rightButtons.length > 0">
        <component
          v-for="(child, index) in rightButtons"
          :key="child.id || `right-${index}`"
          :is="renderButton(child)"
        />
      </template>
      <slot name="right" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue'
import type { A2Node, RenderContext, ActionConfig } from '../types'
import { renderNode } from '../renderer/renderNode'

/**
 * Toolbar 按钮的协议对象（也可以直接使用 A2Node）
 * - preset: 内置动作快捷方式；未提供 actions 时会生成对应 action
 * - text/icon/type 等 A2Button 已有属性
 */
export interface A2ToolbarButton extends A2Node {
  /** 内置动作类型（协议驱动，走 Action System）*/
  preset?: 'add' | 'delete' | 'refresh' | 'export' | 'batch' | 'custom'
  /** 是否显示 */
  visible?: boolean
}

interface A2ToolbarProps {
  /** 工具栏标题（可选）*/
  title?: string
  /** 中间提示文案（可选）*/
  centerText?: string
  /** 左侧按钮（主操作，如 新增 / 批量删除）*/
  buttons?: A2ToolbarButton[]
  /** 右侧按钮（辅助操作，如 刷新 / 导出）*/
  rightButtons?: A2ToolbarButton[]
  /** children / context：由 Renderer 通过 SELF_RENDER 通道注入 */
  children?: A2Node[]
  context?: RenderContext
  /** 尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 是否显示分割线 */
  bordered?: boolean
}

const props = withDefaults(defineProps<A2ToolbarProps>(), {
  title: '',
  centerText: '',
  buttons: () => [],
  rightButtons: () => [],
  size: 'default',
  bordered: true,
})

const emit = defineEmits<{
  (e: 'action', payload: any): void
}>()

// 左区按钮：优先使用 buttons，其次使用 children（如果 children 内已经是按钮列表）
const leftButtons = computed<A2ToolbarButton[]>(() => {
  const source = props.buttons && props.buttons.length > 0
    ? props.buttons
    : (Array.isArray(props.children) ? (props.children as A2ToolbarButton[]) : [])
  return source
    .filter(b => b && b.visible !== false)
    .map(normalizeButton)
})

const rightButtons = computed<A2ToolbarButton[]>(() => {
  return (props.rightButtons || [])
    .filter(b => b && b.visible !== false)
    .map(normalizeButton)
})

const rootClass = computed(() => {
  const cls = ['a2-toolbar', `a2-toolbar--${props.size}`]
  if (props.bordered) cls.push('a2-toolbar--bordered')
  return cls.join(' ')
})

/**
 * 规范化按钮节点：
 * - 补默认 type = a2-button
 * - 若声明了 preset 且没有 actions，则按 preset 生成默认 action（走 emit 通道 -> Action System）
 * - 若声明了 preset 但没有 text/type/icon，则填充预设文案与样式
 */
function normalizeButton(btn: A2ToolbarButton): A2ToolbarButton {
  const merged: A2ToolbarButton = { ...btn }
  merged.type = merged.type || 'a2-button'
  merged.props = { ...(merged.props || {}) }

  // 预设文案与视觉
  const preset = merged.preset
  if (preset) {
    const cfg = PRESET_CONFIG[preset]
    if (cfg) {
      if (!merged.props.text) merged.props.text = cfg.text
      if (!merged.props.type) merged.props.type = cfg.type
      if (cfg.icon && !merged.props.icon) merged.props.icon = cfg.icon

      // 若未声明 actions，则按预设生成一条 emit 动作，走 Action System
      if (!merged.actions || merged.actions.length === 0) {
        merged.actions = [
          {
            event: 'click',
            type: 'emit',
            payload: {
              action: cfg.actionName,
              preset,
            },
          } as ActionConfig,
        ]
      }
    }
  }

  return merged
}

function renderButton(node: A2ToolbarButton) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2ToolbarButtonChild',
    setup() {
      return () => renderNode(node, props.context!)
    },
  })
}

// 预设按钮的默认视觉与 emit action 名（协议驱动，宿主可覆盖）
const PRESET_CONFIG: Record<string, { text: string; type: string; icon?: string; actionName: string }> = {
  add:     { text: '新增',    type: 'primary', actionName: 'add' },
  delete:  { text: '删除',    type: 'danger',  actionName: 'delete' },
  refresh: { text: '刷新',    type: 'default', actionName: 'refresh' },
  export:  { text: '导出',    type: 'default', actionName: 'export' },
  batch:   { text: '批量操作', type: 'default', actionName: 'batch' },
  custom:  { text: '自定义',  type: 'default', actionName: 'custom' },
}

// 兼容：本组件的 emit('action') 保留为兜底通道
function _emitAction(payload: any) {
  emit('action', payload)
}
// eslint 抑制：占位以匹配现有组件风格
void _emitAction
</script>

<script lang="ts">
export default {
  name: 'A2Toolbar',
}
</script>

<style scoped>
.a2-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: #ffffff;
  border-radius: var(--a2-radius-md, 8px);
  margin-bottom: 12px;
}

.a2-toolbar--bordered {
  border: 1px solid var(--a2-border-lighter, #ebeef5);
}

.a2-toolbar--small { padding: 6px 8px; }
.a2-toolbar--large { padding: 12px 16px; }

.a2-toolbar__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--a2-text-primary, #303133);
  margin-right: 8px;
}

.a2-toolbar__left,
.a2-toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.a2-toolbar__right {
  margin-left: auto;
}

.a2-toolbar__center {
  display: flex;
  align-items: center;
  color: var(--a2-text-secondary, #909399);
  font-size: 13px;
}

.a2-toolbar__hint {
  color: var(--a2-text-secondary, #909399);
}
</style>
