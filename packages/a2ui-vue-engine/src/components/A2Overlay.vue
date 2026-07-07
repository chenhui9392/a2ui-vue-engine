<!--
 * @Author: hui.chenn
 * @Description: A2Overlay - Dialog / Drawer 统一消费组件
 *   通过 mode 区分外观（dialog | drawer），共享 Runtime / Schema / Footer / Actions / API
 *   不重复代码
 * @Date: 2026-07-01 10:00:00
 * @LastEditTime: 2026-07-01 10:00:00
 * @LastEditors: hui.chenn
-->
<template>
  <!-- Dialog 模式 -->
  <el-dialog
    v-if="mode === 'dialog'"
    :model-value="innerVisible"
    :title="config.title"
    :width="resolvedWidth"
    :modal="config.modal !== false"
    :close-on-click-modal="config.closeOnClickModal !== false"
    :close-on-press-escape="config.closeOnPressEscape !== false"
    :show-close="config.showClose !== false"
    :destroy-on-close="config.destroyOnClose !== false"
    @update:model-value="handleVisibleChange"
    @close="handleClose"
  >
    <div class="a2-overlay__content">
      <component
        v-for="(child, index) in contentNodes"
        :key="child.id || index"
        :is="renderChild(child)"
      />
    </div>

    <template v-if="footerButtons.length > 0" #footer>
      <div :class="footerClass">
        <component
          v-for="(btn, index) in footerButtons"
          :key="btn.id || `footer-${index}`"
          :is="renderFooterButton(btn)"
          @click="() => handleFooterClick(btn, $event)"
        />
      </div>
    </template>
  </el-dialog>

  <!-- Drawer 模式 -->
  <el-drawer
    v-else
    :model-value="innerVisible"
    :title="config.title"
    :size="resolvedWidth"
    :direction="drawerDirection"
    :modal="config.modal !== false"
    :close-on-click-modal="config.closeOnClickModal !== false"
    :close-on-press-escape="config.closeOnPressEscape !== false"
    :show-close="config.showClose !== false"
    :destroy-on-close="config.destroyOnClose !== false"
    @update:model-value="handleVisibleChange"
    @close="handleClose"
  >
    <div class="a2-overlay__content">
      <component
        v-for="(child, index) in contentNodes"
        :key="child.id || index"
        :is="renderChild(child)"
      />
    </div>

    <template v-if="footerButtons.length > 0" #footer>
      <div :class="footerClass">
        <component
          v-for="(btn, index) in footerButtons"
          :key="btn.id || `footer-${index}`"
          :is="renderFooterButton(btn)"
          @click="() => handleFooterClick(btn, $event)"
        />
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, defineComponent, inject, ref, watch, onBeforeUnmount } from 'vue'
import { ElDialog, ElDrawer } from 'element-plus'
import type { Ref } from 'vue'
import type { A2Node, RenderContext } from '../types'
import { renderNode } from '../renderer/renderNode'
import {
  DialogRuntime,
  type DialogRuntimeConfig,
  type OverlayFooterButton,
  type OverlaySubmitPayload,
  type OverlayMode,
  type OverlayPlacement,
  type OverlaySize,
} from '../runtime/dialog-runtime'

interface A2OverlayProps {
  /** 展示模式：dialog / drawer */
  mode?: OverlayMode
  /** 协议驱动配置 */
  config?: DialogRuntimeConfig
  /** 受控 visible（协议侧通常通过 bindings.visible 使用）*/
  visible?: boolean
  /** children / context：由 Renderer 通过 SELF_RENDER 通道注入 */
  children?: A2Node[]
  context?: RenderContext
  /** 表单命名空间（用于 formData 读取）*/
  formPrefix?: string
}

const props = withDefaults(defineProps<A2OverlayProps>(), {
  mode: undefined,
  visible: false,
  formPrefix: '',
})

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', payload: OverlaySubmitPayload): void
  (e: 'cancel'): void
  (e: 'action', payload: any): void
  (e: 'visibleChange', v: boolean): void
}>()

// 注入 A2UIRoot.data 用于读取 form 快照
const a2uiData = inject<Ref<Record<string, any>>>('a2uiData', undefined as any)

// 内部 visible（响应外部 prop 与 Runtime 状态）
const innerVisible = ref<boolean>(!!props.visible)

