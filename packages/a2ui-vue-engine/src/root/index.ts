/*
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:42:06
 * @LastEditTime: 2026-04-15 15:42:24
 * @LastEditors: hui.chenn
 */
import A2UIRoot from './A2UIRoot.vue'
import type { App } from 'vue'

// Export component
export { A2UIRoot }

// Default export for plugin registration
export default A2UIRoot

// Install function for Vue app
export function installA2UIRoot(app: App): void {
  app.component('A2UIRoot', A2UIRoot)
}