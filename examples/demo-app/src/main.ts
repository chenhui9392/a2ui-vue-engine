import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { A2UIPlugin } from 'a2ui-vue-engine'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.use(A2UIPlugin)
app.mount('#app')