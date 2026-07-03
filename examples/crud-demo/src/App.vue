<!--
 * @Author: hui.chenn
 * @Description: A2UI CRUD Demo · 主页面 —— 系统问题与故障上报规则库表
 *
 *   演示全链路：
 *   Search → PageRuntime → DataSource → HttpClient(代理至远端) → PageState → Table
 *
 *   端点（OpsSystemFaultRuleController）：
 *   - POST /api/systemFaultRule/pageList       分页 + 条件查询
 *   - GET  /api/systemFaultRule/getDetail/{id}  详情
 *   - POST /api/systemFaultRule/addOrUpdate     新建 / 更新
 *
 *   注：接口文档未提供删除端点，故本 demo 不再提供删除入口。
 * @Date: 2026-07-02 10:00:00
-->
<template>
  <div class="crud-demo">
    <header class="crud-demo__header">
      <h1>A2UI Runtime · 系统问题与故障上报规则库</h1>
      <p class="crud-demo__subtitle">
        Search → PageRuntime → DataSource → HttpClient → PageState → Table
      </p>
    </header>

    <!-- Search（协议驱动） -->
    <A2Search
      :config="searchConfig"
      :data-source="dsList"
      @submit="onSearchSubmit"
      @reset="onSearchReset"
    />

    <!-- Toolbar -->
    <div class="crud-demo__toolbar">
      <el-button type="primary" @click="openCreate">新建</el-button>
      <el-button @click="onRefresh">刷新</el-button>
      <span class="crud-demo__hint">
        当前 pageState.tableState.pagination.total = {{ runtime.state.tableState.pagination.total }}
      </span>
    </div>

    <!-- Table（协议驱动 · 只读 pageState） -->
    <A2Table
      :columns="tableColumns"
      :page-runtime="runtime"
      data-source-id="ruleList"
    >
      <template #cell-c2="{ row }">
        <el-tag :type="statusTag(row.status)" size="small">{{ mapStatus(row.status) }}</el-tag>
      </template>
      <template #cell-c3="{ row }">
        <el-tag :type="faultLevelTag(row.faultLevel)" size="small" effect="plain">
          {{ row.faultLevel }}
        </el-tag>
      </template>
      <template #cell-c-actions="{ row }">
        <el-button size="small" @click="onView(row)">查看</el-button>
        <el-button size="small" type="primary" @click="onEdit(row)">编辑</el-button>
      </template>
    </A2Table>

    <!-- 详情 Dialog -->
    <el-dialog
      v-model="detailVisible"
      title="规则详情"
      width="620px"
      @closed="onDetailClosed"
    >
      <div v-if="detailLoading" class="crud-demo__loading">加载中...</div>
      <div v-else-if="detailRow" class="crud-demo__detail">
        <div><span>规则编号：</span>{{ detailRow.ruleNo }}</div>
        <div><span>规则类型：</span>{{ detailRow.ruleType }}</div>
        <div><span>适用部门：</span>{{ detailRow.applicableDepartments }}</div>
        <div><span>故障等级：</span>{{ detailRow.faultLevel }}</div>
        <div><span>状态：</span>{{ mapStatus(detailRow.status) }}</div>
        <div><span>上报时效：</span>{{ detailRow.reportingPeriod }}</div>
        <div><span>产品名称：</span>{{ detailRow.productName }}（{{ detailRow.productNameCode }}）</div>
        <div><span>产品模块：</span>{{ detailRow.productModule }}（{{ detailRow.productModuleCode }}）</div>
        <div><span>规则描述：</span>{{ detailRow.ruleDescription }}</div>
        <div><span>生效日期：</span>{{ detailRow.validDate }}</div>
        <div><span>创建人：</span>{{ detailRow.submitterName }}（{{ detailRow.submitterAccount }}）</div>
        <div><span>版本号：</span>{{ detailRow.version }}</div>
      </div>
      <template #footer>
        <el-button @click="closeDetail">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 编辑 Drawer -->
    <el-drawer
      v-model="editVisible"
      title="编辑规则"
      size="480px"
      :destroy-on-close="true"
      @closed="onEditClosed"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="规则编号">
          <el-input v-model="editForm.ruleNo" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-input v-model="editForm.ruleType" />
        </el-form-item>
        <el-form-item label="适用部门">
          <el-input v-model="editForm.applicableDepartments" />
        </el-form-item>
        <el-form-item label="故障等级">
          <el-select v-model="editForm.faultLevel">
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status">
            <el-option label="有效" value="active" />
            <el-option label="失效" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="上报时效">
          <el-input v-model="editForm.reportingPeriod" placeholder="如：24小时" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="editForm.productName" />
        </el-form-item>
        <el-form-item label="产品名称编码">
          <el-input v-model="editForm.productNameCode" />
        </el-form-item>
        <el-form-item label="产品模块">
          <el-input v-model="editForm.productModule" />
        </el-form-item>
        <el-form-item label="产品模块编码">
          <el-input v-model="editForm.productModuleCode" />
        </el-form-item>
        <el-form-item label="规则描述">
          <el-input v-model="editForm.ruleDescription" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="生效日期">
          <el-date-picker
            v-model="editForm.validDate"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="选择生效日期"
            class="crud-demo__full"
          />
        </el-form-item>
        <el-form-item label="创建人名称">
          <el-input v-model="editForm.submitterName" />
        </el-form-item>
        <el-form-item label="创建人域账号">
          <el-input v-model="editForm.submitterAccount" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeEdit">取消</el-button>
        <el-button type="primary" :loading="editSaving" @click="submitEdit">保存</el-button>
      </template>
    </el-drawer>

    <!-- 新建 Dialog -->
    <el-dialog v-model="createVisible" title="新建规则" width="620px" :destroy-on-close="true">
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="规则编号">
          <el-input v-model="createForm.ruleNo" placeholder="请输入规则编号" />
        </el-form-item>
        <el-form-item label="规则类型">
          <el-input v-model="createForm.ruleType" />
        </el-form-item>
        <el-form-item label="适用部门">
          <el-input v-model="createForm.applicableDepartments" />
        </el-form-item>
        <el-form-item label="故障等级">
          <el-select v-model="createForm.faultLevel">
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="createForm.status">
            <el-option label="有效" value="active" />
            <el-option label="失效" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="上报时效">
          <el-input v-model="createForm.reportingPeriod" placeholder="如：24小时" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="createForm.productName" />
        </el-form-item>
        <el-form-item label="产品名称编码">
          <el-input v-model="createForm.productNameCode" />
        </el-form-item>
        <el-form-item label="产品模块">
          <el-input v-model="createForm.productModule" />
        </el-form-item>
        <el-form-item label="产品模块编码">
          <el-input v-model="createForm.productModuleCode" />
        </el-form-item>
        <el-form-item label="规则描述">
          <el-input v-model="createForm.ruleDescription" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="生效日期">
          <el-date-picker
            v-model="createForm.validDate"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="选择生效日期"
            class="crud-demo__full"
          />
        </el-form-item>
        <el-form-item label="创建人名称">
          <el-input v-model="createForm.submitterName" />
        </el-form-item>
        <el-form-item label="创建人域账号">
          <el-input v-model="createForm.submitterAccount" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeCreate">取消</el-button>
        <el-button type="primary" :loading="createSaving" @click="submitCreate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import {
  HttpClient,
  DataSourceManager,
  PageRuntime,
  A2Search,
  A2Table,
} from 'a2ui-vue-engine'
import type {
  SearchRuntimeConfig,
  SearchSubmitPayload,
  DataSourceTransport,
} from 'a2ui-vue-engine'
import { crudSchema } from './schema'

