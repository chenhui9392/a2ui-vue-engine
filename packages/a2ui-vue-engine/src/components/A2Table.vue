<template>
  <el-table :data="rows" :style="tableStyle" empty-text="暂无数据">
    <el-table-column
      v-for="column in columns"
      :key="column.prop"
      :prop="column.prop"
      :label="column.label"
      :width="column.width"
      :align="column.align"
    />
  </el-table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElTable, ElTableColumn } from 'element-plus'
import type { A2TableColumn, A2TableRow } from '../types'

const props = withDefaults(defineProps<{
  columns?: A2TableColumn[]
  data?: A2TableRow[]
}>(), {
  columns: () => [],
  data: () => [],
})

const columns = computed(() => Array.isArray(props.columns) ? props.columns : [])
const rows = computed(() => Array.isArray(props.data) ? props.data : [])
const tableStyle = { width: '100%' }
</script>

<script lang="ts">
export default {
  name: 'A2Table',
}
</script>
