<!--
 * @Author: hui.chenn
 * @Description: Playground Layout - 侧边导航 + 路由出口
 *
 *   所有页面共享的布局壳，不承载业务逻辑
 *   使用轻量路由（router/index.ts），无 vue-router 依赖
 * @Date: 2026-07-06 10:00:00
-->
<template>
  <div class="playground-shell">
    <aside class="sidebar">
      <div class="logo">A2UI Playground</div>
      <nav class="nav">
        <a
          v-for="r in routes"
          :key="r.path"
          class="nav-item"
          :class="{ active: r.path === currentPath }"
          @click="navigate(r.path)"
        >{{ r.label }}</a>
      </nav>
    </aside>
    <main class="content">
      <component :is="currentRoute().component" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { routes, currentPath, currentRoute, navigate } from '../router'
</script>

<style scoped>
.playground-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f5f7fa;
}
.sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #1f2329;
  color: #e5eaf3;
  display: flex;
  flex-direction: column;
}
.logo {
  padding: 20px 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #2c3038;
}
.nav {
  display: flex;
  flex-direction: column;
  padding: 8px 0;
}
.nav-item {
  padding: 10px 16px;
  color: #a8abb2;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-item:hover { color: #e5eaf3; background: #2c3038; }
.nav-item.active { color: #409eff; background: #2c3038; }
.content {
  flex: 1;
  min-width: 0;
  overflow: auto;
}
</style>
