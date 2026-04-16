<!--
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:52:20
 * @LastEditTime: 2026-04-15 15:52:51
 * @LastEditors: hui.chenn
-->
<template>
  <div class="docs">
    <header class="docs-header">
      <h1>A2UI Vue Engine Docs</h1>
    </header>
    <main class="docs-main">
      <nav class="docs-nav">
        <el-menu>
          <el-menu-item index="1">Getting Started</el-menu-item>
          <el-menu-item index="2">Core</el-menu-item>
          <el-menu-item index="3">Renderer</el-menu-item>
          <el-menu-item index="4">Components</el-menu-item>
        </el-menu>
      </nav>
      <div class="docs-content">
        <h2>A2UI Vue Engine</h2>
        <p>A Vue3 UI Library for A2UI Render Engine.</p>
        <h3>Installation</h3>
        <pre>npm install a2ui-vue-engine</pre>
        <h3>Usage</h3>
        <pre>import { createApp } from 'vue'
import { A2UIPlugin } from 'a2ui-vue-engine'

const app = createApp()
app.use(A2UIPlugin)</pre>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.docs {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.docs-header {
  padding: 16px 24px;
  background: #409eff;
  color: white;
}

.docs-header h1 {
  margin: 0;
  font-size: 24px;
}

.docs-main {
  display: flex;
  flex: 1;
}

.docs-nav {
  width: 200px;
  border-right: 1px solid #e0e0e0;
}

.docs-content {
  flex: 1;
  padding: 24px;
}

.docs-content h2 {
  margin-top: 0;
}

.docs-content h3 {
  margin-top: 24px;
}

.docs-content pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
}
</style>