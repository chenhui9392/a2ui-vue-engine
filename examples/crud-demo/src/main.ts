/*
 * @Author: hui.chenn
 * @Description: A2UI CRUD Demo · Entry
 * @Date: 2026-07-02 10:00:00
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'a2ui-vue-engine/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
