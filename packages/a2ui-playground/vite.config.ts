/*
 * @Author: hui.chenn
 * @Description: A2UI Playground Vite Config
 * @Date: 2026-04-15 15:45:13
 * @LastEditTime: 2026-04-15 17:30:00
 * @LastEditors: hui.chenn
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    port: 3001,
  },
  resolve: {
    alias: [
      // 更具体的路径必须放在前面，确保优先匹配
      {
        find: 'a2ui-vue-engine/style.css',
        replacement: resolve(__dirname, '../a2ui-vue-engine/src/styles/index.css'),
      },
      // 开发模式下直接引用源文件，而不是构建后的 dist
      {
        find: 'a2ui-vue-engine',
        replacement: resolve(__dirname, '../a2ui-vue-engine/src/index.ts'),
      },
    ],
  },
  optimizeDeps: {
    // 排除 a2ui-vue-engine，让 vite 直接处理源文件
    exclude: ['a2ui-vue-engine'],
  },
})