/*
 * @Author: hui.chenn
 * @Description: Schema · DataSources - 数据源声明
 *
 *   只引用 apiKey（不写 url），由 ApiResolver 动态解析
 *   list 类型（pagination 启用）由 Runtime 自动注册 DSM + listTransport
 * @Date: 2026-07-06 10:00:00
 */
export const datasources = {
  list: {
    apiKey: 'systemFaultRule.list',
    responseMap: { list: 'data.records', total: 'data.total' },
    pagination: { enabled: true, pageSize: 10 },
    debounce: 300,
    auto: true,
  },
  detail: { apiKey: 'systemFaultRule.detail' },
  save:   { apiKey: 'systemFaultRule.save' },
} as const
