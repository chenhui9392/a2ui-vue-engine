/*
 * @Author: hui.chenn
 * @Description: CRUD Page Schema - 纯页面描述，只做组合
 *
 *   只描述页面：page / apis / datasources / state / actions / components
 *   不含：Component Registry / Builder 定义 / config(baseURL/auth) / handler / ctx / http
 * @Date: 2026-07-06 10:00:00
 */
import type { PageSchema } from 'a2ui-vue-engine'
import { apis } from './apis'
import { datasources } from './datasources'
import { state } from './state'
import { actions } from './actions'
import { components } from './components'

export const schema: PageSchema = {
  page: {
    id: 'systemFaultRulePage',
    title: '系统问题与故障上报规则库',
    project: 'systemFaultRule',
    version: '1.1',
  },

  apis,
  datasources,
  state,
  actions,
  components,
}
