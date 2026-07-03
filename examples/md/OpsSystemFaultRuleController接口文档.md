# 系统问题与故障上报规则库表接口文档

## 接口概述

| 属性 | 说明 |
| :--- | :--- |
| **模块** | ops |
| **控制器** | OpsSystemFaultRuleController |
| **基础路径** | `/api/systemFaultRule` |
| **描述** | 系统问题与故障上报规则库表接口 |
| **作者** | harry.bian |
| **日期** | 2026/6/16 |

---

## 接口列表

| API路径 | HTTP方法 | 描述 |
| :--- | :--- | :--- |
| `/api/systemFaultRule/pageList` | POST | 分页查询规则列表 |
| `/api/systemFaultRule/getDetail/{id}` | GET | 根据ID查询详情 |
| `/api/systemFaultRule/addOrUpdate` | POST | 保存或更新规则 |

---

## 接口详情

### 1. 分页查询规则列表

**接口路径**: `POST /api/systemFaultRule/pageList`

**描述**: 分页查询系统问题与故障上报规则列表

**请求体**:

```json
{
  "pageNum": 1,
  "pageSize": 10,
  "ruleNo": "string",
  "ruleType": "string",
  "applicableDepartments": "string",
  "faultLevel": "string",
  "productName": "string",
  "productNameCode": "string",
  "productModule": "string",
  "productModuleCode": "string",
  "status": "string",
  "submitterName": "string",
  "submitterAccount": "string",
  "validDate": "2026-06-16T10:00:00"
}
```

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `pageNum` | Integer | 页码（继承自PageRequest） |
| `pageSize` | Integer | 每页数量（继承自PageRequest） |
| `ruleNo` | String | 规则编号 |
| `ruleType` | String | 规则类型 |
| `applicableDepartments` | String | 适用部门 |
| `faultLevel` | String | 故障等级 |
| `productName` | String | 产品名称 |
| `productNameCode` | String | 产品名称编码 |
| `productModule` | String | 产品模块 |
| `productModuleCode` | String | 产品模块编码 |
| `status` | String | 状态 |
| `submitterName` | String | 创建人名称 |
| `submitterAccount` | String | 创建人域账号 |
| `validDate` | LocalDateTime | 生效日期 |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "id": 1,
        "ruleNo": "RULE001",
        "ruleType": "type1",
        "applicableDepartments": "部门A",
        "faultLevel": "P1",
        "ruleDescription": "规则描述",
        "reportingPeriod": "24小时",
        "productName": "产品A",
        "productNameCode": "PROD_A",
        "productModule": "模块A",
        "productModuleCode": "MOD_A",
        "status": "active",
        "validDate": "2026-06-16T10:00:00",
        "submitterName": "张三",
        "submitterAccount": "zhangsan",
        "version": 1,
        "createTime": "2026-06-16T09:00:00",
        "updateTime": "2026-06-16T09:00:00",
        "createBy": "zhangsan",
        "updateBy": "zhangsan"
      }
    ],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `code` | Integer | 状态码 |
| `message` | String | 消息 |
| `data.records` | Array\<OpsSystemFaultRuleVo\> | 规则列表 |
| `data.total` | Long | 总记录数 |
| `data.size` | Integer | 每页数量 |
| `data.current` | Integer | 当前页码 |
| `data.pages` | Integer | 总页数 |

---

### 2. 根据ID查询详情

**接口路径**: `GET /api/systemFaultRule/getDetail/{id}`

**描述**: 根据ID查询系统问题与故障上报规则详情

**路径参数**:

