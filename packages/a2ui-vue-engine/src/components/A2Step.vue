<template>
  <el-steps
    v-if="steps.length > 0"
    :active="currentActive"
    :direction="direction"
  >
    <el-step
      v-for="(step, index) in steps"
      :key="index"
      :title="step.title"
      :description="step.description"
    />
  </el-steps>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElStep, ElSteps } from 'element-plus'
import type { A2StepItem } from '../types'

const props = withDefaults(defineProps<{
  steps?: A2StepItem[]
  active?: number
  direction?: 'horizontal' | 'vertical'
}>(), {
  steps: () => [],
  active: 0,
  direction: 'horizontal',
})

const steps = computed(() => Array.isArray(props.steps) ? props.steps : [])
const currentActive = computed(() => {
  if (steps.value.length === 0) return 0
  const active = Number.isFinite(props.active) ? Math.trunc(props.active) : 0
  return Math.max(0, Math.min(active, steps.value.length - 1))
})
</script>

<script lang="ts">
export default {
  name: 'A2Step',
}
</script>
