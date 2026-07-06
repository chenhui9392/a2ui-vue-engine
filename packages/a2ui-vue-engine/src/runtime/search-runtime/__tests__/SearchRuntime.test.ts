/*
 * @Author: hui.chenn
 * @Description: SearchRuntime 结构测试 - 协议驱动 / Form 桥 / DataSource 桥 / Collapse / Default Search
 * @Date: 2026-07-01 10:00:00
 */
import { SearchRuntime } from '../SearchRuntime'
import type { SearchFormBridge, SearchDataSourceBridge, SearchSubmitPayload } from '../types'

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`[SearchRuntime.test] Assertion failed: ${msg}`)
}

// --- Test Doubles ---------------------------------------------------------
function makeFormBridge(): SearchFormBridge & { store: Record<string, any> } {
  const store: Record<string, any> = {}
  return {
    store,
    read: () => ({ ...store }),
    write: (patch) => Object.assign(store, patch),
    replace: (values) => {
      for (const k of Object.keys(store)) delete store[k]
      Object.assign(store, values)
    },
  }
}

function makeDataSourceBridge() {
  const calls: any[] = []
  return {
    calls,
    bridge: {
      submit: (filter) => calls.push({ op: 'submit', filter }),
      reset: () => calls.push({ op: 'reset' }),
    } as SearchDataSourceBridge,
  }
}

// 1. 默认值应写入 Form
{
  const form = makeFormBridge()
  new SearchRuntime({
    id: 't1',
    config: {
      fields: [
        { id: 'keyword', type: 'text', defaultValue: 'hello' },
        { id: 'status', type: 'select', defaultValue: 'active' },
      ],
    },
    form,
  })
  assert(form.store.keyword === 'hello', 'default value should be written to form')
  assert(form.store.status === 'active', 'default select value should be written')
}

// 2. defaultValues 覆盖 fields[].defaultValue
{
  const rt = new SearchRuntime({
    id: 't2',
    config: {
      fields: [{ id: 'keyword', type: 'text', defaultValue: 'a' }],
      defaultValues: { keyword: 'b' },
    },
  })
  assert(rt.getValues().keyword === 'b', 'defaultValues should override field defaultValue')
}

// 3. setValue -> Form 桥同步
{
  const form = makeFormBridge()
  const rt = new SearchRuntime({
    id: 't3',
    config: { fields: [{ id: 'keyword', type: 'text' }] },
    form,
  })
  rt.setValue('keyword', 'x')
  assert(form.store.keyword === 'x', 'setValue should write to form')
  assert(rt.getValues().keyword === 'x', 'getValues should return latest')
}

// 4. submit -> DataSource 桥调用 + mapValuesToFilter
{
  const ds = makeDataSourceBridge()
  let submitted: SearchSubmitPayload | null = null
  const rt = new SearchRuntime({
    id: 't4',
    config: {
      fields: [
        { id: 'keyword', type: 'text' },
        { id: 'status', type: 'select', filterKey: 'statusCode' },
        { id: 'ignore', type: 'text' }, // 空值将被剔除
      ],
    },
    dataSource: ds.bridge,
    onSubmit: (payload) => (submitted = payload),
  })
  rt.setValue('keyword', 'foo')
  rt.setValue('status', 1)
  rt.submit()
  const submitCall = ds.calls.find(c => c.op === 'submit')
  assert(!!submitCall, 'DataSource.submit should be called')
  assert(submitCall.filter.keyword === 'foo', 'filter should include keyword')
  assert(
    submitCall.filter.statusCode === 1,
    'filter should honor filterKey (status -> statusCode)'
  )
  assert(submitCall.filter.ignore === undefined, 'empty value should be excluded')
  assert(!!submitted && submitted!.values.keyword === 'foo', 'onSubmit callback should fire')
}

// 5. reset -> Form 覆盖 + DataSource.reset
{
  const form = makeFormBridge()
  const ds = makeDataSourceBridge()
  const rt = new SearchRuntime({
    id: 't5',
    config: {
      fields: [
        { id: 'keyword', type: 'text', defaultValue: 'default' },
        { id: 'status', type: 'select' },
      ],
    },
    form,
    dataSource: ds.bridge,
  })
  rt.setValue('keyword', 'x')
  rt.setValue('status', 'active')
  rt.reset()
  assert(form.store.keyword === 'default', 'reset should restore defaults in form')
  assert(form.store.status === undefined, 'reset should clear non-default field')
  assert(ds.calls.some(c => c.op === 'reset'), 'DataSource.reset should be called')
}

// 6. Collapse：超过 threshold 的字段被隐藏
{
  const rt = new SearchRuntime({
    id: 't6',
    config: {
      fields: [
        { id: 'a', type: 'text' },
        { id: 'b', type: 'text' },
        { id: 'c', type: 'text' },
        { id: 'd', type: 'text' },
        { id: 'e', type: 'text' },
      ],
      collapsible: true,
      collapseAfter: 3,
      defaultCollapsed: true,
    },
  })
  assert(rt.visibleFields.value.length === 3, 'collapsed: only 3 fields visible')
  rt.toggleCollapse()
  assert(rt.visibleFields.value.length === 5, 'expanded: all 5 fields visible')
}

// 7. field.collapsible=false 强制显示
{
  const rt = new SearchRuntime({
    id: 't7',
    config: {
      fields: [
        { id: 'a', type: 'text' },
        { id: 'b', type: 'text' },
        { id: 'c', type: 'text' },
        { id: 'always', type: 'text', collapsible: false },
      ],
      collapsible: true,
      collapseAfter: 2,
      defaultCollapsed: true,
    },
  })
  const ids = rt.visibleFields.value.map(f => f.id)
  assert(ids.includes('always'), 'field with collapsible=false should always be visible')
}

// 8. Default Search：初始化时自动 submit
{
  const ds = makeDataSourceBridge()
  let submitted = false
  new SearchRuntime({
    id: 't8',
    config: {
      fields: [{ id: 'k', type: 'text', defaultValue: 'kw' }],
      defaultSearch: true,
    },
    dataSource: ds.bridge,
    onSubmit: () => (submitted = true),
  })
  assert(submitted, 'defaultSearch=true should trigger submit')
  const submitCall = ds.calls.find(c => c.op === 'submit')
  assert(submitCall?.filter?.k === 'kw', 'default search filter should include default value')
}

// eslint-disable-next-line no-console
console.log('[SearchRuntime.test] All structural assertions passed.')

export {}