| 参数 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | Long | 主键ID |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "ruleNo": "RULE001",
    "ruleType": "type1",
    "applicableDepartments": "部门A",
    "faultLevel": "P1",
    "ruleDescription": "规则描述",
    "reportingPeriod": "24小时",
    "productName": "产品A",
    "productNameCode": "PROD_A",
    "productModule": "模块A",
    "productModuleCode": "MOD_A",
    "status": "active",
    "validDate": "2026-06-16T10:00:00",
    "submitterName": "张三",
    "submitterAccount": "zhangsan",
    "version": 1,
    "createTime": "2026-06-16T09:00:00",
    "updateTime": "2026-06-16T09:00:00",
    "createBy": "zhangsan",
    "updateBy": "zhangsan"
  }
}
```

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `code` | Integer | 状态码 |
| `message` | String | 消息 |
| `data.id` | Long | 主键ID |
| `data.ruleNo` | String | 规则编号 |
| `data.ruleType` | String | 规则类型 |
| `data.applicableDepartments` | String | 适用部门 |
| `data.faultLevel` | String | 故障等级 |
| `data.ruleDescription` | String | 规则描述 |
| `data.reportingPeriod` | String | 上报时效 |
| `data.productName` | String | 产品名称 |
| `data.productNameCode` | String | 产品名称编码 |
| `data.productModule` | String | 产品模块 |
| `data.productModuleCode` | String | 产品模块编码 |
| `data.status` | String | 状态 |
| `data.validDate` | LocalDateTime | 生效日期 |
| `data.submitterName` | String | 创建人名称 |
| `data.submitterAccount` | String | 创建人域账号 |
| `data.version` | Integer | 版本号 |
| `data.createTime` | LocalDateTime | 创建时间 |
| `data.updateTime` | LocalDateTime | 更新时间 |
| `data.createBy` | String | 创建人 |
| `data.updateBy` | String | 更新人 |

---

### 3. 保存或更新规则

**接口路径**: `POST /api/systemFaultRule/addOrUpdate`

**描述**: 保存或更新系统问题与故障上报规则

**请求体**:

```json
{
  "id": null,
  "ruleNo": "RULE001",
  "ruleType": "type1",
  "applicableDepartments": "部门A",
  "faultLevel": "P1",
  "ruleDescription": "规则描述",
  "reportingPeriod": "24小时",
  "productName": "产品A",
  "productNameCode": "PROD_A",
  "productModule": "模块A",
  "productModuleCode": "MOD_A",
  "status": "active",
  "validDate": "2026-06-16T10:00:00",
  "submitterName": "张三",
  "submitterAccount": "zhangsan",
  "version": 1
}
```

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | Long | 主键ID（新增时为null，更新时必填） |
| `ruleNo` | String | 规则编号 |
| `ruleType` | String | 规则类型 |
| `applicableDepartments` | String | 适用部门 |
| `faultLevel` | String | 故障等级 |
| `ruleDescription` | String | 规则描述 |
| `reportingPeriod` | String | 上报时效 |
| `productName` | String | 产品名称 |
| `productNameCode` | String | 产品名称编码 |
| `productModule` | String | 产品模块 |
| `productModuleCode` | String | 产品模块编码 |
| `status` | String | 状态 |
| `validDate` | LocalDateTime | 生效日期 |
| `submitterName` | String | 创建人名称 |
| `submitterAccount` | String | 创建人域账号 |
| `version` | Integer | 版本号 |

**成功响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "ruleNo": "RULE001",
    "ruleType": "type1",
    "applicableDepartments": "部门A",
    "faultLevel": "P1",
    "ruleDescription": "规则描述",
    "reportingPeriod": "24小时",
    "productName": "产品A",
    "productNameCode": "PROD_A",
    "productModule": "模块A",
    "productModuleCode": "MOD_A",
    "status": "active",
    "validDate": "2026-06-16T10:00:00",
    "submitterName": "张三",
    "submitterAccount": "zhangsan",
    "version": 1,
    "createTime": "2026-06-16T09:00:00",
    "updateTime": "2026-06-16T09:00:00",
    "createBy": "zhangsan",
    "updateBy": "zhangsan"
  }
}
```

---

## 数据模型

### OpsSystemFaultRule（实体类）

| 字段 | 类型 | 数据库字段 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | Long | id | 主键ID（自增） |
| `ruleNo` | String | rule_no | 规则编号 |
| `ruleType` | String | rule_type | 规则类型 |
| `applicableDepartments` | String | applicable_departments | 适用部门 |
| `faultLevel` | String | fault_level | 故障等级 |
| `ruleDescription` | String | rule_description | 规则描述 |
| `reportingPeriod` | String | reporting_period | 上报时效 |
| `productName` | String | product_name | 产品名称 |
| `productNameCode` | String | product_name_code | 产品名称编码 |
| `productModule` | String | product_module | 产品模块 |
| `productModuleCode` | String | product_module_code | 产品模块编码 |
| `status` | String | status | 状态 |
| `validDate` | LocalDateTime | valid_date | 生效日期 |
| `submitterName` | String | submitter_name | 创建人名称 |
| `submitterAccount` | String | submitter_account | 创建人域账号 |
| `version` | Integer | version | 版本号（乐观锁） |

