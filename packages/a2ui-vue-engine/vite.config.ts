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
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import dts from 'vite-plugin-dts'

function emitOptionalStyles() {
  return {
    name: 'a2ui-optional-styles',
    writeBundle() {
      const distDir = resolve(__dirname, 'dist')
      const stylesDir = resolve(__dirname, 'src/styles')
      mkdirSync(distDir, { recursive: true })
      copyFileSync(resolve(stylesDir, 'base.css'), resolve(distDir, 'base.css'))
      copyFileSync(resolve(stylesDir, 'variables.css'), resolve(distDir, 'variables.css'))

      const variablesCss = readFileSync(resolve(stylesDir, 'variables.css'), 'utf8')
      const componentThemeCss = readFileSync(resolve(stylesDir, 'components.css'), 'utf8')
      const componentCssPath = resolve(distDir, 'style.css')
      const componentCss = existsSync(componentCssPath)
        ? readFileSync(componentCssPath, 'utf8')
        : ''
      writeFileSync(resolve(distDir, 'theme.css'), `${variablesCss}\n${componentThemeCss}\n${componentCss}`)
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    emitOptionalStyles(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
    }),
  ],
  build: {
    assetsInlineLimit: 100000,
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
