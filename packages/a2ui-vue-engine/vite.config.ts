/*
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:31:25
 * @LastEditTime: 2026-04-15 15:31:50
 * @LastEditors: hui.chenn
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'A2UIVueEngine',
      fileName: 'a2ui-vue-engine',
    },
    rollupOptions: {
      external: ['vue', 'element-plus', 'element-plus/es', 'element-plus/es/components/message/style/css', '@element-plus/icons-vue'],
      output: {
        globals: {
          vue: 'Vue',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIconsVue',
        },
      },
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})