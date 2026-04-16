/*
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:50:36
 * @LastEditTime: 2026-04-15 15:51:08
 * @LastEditors: hui.chenn
 */
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')