// DialogRuntime 实例
const runtime = createRuntime()

function createRuntime() {
  return new DialogRuntime({
    id: 'a2-overlay',
    config: props.config || {},
    initialVisible: props.visible,
    form: a2uiData
      ? {
          read: () => {
            const form = a2uiData?.value?.form
            if (!form) return {}
            return props.formPrefix ? { ...(form[props.formPrefix] || {}) } : { ...form }
          },
        }
      : undefined,
    onSubmit: (payload) => {
      emit('submit', payload)
      emit('action', { type: 'submit', ...payload })
    },
    onCancel: () => {
      emit('cancel')
      emit('action', { type: 'cancel' })
    },
    onAction: (button, event) => {
      emit('action', {
        type: 'footerButton',
        preset: button.preset,
        buttonId: button.id,
        event,
      })
    },
    onVisibleChange: (v) => {
      innerVisible.value = v
      emit('update:visible', v)
      emit('visibleChange', v)
    },
  })
}

// 受控 visible → Runtime 同步
watch(
  () => props.visible,
  (v) => {
    if (v !== runtime.state.visible) runtime.setVisible(!!v)
  }
)

// Runtime state.visible → 内部 ref（避免闭合环）
watch(
  () => runtime.state.visible,
  (v) => {
    innerVisible.value = v
  },
  { immediate: true }
)

// config 变化（宿主动态修改）
watch(
  () => props.config,
  (cfg) => {
    if (cfg) runtime.updateConfig(cfg)
  }
)

const mode = computed<OverlayMode>(() => {
  return props.mode || props.config?.mode || 'dialog'
})

const config = computed(() => runtime.getConfig())

const drawerDirection = computed(() => {
  const p: OverlayPlacement = config.value.placement || 'right'
  const map: Record<OverlayPlacement, string> = {
    right: 'rtl',
    left: 'ltr',
    top: 'ttb',
    bottom: 'btt',
  }
  return map[p] || 'rtl'
})

const resolvedWidth = computed(() => {
  const size: OverlaySize | undefined = config.value.size
  if (!size) return mode.value === 'drawer' ? '30%' : '520px'
  const presets: Record<string, string> = {
    xs: mode.value === 'drawer' ? '20%' : '360px',
    sm: mode.value === 'drawer' ? '30%' : '460px',
    md: mode.value === 'drawer' ? '40%' : '620px',
    lg: mode.value === 'drawer' ? '60%' : '820px',
    xl: mode.value === 'drawer' ? '80%' : '960px',
    full: '100%',
  }
  if (typeof size === 'string' && presets[size]) return presets[size]
  return size as string
})

const contentNodes = computed<A2Node[]>(() => {
  const raw = config.value.content
  // columns 配置：注入到 a2-column content，切换为 CSS Grid 多列布局（默认 2 列）
  const columns = config.value.columns ?? 2
  if (raw && !Array.isArray(raw) && (raw.type === 'a2-column' || raw.type === 'layout.column')) {
    return [{ ...raw, props: { ...raw.props, columns } }]
  }
  if (Array.isArray(raw)) return raw
  if (raw) return [raw]
  // 兼容：也可从 props.children 传入
  return (props.children || []) as A2Node[]
})

const footerButtons = computed<OverlayFooterButton[]>(() =>
  runtime.normalizedFooter.value
)

const footerClass = computed(() => 'a2-overlay__footer')

function handleVisibleChange(v: boolean) {
  runtime.setVisible(v)
}

function handleClose() {
  runtime.close()
}

async function handleFooterClick(btn: OverlayFooterButton, event: any) {
  await runtime.handleFooterAction(btn, event)
}

function renderChild(node: A2Node) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2OverlayChild',
    setup() {
      return () => renderNode(node, props.context!)
    },
  })
}

function renderFooterButton(node: A2Node) {
  if (!props.context) return null
  return defineComponent({
    name: 'A2OverlayFooterButton',
    setup() {
      return () => renderNode(node, props.context!)
    },
  })
}

onBeforeUnmount(() => {
  // 无副作用清理，占位
})
</script>

<script lang="ts">
export default {
  name: 'A2Overlay',
}
</script>

<style scoped>
.a2-overlay__content {
  width: 100%;
}

.a2-overlay__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