### OpsSystemFaultRuleDto（请求DTO）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | Long | 主键ID |
| `ruleNo` | String | 规则编号 |
| `ruleType` | String | 规则类型 |
| `applicableDepartments` | String | 适用部门 |
| `faultLevel` | String | 故障等级 |
| `ruleDescription` | String | 规则描述 |
| `reportingPeriod` | String | 上报时效 |
| `productName` | String | 产品名称 |
| `productNameCode` | String | 产品名称编码 |
| `productModule` | String | 产品模块 |
| `productModuleCode` | String | 产品模块编码 |
| `status` | String | 状态 |
| `validDate` | LocalDateTime | 生效日期 |
| `submitterName` | String | 创建人名称 |
| `submitterAccount` | String | 创建人域账号 |
| `version` | Integer | 版本号 |

### OpsSystemFaultRuleVo（响应VO）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | Long | 主键ID |
| `ruleNo` | String | 规则编号 |
| `ruleType` | String | 规则类型 |
| `applicableDepartments` | String | 适用部门 |
| `faultLevel` | String | 故障等级 |
| `ruleDescription` | String | 规则描述 |
| `reportingPeriod` | String | 上报时效 |
| `productName` | String | 产品名称 |
| `productNameCode` | String | 产品名称编码 |
| `productModule` | String | 产品模块 |
| `productModuleCode` | String | 产品模块编码 |
| `status` | String | 状态 |
| `validDate` | LocalDateTime | 生效日期 |
| `submitterName` | String | 创建人名称 |
| `submitterAccount` | String | 创建人域账号 |
| `version` | Integer | 版本号 |

### OpsSystemFaultRuleQuery（查询条件）

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `ruleNo` | String | 规则编号 |
| `ruleType` | String | 规则类型 |
| `applicableDepartments` | String | 适用部门 |
| `faultLevel` | String | 故障等级 |
| `productName` | String | 产品名称 |
| `productNameCode` | String | 产品名称编码 |
| `productModule` | String | 产品模块 |
| `productModuleCode` | String | 产品模块编码 |
| `status` | String | 状态 |
| `submitterName` | String | 创建人名称 |
| `submitterAccount` | String | 创建人域账号 |
| `validDate` | LocalDateTime | 生效日期 |

---

## 错误响应格式

```json
{
  "code": 500,
  "message": "error message",
  "data": null
}
```

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `code` | Integer | 错误码 |
| `message` | String | 错误信息 |
| `data` | null | 数据（错误时为null） |

---

## 使用示例

### 分页查询

```bash
curl -X POST http://localhost:8080/api/systemFaultRule/pageList \
  -H "Content-Type: application/json" \
  -d '{
    "pageNum": 1,
    "pageSize": 10,
    "status": "active"
  }'
```

### 查询详情

```bash
curl -X GET http://localhost:8080/api/systemFaultRule/getDetail/1
```

### 新增规则

```bash
curl -X POST http://localhost:8080/api/systemFaultRule/addOrUpdate \
  -H "Content-Type: application/json" \
  -d '{
    "ruleNo": "RULE001",
    "ruleType": "type1",
    "applicableDepartments": "部门A",
    "faultLevel": "P1",
    "ruleDescription": "规则描述",
    "reportingPeriod": "24小时",
    "productName": "产品A",
    "productNameCode": "PROD_A",
    "productModule": "模块A",
    "productModuleCode": "MOD_A",
    "status": "active",
    "validDate": "2026-06-16T10:00:00",
    "submitterName": "张三",
    "submitterAccount": "zhangsan"
  }'
```

### 更新规则

```bash
curl -X POST http://localhost:8080/api/systemFaultRule/addOrUpdate \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "ruleNo": "RULE001",
    "ruleType": "type1",
    "applicableDepartments": "部门B",
    "faultLevel": "P1",
    "ruleDescription": "更新后的规则描述",
    "reportingPeriod": "24小时",
    "productName": "产品A",
    "productNameCode": "PROD_A",
    "productModule": "模块A",
    "productModuleCode": "MOD_A",
    "status": "active",
    "validDate": "2026-06-16T10:00:00",
    "submitterName": "张三",
    "submitterAccount": "zhangsan",
    "version": 1
  }'
```