/*
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:46:34
 * @LastEditTime: 2026-04-15 16:50:35
 * @LastEditors: hui.chenn
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import 'a2ui-vue-engine/style.css'

const app = createApp(App)

// Register Element Plus
app.use(ElementPlus)

// Register Element Plus Icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
