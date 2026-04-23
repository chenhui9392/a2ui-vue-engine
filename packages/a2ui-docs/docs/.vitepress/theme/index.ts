import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

// Element Plus
import ElementPlus from 'element-plus'
import { ID_INJECTION_KEY } from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// A2UI Vue Engine - 使用源文件实现实时更新
import A2UIPlugin from 'a2ui-vue-engine'
import 'a2ui-vue-engine/styles/index.css'

// Custom styles
import './custom.css'

// Custom components
import PlaygroundEmbed from './components/PlaygroundEmbed.vue'
import PlaygroundPage from './components/PlaygroundPage.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register Element Plus with SSR ID injection
    app.use(ElementPlus)
    app.provide(ID_INJECTION_KEY, {
      prefix: Math.floor(Math.random() * 10000),
      current: 0,
    })

    // Register Element Plus Icons
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }

    // Register A2UI Vue Engine
    app.use(A2UIPlugin)

    // Register custom components
    app.component('PlaygroundEmbed', PlaygroundEmbed)
    app.component('PlaygroundPage', PlaygroundPage)
  }
} satisfies Theme