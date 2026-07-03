# A2UI Runtime · CRUD Demo

完整 CRUD 示例，覆盖 **Search / Table / Pagination / Detail Dialog / Edit Drawer / Delete / Refresh / Reset**，
全部通过 A2UI Runtime 五件套驱动：

```
HttpClient (MockAdapter)
    ↓
DataSourceManager  (workorderList / workorderDetail / workorderDelete)
    ↓
PageRuntime  ← 唯一 dispatch 入口
    ↓
PageState (searchState / tableState / currentRow / dialogState / drawerState)
    ↓
A2Search / A2Table / Dialog / Drawer  ← 只订阅 pageState，不 fetch
```

## 运行

```bash
# 从仓库根目录
pnpm install
pnpm crud            # → http://localhost:3002
```

或从当前包：

```bash
cd examples/crud-demo
pnpm dev
```

## 目录

```
crud-demo/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.ts                       # 入口 + 注册 Element Plus
    ├── App.vue                       # CRUD 主页面（Search + Toolbar + Table + Dialog + Drawer）
    ├── schema.ts                     # 协议驱动的页面 Schema（DataSource + 组件树）
    └── mock/
        ├── workorderStore.ts         # 内存数据源（87 条工单）
        └── workorderMockAdapter.ts   # 基于 MockAdapter 的 5 个 API endpoint
```

## Mock API 端点

| Method | URL                        | 用途 |
| ------ | -------------------------- | ---- |
| GET    | `/api/workorder/list`      | 分页 / 关键字 / 状态 / 优先级 / 排序 |
| GET    | `/api/workorder/detail`    | 单条详情 |
| POST   | `/api/workorder`           | 新建 |
| PUT    | `/api/workorder/:id`       | 编辑 |
| DELETE | `/api/workorder/:id`       | 删除 |

切换到真实后端只需 `HttpClient.setAdapter(new FetchAdapter())`，无需改任何组件 / schema。

## Runtime 契约（demo 验证）

- ✅ **Search 不 fetch**：`A2Search` 通过 `dataSource: DataSource` 桥接 `setFilter / setPage(1)`
- ✅ **Table 不 fetch**：`A2Table` 通过 `page-runtime` 只读 `pageState.tableState.data / loading / pagination / error`
- ✅ **Pagination 走 dispatch**：翻页 / 换页大小 / 排序 → `runtime.dispatch('table.*')`
- ✅ **Row Action 走 dispatch**：查看 / 编辑 / 删除 → `runtime.dispatch('table.rowAction', { name, row, overlayTarget })`
- ✅ **Dialog / Drawer visible 由 pageState 管理**：`dialogState[name].visible / drawerState[name].visible`
- ✅ **currentRow 由 dispatch 写入**：`table.rowAction / dialog.open / drawer.open` 都能写 `currentRow`
- ✅ **HttpClient 唯一网关**：整个 demo 未 `import 'axios' | 'fetch'`
- ✅ **只读投影**：`pageState.tableState.data / loading / total / error` 由 watcher 单向派生自 DataSource

## 相关文档

- [Runtime Design](../../packages/a2ui-docs/docs/architecture/runtime-design.md)
- [Runtime Summary](../../packages/a2ui-docs/docs/architecture/runtime-summary.md)
- [PageState](../../packages/a2ui-docs/docs/architecture/page-state.md)
- [DataSource](../../packages/a2ui-docs/docs/architecture/datasource.md)
- [DataSource Binding](../../packages/a2ui-docs/docs/architecture/datasource-binding.md)
- [DataSource Execution](../../packages/a2ui-docs/docs/architecture/datasource-execution.md)
- [Action System](../../packages/a2ui-docs/docs/architecture/action-system.md)
- [Table Design](../../packages/a2ui-docs/docs/architecture/table-design.md)
- [Dialog Runtime](../../packages/a2ui-docs/docs/architecture/dialog-runtime.md)
- [HttpClient](../../packages/a2ui-docs/docs/architecture/http-client.md)
