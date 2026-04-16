/*
 * @Author: hui.chenn
 * @Description: 
 * @Date: 2026-04-15 15:48:57
 * @LastEditTime: 2026-04-15 15:49:17
 * @LastEditors: hui.chenn
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3002,
  },
})