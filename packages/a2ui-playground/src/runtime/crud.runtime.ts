/*
 * @Author: hui.chenn
 * @Description: CRUD Runtime Setup - 基础设施配置 + createRuntime 调用
 *
 *   baseURL / auth / env 属于 HttpClient 基础设施，不属于 Schema
 *   由 Playground 在此注入 createRuntime options
 *   这里是 Playground 中唯一允许出现 http / token / baseURL 的地方
 * @Date: 2026-07-06 10:00:00
 */
import { createRuntime } from 'a2ui-vue-engine'
import type { A2UIRuntime } from 'a2ui-vue-engine'
import { schema } from '../schema/crud/page.schema'

export const crudRuntime: A2UIRuntime = createRuntime({
  schema,
  baseURL: '/hinton-agent-mario-server/api',
  apiContext: { env: 'dev', project: 'systemFaultRule' },
  auth: {
    cacheKey: 'hinton:__gauss_user',
    tokenPath: 'loginInfo.accessToken',
    headerName: 'authorization',
    scheme: 'Bearer',
  },
})
