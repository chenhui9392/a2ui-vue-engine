<!--
 * @Author: hui.chenn
 * @Description: A2Icon component - Displays icons using Element Plus el-icon
 * @Date: 2026-04-16 16:00:00
 * @LastEditTime: 2026-04-16 16:30:00
 * @LastEditors: hui.chenn
-->
<template>
  <el-icon :size="size" :color="color" :class="iconClass">
    <component :is="resolvedIcon" />
  </el-icon>
</template>

<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { ElIcon } from 'element-plus'

interface A2IconProps {
  icon?: string // Icon name (e.g., 'flight_takeoff', 'Edit', 'Delete', 'IconEdit')
  size?: number | string
  color?: string
}

const props = withDefaults(defineProps<A2IconProps>(), {
  icon: '',
  size: 24,
  color: undefined,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'action', payload: any): void
}>()

const iconClass = computed(() => {
  return 'a2-icon'
})

// Resolve icon component - try various naming conventions
const resolvedIcon = computed(() => {
  const iconName = props.icon

  if (!iconName) {
    // Return a default placeholder
    return null
  }

  // Try direct resolve (e.g., 'IconEdit', 'Edit')
  try {
    const direct = resolveComponent(iconName)
    if (direct && typeof direct !== 'string') {
      return direct
    }
  } catch {
    // Ignore resolution errors
  }

  // Try with Icon prefix
  const prefixedName = iconName.startsWith('Icon') ? iconName : `Icon${iconName}`
  try {
    const prefixed = resolveComponent(prefixedName)
    if (prefixed && typeof prefixed !== 'string') {
      return prefixed
    }
  } catch {
    // Ignore resolution errors
  }

  // Convert snake_case to PascalCase with Icon prefix (e.g., 'flight_takeoff' -> 'IconFlightTakeoff')
  const pascalCase = iconName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('')

  const iconPascalName = `Icon${pascalCase}`
  try {
    const converted = resolveComponent(iconPascalName)
    if (converted && typeof converted !== 'string') {
      return converted
    }
  } catch {
    // Ignore resolution errors
  }

  // Fallback - try Document icon
  try {
    const docIcon = resolveComponent('IconDocument')
    if (docIcon && typeof docIcon !== 'string') {
      return docIcon
    }
  } catch {
    // Return a placeholder span if no icon found
  }

  // Return placeholder if no icon found
  return {
    template: '<span style="font-size: 12px; color: #999;">?</span>'
  }
})
</script>

<script lang="ts">
export default {
  name: 'A2Icon',
}
</script>

<style scoped>
.a2-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--a2-transition-fast);
}

.a2-icon:hover {
  opacity: 0.8;
}
</style>