<!--
 * @Author: hui.chenn
 * @Description: A2Dialog - 协议入口（A2Overlay 的 dialog 模式预设）
 *   Dialog 与 Drawer 共享 A2Overlay + DialogRuntime，不重复代码
 * @Date: 2026-07-01 10:00:00
-->
<template>
  <A2Overlay
    mode="dialog"
    :config="config"
    :visible="visible"
    :children="children"
    :context="context"
    :form-prefix="formPrefix"
    @update:visible="(v) => $emit('update:visible', v)"
    @submit="(p) => $emit('submit', p)"
    @cancel="() => $emit('cancel')"
    @action="(p) => $emit('action', p)"
    @visible-change="(v) => $emit('visibleChange', v)"
  />
</template>

<script setup lang="ts">
import A2Overlay from './A2Overlay.vue'
import type { A2Node, RenderContext } from '../types'
import type { DialogRuntimeConfig, OverlaySubmitPayload } from '../dialog-runtime'

interface A2DialogProps {
  config?: DialogRuntimeConfig
  visible?: boolean
  children?: A2Node[]
  context?: RenderContext
  formPrefix?: string
}

defineProps<A2DialogProps>()

defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'submit', payload: OverlaySubmitPayload): void
  (e: 'cancel'): void
  (e: 'action', payload: any): void
  (e: 'visibleChange', v: boolean): void
}>()
</script>

<script lang="ts">
export default {
  name: 'A2Dialog',
}
</script>
