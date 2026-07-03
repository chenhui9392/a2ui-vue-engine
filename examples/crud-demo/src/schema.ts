/*
 * @Author: hui.chenn
 * @Description: CRUD Demo Schema —— 系统问题与故障上报规则库表
 *   对接后端：OpsSystemFaultRuleController
 *   baseURL `/hinton-agent-mario-server/api`（由 vite proxy 代理至 hinton-test-inner.tineco.com）
 *
 *   端点：
 *   - POST /systemFaultRule/pageList     ← 分页 + 条件查询
 *   - GET  /systemFaultRule/getDetail/{id} ← 详情
 *   - POST /systemFaultRule/addOrUpdate   ← 新建 / 更新
 *   （接口文档未提供删除端点，故 demo 不再提供删除入口）
 * @Date: 2026-07-02 10:00:00
 */

export const crudSchema = {
  id: 'systemFaultRulePage',
  type: 'a2-column',
  props: {
    gap: 16,
    padding: 16,
  },

  // -------------------------------------------------------------------------
  // 1. DataSource 声明
  //    ruleList：分页列表，POST body { pageNo, pageSize, ...filter }
  //    响应：{ code, data: { records, total, size, current, pages } }
  // -------------------------------------------------------------------------
  dataSources: {
    ruleList: {
      kind: 'http',
      request: {
        url: '/systemFaultRule/pageList',
        method: 'POST',
        // 后端返回 { code, data: { records, total } } → 映射到 state.data / meta.total
        responseMap: {
          list: 'data.records',
          total: 'data.total',
        },
      },
      pagination: { enabled: true, pageSize: 10 },
      debounce: 300,
      auto: true,
    },
  },

  child: [
    // 2.1 Search --------------------------------------------------------
    {
      id: 'search',
      type: 'a2-search',
      props: {
        showReset: true,
        submitText: '搜索',
        resetText: '重置',
        fields: [
          { id: 'ruleNo', type: 'text', label: '规则编号', placeholder: '请输入', span: 6 },
          { id: 'ruleType', type: 'text', label: '规则类型', placeholder: '请输入', span: 6 },
          {
            id: 'faultLevel',
            type: 'select',
            label: '故障等级',
            placeholder: '全部',
            span: 6,
            options: [
              { label: 'P1', value: 'P1' },
              { label: 'P2', value: 'P2' },
              { label: 'P3', value: 'P3' },
            ],
          },
          {
            id: 'status',
            type: 'select',
            label: '状态',
            placeholder: '全部',
            span: 6,
            options: [
              { label: '有效', value: 'active' },
              { label: '失效', value: 'inactive' },
            ],
          },
          { id: 'productName', type: 'text', label: '产品名称', placeholder: '请输入', span: 6 },
          { id: 'productModule', type: 'text', label: '产品模块', placeholder: '请输入', span: 6 },
          { id: 'submitterName', type: 'text', label: '创建人', placeholder: '请输入', span: 6 },
        ],
      },
    },

    // 2.2 Toolbar -------------------------------------------------------
    {
      id: 'toolbar',
      type: 'a2-toolbar',
      props: {
        justify: 'end',
        gap: 8,
      },
      // 由宿主渲染真实按钮组件（本 demo 用 element-plus 按钮）
    },

    // 2.3 Table ---------------------------------------------------------
    {
      id: 'table',
      type: 'a2-table',
      props: {
        rowKey: 'id',
        border: true,
        stripe: true,
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
            id: 'c-actions',
            title: '操作',
            width: 170,
            fixed: 'right',
          },
        ],
      },
    },
  ],
} as const

export type CrudSchema = typeof crudSchema
