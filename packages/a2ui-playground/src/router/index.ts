/*
 * @Author: hui.chenn
 * @Description: Playground Router - 轻量路由（基于 history API，无 vue-router 依赖）
 *
 *   为什么不用 vue-router？
 *   - Playground 只需多页切换 + 侧边导航，不需要嵌套路由/路由守卫等高级能力
 *   - 避免引入额外依赖，降低安装门槛
 *   - 如未来需要复杂路由，可平滑迁移到 vue-router
 * @Date: 2026-07-06 10:00:00
 */
import { ref, type Component } from 'vue'
import CrudPage from '../pages/crud/index.vue'
import SchemaDebugPage from '../pages/schema-debug/index.vue'

export interface RouteItem {
  path: string
  label: string
  component: Component
}

export const routes: RouteItem[] = [
  { path: '/crud', label: 'CRUD 示例', component: CrudPage },
  { path: '/schema-debug', label: 'Schema 调试', component: SchemaDebugPage },
]

export const currentPath = ref(window.location.pathname)

/** 当前路由匹配项 */
export function currentRoute(): RouteItem {
  return routes.find(r => r.path === currentPath.value) || routes[0]
}

/** 编程式导航 */
export function navigate(path: string) {
  if (path !== currentPath.value) {
    window.history.pushState({}, '', path)
    currentPath.value = path
  }
}

// 监听浏览器前进/后退
window.addEventListener('popstate', () => {
  currentPath.value = window.location.pathname
})

// 首次访问根路径 → 重定向到首个路由
if (currentPath.value === '/' || !routes.some(r => r.path === currentPath.value)) {
  navigate(routes[0].path)
}
