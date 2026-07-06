<!--
 * @Author: hui.chenn
 * @Description: CRUD Playground Page - 系统问题与故障上报规则库
 *
 *   职责：加载 Schema → 创建 Runtime → 渲染 A2UIRoot
 *   不含任何业务逻辑（无 handleAction / http / dialog 控制 / form 赋值）
 *   所有页面行为由 Runtime 驱动
 * @Date: 2026-07-06 10:00:00
-->
<template>
  <div class="crud-page">
    <A2UIRoot :runtime="crudRuntime" />
  </div>
</template>

<script setup lang="ts">
import { A2UIRoot } from 'a2ui-vue-engine'
import { crudRuntime } from '../../runtime/crud.runtime'
</script>

<style scoped>
.crud-page {
  max-width: 1280px;
  margin: 24px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.crud-page :deep(.a2ui-root) { width: 100%; }
.crud-page :deep(.a2-list),
.crud-page :deep(.a2-column),
.crud-page :deep(.a2-row) { width: 100%; min-width: 0; }
</style>
