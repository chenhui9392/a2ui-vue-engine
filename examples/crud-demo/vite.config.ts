/*
 * @Author: hui.chenn
 * @Description: crud-demo Vite Config
 *   - 直接引用 a2ui-vue-engine 源码，无需先构建
 *   - 端口 3002，避免与 playground(3001) 冲突
 * @Date: 2026-07-02 10:00:00
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
// a2ui-vue-engine 源码直接引用时，其 peer 依赖需要从 crud-demo 侧解析
const iconsVueDir = dirname(require.resolve('@element-plus/icons-vue/package.json'))
// element-plus 未声明 @vue/shared 为依赖，pnpm 严格模式下需手动指向 vue 侧已安装的副本
const vueRequire = createRequire(require.resolve('vue/package.json'))
const vueSharedDir = dirname(vueRequire.resolve('@vue/shared/package.json'))

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 4000,
    open: false,
    strictPort: false,
    proxy: {
      // 代理 /hinton-agent-mario-server → 远端 tineco 服务器，避免浏览器 CORS
      '/hinton-agent-mario-server': {
        target: 'https://hinton-test-inner.tineco.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: 'a2ui-vue-engine/style.css',
        replacement: resolve(__dirname, '../../packages/a2ui-vue-engine/src/styles/index.css'),
      },
      {
        find: 'a2ui-vue-engine',
        replacement: resolve(__dirname, '../../packages/a2ui-vue-engine/src/index.ts'),
      },
      {
        find: '@element-plus/icons-vue',
        replacement: iconsVueDir,
      },
      {
        find: '@vue/shared',
        replacement: vueSharedDir,
      },
    ],
  },
  optimizeDeps: {
    exclude: ['a2ui-vue-engine'],
  },
})