/** 系统问题与故障上报规则 实体（对齐 OpsSystemFaultRuleVo） */
interface SystemFaultRule {
  id?: number | null
  ruleNo?: string
  ruleType?: string
  applicableDepartments?: string
  faultLevel?: string
  ruleDescription?: string
  reportingPeriod?: string
  productName?: string
  productNameCode?: string
  productModule?: string
  productModuleCode?: string
  status?: string
  validDate?: string
  submitterName?: string
  submitterAccount?: string
  version?: number
  createTime?: string
  updateTime?: string
  createBy?: string
  updateBy?: string
}

// ---------------------------------------------------------------------------
// 1. HttpClient（baseURL `/hinton-agent-mario-server/api` 由 vite proxy 代理至远端）
//    远端网关需要鉴权，token 从 localStorage 缓存读取：
//    key = hinton:__gauss_user → loginInfo.accessToken
// ---------------------------------------------------------------------------
const AUTH_CACHE_KEY = 'hinton:__gauss_user'

let __authMissingWarned = false

function getAccessTokenFromCache(): string {
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY)
    if (!raw) {
      if (!__authMissingWarned) {
        __authMissingWarned = true
        console.warn(
          `[auth] 未在 localStorage 找到 key="${AUTH_CACHE_KEY}"，authorization 头将被省略。\n` +
          `注意：localStorage 按源隔离，本 demo 运行在 ${location.origin}，` +
          `与真实 Tineco 站点不同源，无法读取其登录缓存。\n` +
          `本地联调可在当前页面控制台执行：\n` +
          `  localStorage.setItem('${AUTH_CACHE_KEY}', JSON.stringify({loginInfo:{accessToken:'YOUR_TOKEN'}}))`
        )
      }
      return ''
    }
    const parsed = JSON.parse(raw)
    const token = parsed?.loginInfo?.accessToken || ''
    if (!token && !__authMissingWarned) {
      __authMissingWarned = true
      console.warn(
        `[auth] localStorage["${AUTH_CACHE_KEY}"] 存在但未找到 loginInfo.accessToken，` +
        `实际结构为：`, parsed
      )
    }
    return token
  } catch (e) {
    if (!__authMissingWarned) {
      __authMissingWarned = true
      console.warn(`[auth] 解析 localStorage["${AUTH_CACHE_KEY}"] 失败：`, e)
    }
    return ''
  }
}

