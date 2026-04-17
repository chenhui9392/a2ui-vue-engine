import { defineConfig } from 'vitepress'
import path from 'path'

export default defineConfig({
  title: 'A2UI',
  base: '/a2ui-vue-engine/',

  vite: {
    server: {
      port: 4000,
    },
    resolve: {
      alias: {
        'a2ui-vue-engine': path.resolve(__dirname, '../../../a2ui-vue-engine/src'),
      },
    },
    ssr: {
      noExternal: ['element-plus', '@element-plus/icons-vue', 'a2ui-vue-engine']
    }
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'A2UI',
      description: 'A2UI Vue3 渲染引擎文档',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: 'Playground', link: '/playground' },
          { text: '指南', link: '/guide/getting-started' },
          { text: '组件', link: '/components/' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: '指南',
              items: [
                { text: '快速开始', link: '/guide/getting-started' },
                { text: '架构设计', link: '/guide/architecture' },
                { text: 'JSON 规范', link: '/guide/json-schema' },
              ]
            }
          ],
          '/components/': [
            {
              text: '布局组件',
              items: [
                { text: 'A2Card', link: '/components/a2-card' },
                { text: 'A2Row', link: '/components/a2-row' },
                { text: 'A2Column', link: '/components/a2-column' },
                { text: 'A2List', link: '/components/a2-list' },
              ]
            },
            {
              text: '表单组件',
              items: [
                { text: 'A2TextField', link: '/components/a2-text-field' },
                { text: 'A2Input', link: '/components/a2-input' },
                { text: 'A2SelectField', link: '/components/a2-select-field' },
                { text: 'A2DatePicker', link: '/components/a2-date-picker' },
                { text: 'A2DateTimeInput', link: '/components/a2-date-time-input' },
              ]
            },
            {
              text: '展示组件',
              items: [
                { text: 'A2Text', link: '/components/a2-text' },
                { text: 'A2Icon', link: '/components/a2-icon' },
              ]
            },
            {
              text: '操作组件',
              items: [
                { text: 'A2Button', link: '/components/a2-button' },
              ]
            }
          ]
        },
        footer: {
          message: 'A2UI 文档',
          copyright: 'Copyright © 2026 A2UI Team'
        },
        docFooter: {
          prev: '上一页',
          next: '下一页'
        },
        outline: {
          label: '页面导航'
        },
        lastUpdated: {
          text: '最后更新于'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      title: 'A2UI',
      description: 'A2UI Vue3 Render Engine Documentation',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Playground', link: '/en/playground' },
          { text: 'Guide', link: '/en/guide/getting-started' },
          { text: 'Components', link: '/en/components/' },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Getting Started', link: '/en/guide/getting-started' },
                { text: 'Architecture', link: '/en/guide/architecture' },
                { text: 'JSON Schema', link: '/en/guide/json-schema' },
              ]
            }
          ],
          '/en/components/': [
            {
              text: 'Layout Components',
              items: [
                { text: 'A2Card', link: '/en/components/a2-card' },
                { text: 'A2Row', link: '/en/components/a2-row' },
                { text: 'A2Column', link: '/en/components/a2-column' },
                { text: 'A2List', link: '/en/components/a2-list' },
              ]
            },
            {
              text: 'Form Components',
              items: [
                { text: 'A2TextField', link: '/en/components/a2-text-field' },
                { text: 'A2Input', link: '/en/components/a2-input' },
                { text: 'A2SelectField', link: '/en/components/a2-select-field' },
                { text: 'A2DatePicker', link: '/en/components/a2-date-picker' },
                { text: 'A2DateTimeInput', link: '/en/components/a2-date-time-input' },
              ]
            },
            {
              text: 'Display Components',
              items: [
                { text: 'A2Text', link: '/en/components/a2-text' },
                { text: 'A2Icon', link: '/en/components/a2-icon' },
              ]
            },
            {
              text: 'Action Components',
              items: [
                { text: 'A2Button', link: '/en/components/a2-button' },
              ]
            }
          ]
        },
        footer: {
          message: 'A2UI Documentation',
          copyright: 'Copyright © 2026 A2UI Team'
        }
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/chenhui9392/a2ui-vue-engine' }
    ],
  },
})