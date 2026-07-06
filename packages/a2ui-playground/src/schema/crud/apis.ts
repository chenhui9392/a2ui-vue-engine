/*
 * @Author: hui.chenn
 * @Description: Schema · APIs - 局部 API 定义
 *
 *   schema 内 co-located，由 Runtime 的 ApiResolver 解析
 *   只声明 url / method，不含 baseURL / auth（属于 HttpClient 基础设施）
 * @Date: 2026-07-06 10:00:00
 */
import type { ApiEntryMap } from 'a2ui-vue-engine'

export const apis: ApiEntryMap = {
  'systemFaultRule.list':   { url: '/systemFaultRule/pageList',    method: 'POST' },
  'systemFaultRule.detail': { url: '/systemFaultRule/getDetail',   method: 'GET'  },
  'systemFaultRule.save':   { url: '/systemFaultRule/addOrUpdate', method: 'POST' },
}