const http = new HttpClient({
  baseURL: '/hinton-agent-mario-server/api',
  auth: {
    // 每次请求读取最新 token；为空则不注入 authorization
    getToken: () => getAccessTokenFromCache(),
    headerName: 'authorization',
    scheme: 'Bearer',
  },
})

// ---------------------------------------------------------------------------
// 2. 自定义 Transport：把 DataSource runtimeParams 映射为后端 POST body
//    { page, pageSize } → { pageNo, pageSize, ...filter }
// ---------------------------------------------------------------------------
const ruleListTransport: DataSourceTransport = async (request, runtimeParams, signal) => {
  const body = {
    pageNo: runtimeParams.page ?? 1,
    pageSize: runtimeParams.pageSize ?? 10,
    ...(runtimeParams.filter || {}),
  }
  const res = await http.request({
    url: request.url as string,
    method: request.method || 'POST',
    body,
    signal,
  })
  // 返回完整响应体，由 DataSource.responseMap 映射 data.records / data.total
  return res.data
}

// ---------------------------------------------------------------------------
// 3. DataSourceManager · 从 schema.dataSources 注册
// ---------------------------------------------------------------------------
const dsm = new DataSourceManager({ transport: ruleListTransport })
dsm.register(crudSchema.dataSources as any)

// ---------------------------------------------------------------------------
// 4. PageRuntime · 唯一司机
// ---------------------------------------------------------------------------
const runtime = shallowRef(new PageRuntime(dsm, {
  pageId: 'systemFaultRulePage',
  defaultDataSourceId: 'ruleList',
}))

// 便利句柄
const dsList = dsm.get('ruleList')!

// ---------------------------------------------------------------------------
// 5. 首屏拉取
// ---------------------------------------------------------------------------
onMounted(async () => {
  await dsm.initAll()
})

// ---------------------------------------------------------------------------
// 6. Search 事件桥接
//    A2Search 传入 :data-source="dsList"：submit/reset 时自动调 DataSource.setFilter
//    这里只捕获事件用于日志/视觉反馈
// ---------------------------------------------------------------------------
const searchConfig: SearchRuntimeConfig = crudSchema.child[0].props as SearchRuntimeConfig

function onSearchSubmit(_payload: SearchSubmitPayload) {
  // 声明式：DataSource.setFilter 已由 A2Search 触发
}

function onSearchReset() {
  // 声明式：DataSource.setFilter({}) 已由 A2Search 触发
}

async function onRefresh() {
  await runtime.value.dispatch('page.refresh', { target: 'ruleList' })
}

// ---------------------------------------------------------------------------
// 7. Table 列
// ---------------------------------------------------------------------------
const tableColumns = crudSchema.child[2].props.columns as any[]

function mapStatus(v?: string) {
  return ({ active: '有效', inactive: '失效' } as Record<string, string>)[v || ''] || v || '-'
}
function statusTag(v?: string) {
  return ({ active: 'success', inactive: 'info' } as Record<string, string>)[v || ''] || ''
}
function faultLevelTag(v?: string) {
  return ({ P1: 'danger', P2: 'warning', P3: 'info' } as Record<string, string>)[v || ''] || ''
}

