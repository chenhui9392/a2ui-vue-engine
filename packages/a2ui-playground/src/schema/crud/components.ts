/*
 * @Author: hui.chenn
 * @Description: Schema · Components - 组件树声明（CRUD 页面）
 *
 *   纯声明式：namespace + events + bindings
 *   - 行内按钮用 events: { click: 'view' }（Runtime 自动携带 row）
 *   - Drawer/Dialog visible 由 bindings.path 绑定 ui.*
 *   - content children 引用 builders/ 输出的静态字段数组
 * @Date: 2026-07-06 10:00:00
 */
import { makeFormFields } from './builders/form.builder'
import { detailFields } from './builders/detail.builder'

export const components = {
  root: {
    component: 'container.list',
    children: ['pageSearch', 'pageToolbar', 'pageTable', 'detailDrawer', 'editDrawer', 'createDialog'],
  },

  pageSearch: {
    component: 'input.search',
    props: {
      labelWidth: '80px',
      config: {
        fields: [
          { id: 'ruleNo', label: '规则编号', type: 'text', placeholder: '请输入', span: 6 },
          { id: 'ruleType', label: '规则类型', type: 'text', placeholder: '请输入', span: 6 },
          { id: 'faultLevel', label: '故障等级', type: 'select', span: 6, options: [{ label: 'P1', value: 'P1' }, { label: 'P2', value: 'P2' }, { label: 'P3', value: 'P3' }] },
          { id: 'status', label: '状态', type: 'select', span: 6, options: [{ label: '有效', value: 'active' }, { label: '失效', value: 'inactive' }] },
          { id: 'productName', label: '产品名称', type: 'text', placeholder: '请输入', span: 6 },
          { id: 'productModule', label: '产品模块', type: 'text', placeholder: '请输入', span: 6 },
          { id: 'submitterName', label: '创建人', type: 'text', placeholder: '请输入', span: 6 },
        ],
        submitText: '搜索',
        resetText: '重置',
      },
    },
  },

  pageToolbar: {
    component: 'action.toolbar',
    props: {
      bordered: false,
      buttons: [
        { id: 'createBtn', type: 'a2-button', props: { text: '新建规则', type: 'primary' }, events: { click: 'create' } },
      ],
      rightButtons: [
        { id: 'refresh', type: 'a2-button', props: { text: '刷新', variant: 'text', color: '#2260FA' }, events: { click: 'refresh' } },
      ],
    },
  },

  pageTable: {
    component: 'display.table',
    props: {
      rowKey: 'id', border: true, stripe: true, height: 480,
      columns: [
        { id: 'c1', field: 'ruleNo', title: '规则编号', width: 140 },
        { id: 'c2', field: 'ruleType', title: '规则类型', width: 120 },
        { id: 'c3', field: 'faultLevel', title: '故障等级', width: 100 },
        { id: 'c4', field: 'applicableDepartments', title: '适用部门', width: 140 },
        { id: 'c5', field: 'productName', title: '产品名称', width: 140 },
        { id: 'c6', field: 'productModule', title: '产品模块', width: 140 },
        { id: 'c7', field: 'status', title: '状态', width: 90 },
        { id: 'c8', field: 'validDate', title: '生效日期', width: 170 },
        { id: 'c9', field: 'submitterName', title: '创建人', width: 110 },
        {
          id: 'c-actions', title: '操作', width: 170, fixed: 'right', align: 'center',
          cellRender: {
            id: 'actionRow', type: 'a2-row', props: { justify: 'center', gap: 4, wrap: false },
            children: [
              { id: 'viewBtn', type: 'a2-button', props: { text: '查看', variant: 'text', color: '#2260FA' }, events: { click: 'view' } },
              { id: 'editBtn', type: 'a2-button', props: { text: '编辑', variant: 'text', color: '#2260FA' }, events: { click: 'edit' } },
            ],
          },
        },
      ],
    },
  },

  detailDrawer: {
    component: 'container.drawer',
    bindings: { visible: { type: 'path', value: 'ui.detailVisible' } },
    props: {
      config: {
        title: '规则详情', size: 'md', placement: 'right',
        content: { id: 'detailBody', type: 'a2-column', props: { gap: 12 }, children: detailFields },
        footer: [{ id: 'close', type: 'a2-button', props: { text: '关闭' }, events: { click: 'closeDetail' } }],
      },
    },
  },

  editDrawer: {
    component: 'container.drawer',
    bindings: { visible: { type: 'path', value: 'ui.editorVisible' } },
    props: {
      config: {
        title: '编辑规则', size: 'md', placement: 'right',
        content: { id: 'editBody', type: 'a2-column', props: { gap: 12 }, children: makeFormFields('e') },
        footer: [
          { id: 'e-cancel', type: 'a2-button', props: { text: '取消' }, events: { click: 'closeEditor' } },
          { id: 'e-submit', type: 'a2-button', props: { text: '保存', type: 'primary' }, events: { click: 'submitEdit' } },
        ],
      },
    },
  },

  createDialog: {
    component: 'container.dialog',
    bindings: { visible: { type: 'path', value: 'ui.creatorVisible' } },
    props: {
      config: {
        title: '新建规则', size: 'md',
        content: { id: 'createBody', type: 'a2-column', props: { gap: 12 }, children: makeFormFields('c') },
        footer: [
          { id: 'c-cancel', type: 'a2-button', props: { text: '取消' }, events: { click: 'closeCreator' } },
          { id: 'c-submit', type: 'a2-button', props: { text: '保存', type: 'primary' }, events: { click: 'submitCreate' } },
        ],
      },
    },
  },
} as const
