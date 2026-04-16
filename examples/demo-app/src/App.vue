<!--
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:56:40
 * @LastEditTime: 2026-04-15 15:57:07
 * @LastEditors: hui.chenn
-->
<template>
  <div class="demo-app">
    <h1>A2UI Vue Engine Demo</h1>
    <div class="demo-container">
      <A2UIRoot
        :initial-tree="demoTree"
        :initial-data="demoData"
        @ready="onReady"
        @error="onError"
        @complete="onComplete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { A2UIRoot, type A2Node } from 'a2ui-vue-engine'

const demoTree = ref<A2Node>({
  type: 'container',
  id: 'root',
  children: [
    {
      type: 'text',
      id: 'title',
      content: 'Welcome to A2UI',
    },
    {
      type: 'button',
      id: 'btn1',
      label: 'Click Me',
      action: 'click',
    },
  ],
})

const demoData = ref({
  title: 'A2UI Demo',
  count: 0,
})

function onReady() {
  console.log('A2UI Root Ready')
}

function onError(error: Error) {
  console.error('A2UI Error:', error)
}

function onComplete() {
  console.log('A2UI Stream Complete')
}
</script>

<style scoped>
.demo-app {
  padding: 24px;
}

.demo-app h1 {
  margin-bottom: 24px;
}

.demo-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  min-height: 400px;
}
</style>