// ---------------------------------------------------------------------------
// 8. Row Action → 详情 Dialog
// ---------------------------------------------------------------------------
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailRow = ref<SystemFaultRule | null>(null)

async function onView(row: SystemFaultRule) {
  await runtime.value.dispatch('table.rowAction', { name: 'detail', row })
  detailVisible.value = true
  detailLoading.value = true
  detailRow.value = null
  try {
    const res = await http.get<SystemFaultRule>(`/systemFaultRule/getDetail/${row.id}`)
    const body = res.data as any
    if (body && body.code === 200) {
      detailRow.value = body.data as SystemFaultRule
    } else {
      ElMessage.error(body?.message || '查询详情失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '查询详情失败')
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  detailVisible.value = false
}

async function onDetailClosed() {
  await runtime.value.dispatch('dialog.close', { name: 'detail', destroyOnClose: true })
  detailRow.value = null
}

// ---------------------------------------------------------------------------
// 9. 编辑 Drawer
// ---------------------------------------------------------------------------
const editVisible = ref(false)
const editSaving = ref(false)
const editForm = reactive<Partial<SystemFaultRule>>({})

async function onEdit(row: SystemFaultRule) {
  await runtime.value.dispatch('table.rowAction', { name: 'edit', overlayTarget: 'drawer', row })
  // 先拉详情填充表单，确保拿到完整字段
  editVisible.value = true
  try {
    const res = await http.get<SystemFaultRule>(`/systemFaultRule/getDetail/${row.id}`)
    const body = res.data as any
    if (body && body.code === 200) {
      Object.assign(editForm, body.data as SystemFaultRule)
    } else {
      Object.assign(editForm, row)
    }
  } catch {
    Object.assign(editForm, row)
  }
}

function closeEdit() {
  editVisible.value = false
}

async function onEditClosed() {
  await runtime.value.dispatch('drawer.close', { name: 'edit', destroyOnClose: true })
  Object.keys(editForm).forEach(k => delete (editForm as any)[k])
}

async function submitEdit() {
  const id = (runtime.value.state.currentRow as any)?.id ?? editForm.id
  if (!id) {
    ElMessage.warning('缺少规则 id，无法保存')
    return
  }
  editSaving.value = true
  try {
    const res = await http.post('/systemFaultRule/addOrUpdate', { id, ...editForm })
    const body = res.data as any
    if (body && body.code === 200) {
      ElMessage.success('保存成功')
      editVisible.value = false
      await runtime.value.dispatch('page.refresh', { target: 'ruleList' })
    } else {
      ElMessage.error(body?.message || '保存失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    editSaving.value = false
  }
}

// ---------------------------------------------------------------------------
// 10. 新建 Dialog
// ---------------------------------------------------------------------------
const createVisible = ref(false)
const createSaving = ref(false)
const createForm = reactive<Partial<SystemFaultRule>>({
  status: 'active',
  faultLevel: 'P2',
})

async function openCreate() {
  await runtime.value.dispatch('dialog.open', { name: 'create', context: { mode: 'create' } })
  createVisible.value = true
}

function closeCreate() {
  createVisible.value = false
}

async function submitCreate() {
  createSaving.value = true
  try {
    // 新建：id 为 null
    const res = await http.post('/systemFaultRule/addOrUpdate', { id: null, ...createForm })
    const body = res.data as any
    if (body && body.code === 200) {
      ElMessage.success('新建成功')
      createVisible.value = false
      await runtime.value.dispatch('dialog.close', { name: 'create', destroyOnClose: true })
      await runtime.value.dispatch('page.refresh', { target: 'ruleList' })
      Object.keys(createForm).forEach(k => delete (createForm as any)[k])
      Object.assign(createForm, { status: 'active', faultLevel: 'P2' })
    } else {
      ElMessage.error(body?.message || '新建失败')
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '新建失败')
  } finally {
    createSaving.value = false
  }
}
</script>

<style scoped>
.crud-demo {
  max-width: 1280px;
  margin: 24px auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crud-demo__header h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.crud-demo__subtitle {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #909399;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.crud-demo__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
}

.crud-demo__hint {
  margin-left: auto;
  font-size: 12px;
  color: #909399;
}

.crud-demo__loading {
  padding: 16px;
  color: #909399;
  text-align: center;
}

.crud-demo__detail > div {
  padding: 6px 0;
}
.crud-demo__detail > div > span {
  display: inline-block;
  min-width: 96px;
  color: #909399;
}

.crud-demo__full {
  width: 100%;
}
</style>
