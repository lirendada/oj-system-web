# Liren OJ Web 项目架构文档

> 项目名称：liren-oj-web
> 项目类型：在线判题系统前端
> 技术栈：Vue 3 + TypeScript + Vite + Element Plus

## 一、项目概述

### 1.1 项目基本信息

| 项目信息 | 内容 |
|---------|------|
| 项目名称 | liren-oj-web |
| 项目类型 | 在线判题系统（Online Judge）前端 |
| 开发框架 | Vue 3.5.24 (Composition API) |
| 构建工具 | Vite 7.2.4 |
| UI 组件库 | Element Plus 2.13.1 |
| 状态管理 | Pinia 3.0.4 |
| 路由管理 | Vue Router 4.6.4 |
| HTTP 客户端 | Axios 1.13.2 |
| 代码编辑器 | Monaco Editor 0.55.1 |
| Markdown 解析 | Markdown-it 14.1.0 |
| CSS 预处理器 | Sass 1.97.2 |

### 1.2 项目目录结构

```
liren-oj-web/
├── src/
│   ├── api/              # API 接口层
│   │   ├── problem.ts    # 题目相关接口
│   │   ├── user.ts       # 用户相关接口
│   │   ├── judge.ts      # 判题接口（预留）
│   │   └── contest.ts    # 竞赛相关接口
│   ├── components/       # 公共组件
│   │   ├── CodeEditor/   # 代码编辑器组件
│   │   ├── MdViewer/     # Markdown 查看器组件
│   │   └── GlobalHeader.vue  # 全局导航栏组件
│   ├── layout/           # 布局组件
│   │   └── BasicLayout.vue
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── stores/           # 状态管理
│   │   └── user.ts
│   ├── styles/           # 全局样式
│   │   └── index.scss
│   ├── types/            # TypeScript 类型定义
│   │   └── global.ts     # 全局类型定义
│   ├── utils/            # 工具函数
│   │   └── request.ts    # Axios 封装
│   ├── views/            # 页面组件
│   │   ├── problem/      # 题目相关页面
│   │   │   ├── ProblemList.vue    # 题目列表页（含排行榜）
│   │   │   └── ProblemDetail.vue  # 题目详情页
│   │   ├── contest/      # 竞赛相关页面
│   │   │   ├── ContestList.vue    # 竞赛列表页
│   │   │   └── ContestDetail.vue  # 竞赛详情页
│   │   └── user/         # 用户相关页面
│   │       └── LoginView.vue      # 用户登录页
│   ├── App.vue           # 应用根组件
│   └── main.ts           # 应用入口
├── public/               # 静态资源
├── index.html            # HTML 入口
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript 配置
├── tsconfig.app.json     # TypeScript 应用配置
├── tsconfig.node.json    # TypeScript Node 配置
└── vite.config.ts        # Vite 配置
```

---

## 二、路由配置

### 2.1 路由结构

| 路径 | 组件 | 说明 |
|-----|------|------|
| `/` | BasicLayout | 基础布局（嵌套路由） |
| `` (空路径) | ProblemList | 首页，题目列表 |
| `/problem` | ProblemList | 题目列表页 |
| `/problem/detail/:id` | ProblemDetail | 题目详情页（动态参数） |
| `/contest` | ContestList | 竞赛列表页 |
| `/contest/:id` | ContestDetail | 竞赛详情页（动态参数） |
| `/login` | LoginView | 用户登录页 |

### 2.2 路由特点

- 首页默认显示题目列表
- 使用动态路由参数 `:id` 获取题目/竞赛详情
- 路由元信息（meta）包含页面标题和其他配置
- 嵌套路由设计，支持布局扩展
- 采用懒加载优化性能

### 2.3 路由配置代码

```typescript
// src/router/index.ts
{
  path: '/',
  component: BasicLayout,
  children: [
    {
      path: '',
      name: 'Home',
      component: () => import('@/views/problem/ProblemList.vue')
    },
    {
      path: 'problem',
      name: 'ProblemList',
      component: () => import('@/views/problem/ProblemList.vue')
    },
    {
      path: 'problem/detail/:id',
      name: 'ProblemDetail',
      component: () => import('@/views/problem/ProblemDetail.vue'),
      meta: { hideFooter: true }
    },
    {
      path: 'contest',
      name: 'ContestList',
      component: () => import('@/views/contest/ContestList.vue')
    },
    {
      path: 'contest/:id',
      name: 'ContestDetail',
      component: () => import('@/views/contest/ContestDetail.vue')
    }
  ]
},
{
  path: '/login',
  name: 'Login',
  component: () => import('@/views/user/LoginView.vue')
}
```

---

## 三、页面组件详解

### 3.1 App.vue - 应用根组件

**功能描述：**
- 应用入口组件
- 配置 Element Plus 全局中文语言
- 设置全局样式

**全局样式配置：**
- 字体栈：LeetCode 同款字体（-apple-system, SF Pro Text, Monaco 等）
- 背景色：#f5f7fa
- 文字颜色：#303133
- 自定义滚动条样式

### 3.2 BasicLayout.vue - 基础布局组件

**功能描述：**
- 提供基础布局框架
- 包含路由出口 `<router-view>`
- 为后续扩展提供布局基础

**组件结构：**
```vue
<template>
  <router-view />
</template>
```

### 3.3 ProblemList.vue - 题目列表页

**功能列表：**
1. 分页展示题目列表
2. 关键词搜索（支持标题/内容模糊搜索）
3. 难度筛选（简单/中等/困难）
4. 显示题目ID、标题、标签、难度、通过率
5. 点击题目标题跳转到详情页
6. **排行榜功能**：支持日榜、周榜、月榜、总榜切换
7. **全局导航**：集成导航栏，快速访问各模块
8. **排序功能**：支持难度、通过率等字段排序
9. **全局搜索**：集成全局搜索框，可搜索题目和竞赛

**UI 组件：**
- `el-table`：表格展示
- `el-pagination`：分页组件
- `el-input`：搜索输入框
- `el-select`：难度筛选下拉框
- `el-tag`：难度标签
- `el-tabs`：排行榜 Tab 切换
- `el-avatar`：用户头像
- `el-trophy`：奖杯图标（排行榜）

**数据结构：**
```typescript
// 查询参数
queryParams: {
  current: 1,
  pageSize: 10,
  keyword: '',
  difficulty: undefined,
  sortField?: string,
  sortOrder?: 'ascend' | 'descend'
}

// 响应数据
problemList: {
  records: ProblemVO[],
  total: number,
  size: number,
  current: number,
  pages: number
}

// 排行榜数据
rankList: RankItemVO[]

// 排行榜当前 Tab
activeRankTab: 'day' | 'week' | 'month' | 'total'

// 排行榜类型映射
typeMap: {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  total: 'total'
}
```

**关键方法：**
- `loadData()`：获取题目列表
- `loadRankData()`：获取排行榜数据
- `handleSearch()`：搜索处理
- `handlePageChange()`：分页处理
- `toDetail()`：跳转到详情页
- `getDifficultyColor()`：获取难度对应的标签颜色

**难度标签颜色映射：**
- 简单：success（绿色）
- 中等：warning（橙色）
- 困难：danger（红色）

### 3.4 ProblemDetail.vue - 题目详情页

**功能列表：**
1. 左右分栏布局（splitpanes）
2. 左栏显示题目信息：
   - 题目描述（Markdown 渲染）
   - 输入格式
   - 输出格式
   - 样例输入/输出
   - 提示
   - 时间/空间限制
3. 右栏显示代码编辑器：
   - Monaco Editor 集成
   - 多语言切换（Java/C++/Python）
   - 主题切换（Dark/Light）
   - 字号调整
4. 代码本地缓存功能（localStorage）
5. 提交代码并实时查看判题结果
6. 轮询机制获取判题状态
7. **提交记录**：显示当前题目的历史提交记录（分页展示）

**UI 组件：**
- `splitpanes`：分栏布局
- `CodeEditor`：自定义代码编辑器组件
- `MdViewer`：自定义 Markdown 查看器组件
- `el-select`：语言选择
- `el-button`：提交按钮
- `el-card`：结果展示卡片

**数据结构：**
```typescript
// 题目数据
problemDetail: {
  problemId: string,     // 雪花算法ID
  title: string,
  difficulty: number,
  description: string,
  inputDescription: string,
  outputDescription: string,
  timeLimit: number,
  memoryLimit: number,
  sampleInput: string,
  sampleOutput: string,
  hint: string,
  tags: ProblemTagVO[]
}

// 提交表单
submitForm: {
  problemId: string,     // 雪花算法ID
  language: string,
  code: string
}

// 判题结果
judgeResult: {
  submitId: string,      // 雪花算法ID
  judgeResult: number,
  timeCost: number,
  memoryCost: number,
  errorMessage: string,
  passCaseCount: number,
  totalCaseCount: number
}
```

**关键方法：**
- `fetchProblemDetail()`：获取题目详情
- `loadCachedCode()`：加载缓存的代码
- `saveCodeToCache()`：保存代码到缓存
- `handleLanguageChange()`：切换语言时加载对应代码
- `handleSubmit()`：提交代码
- `startPolling()`：开始轮询判题结果
- `stopPolling()`：停止轮询

**代码缓存策略：**
- 使用 localStorage 存储
- 按题目ID和语言分别缓存
- 切换语言时自动加载对应代码
- 提交后不清除缓存

**轮询机制：**
- 提交后立即开始轮询
- 每 2 秒查询一次判题结果
- 判题完成（status = 30）或失败（status = 40）时停止
- 最大轮询次数限制（防止无限轮询）

### 3.5 LoginView.vue - 用户登录页

**功能列表：**
1. 用户登录表单
2. 表单验证
3. 登录成功后保存 Token 并跳转
4. 使用 Pinia 管理用户状态

**UI 组件：**
- `el-form`：表单容器
- `el-form-item`：表单项
- `el-input`：输入框
- `el-button`：提交按钮

**数据结构：**
```typescript
// 登录表单
loginForm: {
  userAccount: string,
  password: string
}

// 表单验证规则
rules: {
  userAccount: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}
```

**关键方法：**
- `handleLogin()`：处理登录逻辑
- `router.push('/problem')`：登录成功后跳转

### 3.6 ContestList.vue - 竞赛列表页

**功能列表：**
1. 分页展示竞赛列表
2. 关键词搜索（竞赛标题）
3. 状态筛选（未开始/进行中/已结束）
4. 显示竞赛标题、描述、状态、时间、持续时间
5. 竞赛报名功能
6. 点击竞赛跳转到详情页

**UI 组件：**
- `el-card`：竞赛卡片
- `el-pagination`：分页组件
- `el-input`：搜索输入框
- `el-select`：状态筛选下拉框
- `el-tag`：状态标签

**数据结构：**
```typescript
// 查询参数
queryParams: {
  current: number,
  pageSize: number,
  keyword?: string,
  status?: number
}

// 响应数据
contestList: {
  records: ContestVO[],
  total: number,
  size: number,
  current: number,
  pages: number
}
```

**关键方法：**
- `loadData()`：获取竞赛列表
- `handleSearch()`：搜索处理
- `handlePageChange()`：分页处理
- `toDetail()`：跳转到详情页
- `registerContest()`：报名竞赛

### 3.7 ContestDetail.vue - 竞赛详情页

**功能列表：**
1. 显示竞赛详细信息（标题、描述、时间等）
2. 显示竞赛题目列表
3. 显示竞赛排行榜
4. 竞赛报名功能
5. **权限验证**：未报名用户无法查看正在进行的竞赛题目

**UI 组件：**
- `el-card`：信息卡片
- `el-table`：题目列表/排行榜

**数据结构：**
```typescript
// 竞赛详情
contestDetail: ContestVO

// 竞赛题目列表
problemList: ContestProblemVO[]

// 竞赛排行榜
rankList: ContestRankVO[]
```

**关键方法：**
- `loadContestDetail()`：获取竞赛详情
- `loadProblemList()`：获取竞赛题目
- `loadRankList()`：获取竞赛排行榜
- `registerContest()`：报名竞赛

### 3.8 GlobalHeader.vue - 全局导航栏

**功能列表：**
1. 导航菜单（题目、竞赛）
2. 用户登录状态显示
3. 用户头像与昵称展示
4. 退出登录功能
5. 响应式布局
6. **全局搜索框**：支持搜索题目和竞赛，关键字高亮显示

**UI 组件：**
- `el-menu`：导航菜单
- `el-avatar`：用户头像
- `el-dropdown`：下拉菜单

**数据结构：**
```typescript
// 用户状态
isLogin: boolean
userInfo: UserLoginVO | null
```

**关键方法：**
- `handleLogout()`：退出登录
- `navigateTo()`：路由跳转

---

## 四、API 接口层

### 4.1 request.ts - Axios 封装

**功能描述：**
- 基于 Axios 创建 HTTP 请求实例
- 配置请求/响应拦截器
- 统一错误处理
- Token 认证机制

**⚠️ 重要：响应数据访问规范**

响应拦截器返回完整的响应对象 `{ code, message, data }`，**不是**直接返回 data。

**错误示范：**
```typescript
// ❌ 错误：直接访问 res
const res = await getProblemList()
data.value = res.records  // res 不是数组！
```

**正确示范：**
```typescript
// ✅ 正确：访问 res.data
const res = await getProblemList()
const data = res?.data
data.value = data?.records || []
```

**安全模式模板：**
```typescript
const loadData = async () => {
  loading.value = true
  try {
    const res = await apiCall()
    const data = res?.data           // 1. 先获取 data
    list.value = data?.items || []   // 2. 使用可选链 + 默认值
    total.value = Number(data?.total || 0)
  } catch (error) {
    console.error(error)
    list.value = []  // 3. catch 中重置数据
  } finally {
    loading.value = false
  }
}
```

**配置内容：**
```typescript
// 请求配置
baseURL: '/api'
timeout: 10000

// 请求拦截器
- 自动添加 Authorization 头（从 localStorage 读取 token）

// 响应拦截器
- 统一处理响应数据格式 { code, message, data }
- code !== 1000 时判定为失败
- 自动跳转登录页（401）
- 错误消息提示（ElMessage）
- 返回完整的 res 对象（包含 code, message, data）

// 响应数据格式
interface Result<T> {
  code: number;      // 状态码（成功为 1000）
  message: string;   // 消息
  data: T;          // 数据
}
```

**导出方法：**
- `request.get(url, config)`
- `request.post(url, data, config)`
- `request.put(url, data, config)`
- `request.delete(url, config)`

### 4.2 problem.ts - 题目接口

**接口列表：**

| 接口名 | 方法 | 路径 | 说明 |
|-------|------|------|------|
| getProblemList | POST | /problem/list/page | 获取题目列表（分页） |
| getProblemDetail | GET | /problem/detail/:id | 获取题目详情 |
| submitProblem | POST | /problem/submit | 提交代码 |
| getSubmitResult | GET | /problem/submit/result/:submitId | 查询判题结果 |
| getRankList | GET | /problem/rank/:type | 获取排行榜 |
| getSubmitRecordList | POST | /problem/submit/result/list | 获取题目提交记录列表（分页） |
| globalSearch | GET | /search/global | 全局搜索题目和竞赛 |

**请求参数：**
```typescript
// 获取题目列表
getProblemList(data: {
  current: number;
  pageSize: number;
  keyword?: string;
  difficulty?: DifficultyEnum;
  tags?: string[];
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
})

// 获取排行榜
getRankList(type: 'daily' | 'weekly' | 'monthly' | 'total')

// 提交代码
submitProblem(data: {
  problemId: string;     // 雪花算法ID
  language: LanguageEnum;
  code: string;
  contestId?: string;    // 雪花算法ID（可选）
})
```

**响应数据：**
```typescript
// 题目列表响应
interface PageResult<ProblemVO> {
  records: ProblemVO[],
  total: number,
  size: number,
  current: number,
  pages: number
}

// 题目详情响应
interface ProblemDetailVO {
  problemId: string;
  title: string;
  difficulty: DifficultyEnum;
  // ... 更多字段
}

// 提交响应
type SubmitResponse = string  // 返回 submitId

// 排行榜响应
interface RankItemVO {
  userId: string;         // 雪花算法ID
  nickname: string;
  avatar: string;
  acceptedCount: number;
  rank?: number;
}
```

### 4.3 user.ts - 用户接口

**接口列表：**

| 接口名 | 方法 | 路径 | 说明 |
|-------|------|------|------|
| login | POST | /user/login | 用户登录 |

**请求参数：**
```typescript
login(data: {
  userAccount: string;
  password: string;
})
```

**响应数据：**
```typescript
{
  code: 1000,
  data: {
    user: UserEntity,
    token: string
  }
}
```

### 4.4 contest.ts - 竞赛接口

**接口列表：**

| 接口名 | 方法 | 路径 | 说明 |
|-------|------|------|------|
| getContestList | POST | /contest/list | 获取竞赛列表（分页） |
| registerContest | POST | /contest/register/:contestId | 报名竞赛 |
| getContestDetail | GET | /contest/:contestId | 获取竞赛详情 |
| getContestProblemList | GET | /contest/:contestId/problems | 获取竞赛题目列表 |
| getContestRank | GET | /contest/rank/:contestId | 获取竞赛排行榜 |

**请求参数：**
```typescript
// 获取竞赛列表
getContestList(data: {
  current: number;
  pageSize: number;
  keyword?: string;
  status?: number;
})

// 报名竞赛
registerContest(contestId: string)

// 获取竞赛详情
getContestDetail(contestId: string)

// 获取竞赛题目列表
getContestProblemList(contestId: string)

// 获取竞赛排行榜
getContestRank(contestId: string)
```

**响应数据：**
```typescript
// 竞赛列表响应
interface PageResult<ContestVO> {
  records: ContestVO[],
  total: number,
  size: number,
  current: number,
  pages: number
}

// 竞赛详情响应
interface ContestVO {
  contestId: string;
  title: string;
  description: string;
  status: ContestStatusEnum;
  statusDesc: string;
  startTime: string;
  endTime: string;
  duration: string;
  registered?: boolean;
  // ... 更多字段
}

// 竞赛题目列表响应
interface ContestProblemVO {
  id: string;
  contestId: string;
  problemId: string;
  displayId: string;  // A, B, C...
  title: string;
  difficulty: number;
}

// 竞赛排行榜响应
interface ContestRankVO {
  userId: string;
  nickname: string;
  avatar: string;
  rank: number;
  totalScore: number;
  problemScores: Record<string, number>;  // problemId -> score
}
```

### 4.5 judge.ts - 判题接口

当前为空，预留用于未来扩展。

---

## 五、状态管理

### 5.1 user.ts - 用户状态

**状态定义：**
```typescript
state: {
  token: string;                    // 用户 Token
  userInfo: UserLoginVO | null;     // 用户信息
  role: string;                     // 用户角色（预留）
}
```

**方法列表：**
- `setToken(newToken: string)`：设置 Token 并持久化
- `setUserInfo(info: any)`：设置用户信息并持久化
- `setRole(newRole: string)`：设置角色
- `logout()`：登出并清除所有状态

**持久化策略：**
- ✅ **token** 持久化到 `localStorage.getItem('token')`
- ✅ **userInfo** 持久化到 `localStorage.getItem('userInfo')`（JSON 格式）
- ✅ 应用启动时自动从 localStorage 恢复状态
- ✅ 登出时清除 `localStorage` 中的所有用户数据（token + userInfo）

**⚠️ 重要：用户信息显示问题修复**

**问题描述：**
登录后显示正确的用户名，但刷新页面后变成"用户"或默认值。

**原因分析：**
- userInfo 没有持久化到 localStorage
- 刷新页面后 userInfo 变成空对象 `{}`
- GlobalHeader.vue 读取不到用户信息，显示默认值

**修复方案：**
```typescript
// 1. 初始化时从 localStorage 读取
const getUserInfoFromStorage = () => {
  try {
    const savedInfo = localStorage.getItem('userInfo')
    return savedInfo ? JSON.parse(savedInfo) : {}
  } catch (error) {
    console.error('读取用户信息失败', error)
    return {}
  }
}
const userInfo = ref<any>(getUserInfoFromStorage())

// 2. 设置用户信息时保存到 localStorage
const setUserInfo = (info: any) => {
  userInfo.value = info
  try {
    localStorage.setItem('userInfo', JSON.stringify(info))
  } catch (error) {
    console.error('保存用户信息失败', error)
  }
}

// 3. 退出登录时清除
const logout = () => {
  token.value = ''
  userInfo.value = {}
  role.value = ''
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
}
```

**数据结构：**
```typescript
interface UserLoginVO {
  user: UserEntity;
  token: string;
}

interface UserEntity {
  userId: string;         // 雪花算法ID
  userAccount: string;
  nickName: string;
  avatar: string;
  // ... 更多字段
}
```

---

## 六、公共组件

### 6.1 CodeEditor/index.vue - 代码编辑器

**功能列表：**
1. Monaco Editor 集成
2. 多语言语法高亮
3. 主题切换（Dark/Light）
4. 字号调整
5. 代码内容双向绑定

**Props：**
```typescript
{
  modelValue: string;      // 代码内容（v-model）
  language: string;        // 编程语言
  theme?: string;         // 主题（默认 'vs-dark'）
  fontSize?: number;      // 字号（默认 14）
}
```

**Emits：**
- `update:modelValue`：代码更新时触发

**语言映射：**
| 显示名称 | Monaco 语言值 |
|---------|--------------|
| Java | java |
| C++ | cpp |
| Python | python |
| C | c |
| Go | go |
| JavaScript | javascript |

**主题选项：**
- `vs`：浅色主题
- `vs-dark`：深色主题（默认）
- `hc-black`：高对比度主题

**Monaco Editor 配置：**
```typescript
{
  minimap: { enabled: false },    // 禁用 minimap
  scrollBeyondLastLine: false,    // 禁止滚动到最后一行之后
  fontSize: props.fontSize,       // 字号
  theme: props.theme,             // 主题
  language: monacoLanguage,       // 语言
  automaticLayout: true           // 自动调整布局
}
```

### 6.2 MdViewer/index.vue - Markdown 查看器

**功能列表：**
1. Markdown 内容渲染
2. GitHub 风格样式
3. 支持标准 Markdown 语法

**Props：**
```typescript
{
  content: string;  // Markdown 内容
}
```

**Markdown-it 配置：**
```typescript
markdownit({
  html: true,        // 支持 HTML 标签
  linkify: true,     // 自动转换 URL 为链接
  typographer: true  // 启用排版优化
})
```

**样式来源：**
- GitHub Markdown CSS（通过 CDN 引入）

### 6.3 GlobalHeader.vue - 全局导航栏

**功能列表：**
1. 顶部导航菜单
2. 用户登录状态显示
3. 用户头像与昵称展示
4. 退出登录功能
5. 响应式布局支持

**UI 组件：**
- `el-menu`：导航菜单
- `el-menu-item`：菜单项
- `el-avatar`：用户头像
- `el-dropdown`：下拉菜单
- `el-dropdown-item`：下拉菜单项

**Props：**
```typescript
// 无 Props，直接从 userStore 读取状态
```

**数据结构：**
```typescript
// 用户状态（从 useUserStore 获取）
const userStore = useUserStore()
const { token, userInfo } = storeToRefs(userStore)

// 默认头像
const DEFAULT_AVATAR = 'https://p.ssl.qhimg.com/sdm/480_480_/t01520a1bd1802ae864.jpg'
```

**关键方法：**
- `handleLogout()`：退出登录
- `router.push()`：路由跳转

**样式特点：**
- 固定在页面顶部
- 响应式布局
- 简洁现代的设计风格

---

## 七、类型系统

### 7.1 类型定义文件：src/types/global.ts

**重要说明：雪花算法 ID 处理**

由于后端使用雪花算法生成 ID（Long 类型），为了防止 JavaScript 中的数字精度丢失问题：
- 所有 ID 字段（userId, problemId, contestId, submitId, tagId 等）在后端序列化为 **String** 类型
- 前端所有 ID 字段类型定义为 **string**，避免精度丢失
- 路由参数直接使用 `route.params.id as string`，无需 Number() 转换
- 前端不再对 ID 进行任何数值运算或类型转换

**类型组织结构：**

#### 7.1.1 通用类型
- `Result<T>`：统一响应结构
- `PageRequest`：分页请求参数
- `PageResult<T>`：分页响应结果
- `BaseEntity`：基础实体（createTime, updateTime, createBy, updateBy）
  - `createBy` 和 `updateBy` 为 **string** 类型（雪花算法 ID）

#### 7.1.2 枚举类型

| 枚举名 | 说明 | 值 |
|-------|------|---|
| `DifficultyEnum` | 题目难度 | EASY=1, MEDIUM=2, HARD=3 |
| `SubmitStatusEnum` | 判题状态 | PENDING=0, JUDGING=10, SUCCEED=30, FAILED=40 |
| `JudgeResultEnum` | 判题结果 | AC=1, WA=2, TLE=3, MLE=4, RE=5, CE=6, SE=7 |
| `LanguageEnum` | 编程语言 | Java, C++, Python, C, Go, JavaScript |
| `ContestStatusEnum` | 竞赛状态 | NOT_STARTED=0, IN_PROGRESS=1, ENDED=2 |
| `UserStatusEnum` | 用户状态 | DISABLED=0, NORMAL=1 |

**枚举文本映射：**
- `DifficultyText`：难度文本（简单/中等/困难）
- `JudgeResultText`：判题结果文本（通过/答案错误/超时等）
- `JudgeResultClass`：判题结果样式类名（result-ac/result-wa 等）
- `ContestStatusText`：竞赛状态文本

#### 7.1.3 DTO 类型（请求数据）

| 类型名 | 说明 |
|-------|------|
| `UserLoginDTO` | 用户登录 |
| `UserRegisterDTO` | 用户注册 |
| `UserUpdateDTO` | 用户信息更新 |
| `ProblemQueryRequest` | 题目查询请求（继承 PageRequest） |
| `ProblemAddDTO` | 题目添加/更新 |
| `ProblemSubmitDTO` | 题目提交 |
| `TestCaseDTO` | 测试用例 |
| `ContestAddDTO` | 比赛添加/更新 |
| `ContestProblemAddDTO` | 比赛题目关联 |

#### 7.1.4 Entity 类型（数据库实体）

| 类型名 | 说明 |
|-------|------|
| `BaseEntity` | 基础实体（createTime, updateTime, createBy, updateBy） |
| `UserEntity` | 用户实体 |
| `ProblemEntity` | 题目实体 |
| `ProblemSubmitRecordEntity` | 提交记录实体 |
| `ProblemTagEntity` | 题目标签实体 |
| `ProblemTagRelationEntity` | 题目标签关联实体 |
| `TestCaseEntity` | 测试用例实体 |
| `ContestEntity` | 比赛实体 |
| `ContestProblemEntity` | 比赛题目关联实体 |
| `ContestRegistrationEntity` | 比赛报名实体 |

#### 7.1.5 VO 类型（响应数据）

| 类型名 | 说明 |
|-------|------|
| `UserLoginVO` | 登录响应（user + token） |
| `ProblemTagVO` | 题目标签 |
| `ProblemBasicInfoDTO` | 题目基础信息 |
| `ProblemVO` | 题目列表项 |
| `ProblemDetailVO` | 题目详情（继承 ProblemVO） |
| `SubmitRecordVO` | 提交记录（包含 passCaseCount、totalCaseCount） |
| `ContestVO` | 竞赛信息 |
| `ContestProblemVO` | 竞赛题目 |
| `ContestRankVO` | 竞赛排行榜 |
| `RankItemVO` | 排行榜单项（日榜、周榜、月榜、总榜） |
| `UserBasicInfoDTO` | 用户基础信息 |
| `ProblemSubmitUpdateDTO` | 提交记录更新（判题回写） |

#### 7.1.6 API 类型命名空间

| 命名空间 | 类型 |
|---------|------|
| `UserAPI` | LoginResponse, RegisterResponse, GetInfoResponse |
| `ProblemAPI` | ListRequest, ListResponse, DetailResponse, SubmitRequest, SubmitResponse |
| `SubmissionAPI` | ListRequest, ListResponse, DetailResponse |
| `ContestAPI` | ListRequest, ListResponse, DetailResponse, CreateRequest, UpdateRequest |

### 7.2 类型使用示例

```typescript
// API 调用
const response = await request.get<Result<ProblemDetailVO>>('/problem/1')

// 组件 Props
interface Props {
  modelValue: string;
  language: LanguageEnum;
}

// 状态定义
const judgeResult = ref<JudgeResultEnum>(JudgeResultEnum.AC)

// 数据类型
const problem = ref<ProblemVO | null>(null)
```

---

## 八、样式系统

### 8.1 样式组织

**全局样式（App.vue）：**
- CSS 变量定义
- 基础样式重置
- 字体栈设置
- 滚动条美化

**组件样式：**
- 使用 `<style scoped>` 作用域样式
- 遵循 BEM 命名规范
- 响应式设计

**第三方样式：**
- Element Plus 样式
- GitHub Markdown 样式

### 8.2 全局样式配置

**字体栈：**
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, "Noto Sans", sans-serif,
             "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol",
             "Noto Color Emoji", "SF Pro Text", Monaco;
```

**颜色变量：**
```css
--el-color-primary: #409eff;
--el-bg-color: #f5f7fa;
--el-text-color-primary: #303133;
```

**滚动条样式：**
```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 4px;
}
::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}
```

### 8.3 Element Plus 配置

**全局配置：**
- 语言：中文（zhCn）
- 主题：默认主题
- 组件自动导入（unplugin-vue-components）

---

## 九、Vite 配置

### 9.1 配置内容

**路径别名：**
```typescript
'@': '/src'
```

**开发服务器代理：**
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:10020',
    changeOrigin: true
  }
}
```

**自动导入插件：**
- `unplugin-auto-import`：自动导入 Vue API
- `unplugin-vue-components`：自动导入 Element Plus 组件

**自动导入的 API：**
- Vue：ref, reactive, computed, onMounted 等
- Vue Router：useRouter, useRoute
- Pinia：defineStore
- Element Plus：ElMessage

---

## 十、项目特色

### 10.1 技术亮点

1. **现代化技术栈**
   - Vue 3 Composition API
   - TypeScript 严格模式
   - Vite 构建工具

2. **开发体验优化**
   - 组件自动导入
   - API 自动导入
   - 路径别名
   - 热更新

3. **完善的类型系统**
   - 全面的 TypeScript 类型定义
   - 与后端 Java 结构体对齐
   - 枚举类型完整
   - 命名空间组织

4. **用户友好的界面**
   - Element Plus 组件库
   - 自定义样式优化
   - 响应式设计
   - 全局导航栏

5. **功能完整的在线判题**
   - Monaco Editor 集成
   - 多语言支持（Java/C++/Python/C/Go/JavaScript）
   - 实时判题
   - 代码缓存
   - 轮询机制获取结果

6. **丰富的排行榜系统**
   - 日榜、周榜、月榜、总榜
   - 实时排名展示
   - 用户头像展示

7. **完整的竞赛系统**
   - 竞赛列表与详情
   - 竞赛报名功能
   - 竞赛题目列表
   - 竞赛排行榜

8. **良好的代码组织**
   - 清晰的目录结构
   - 模块化设计
   - 组件复用
   - API 层统一管理

### 10.2 性能优化

1. **路由懒加载**
   - 使用动态 import 语法
   - 减少初始加载时间

2. **代码缓存**
   - localStorage 缓存代码
   - 减少重复输入

3. **轮询优化**
   - 判题完成后立即停止
   - 避免无效请求

---

## 十一、可扩展性

### 11.1 预留扩展点

1. **接口层预留**
   - judge.ts：判题接口
   - contest.ts：比赛接口

2. **布局扩展**
   - BasicLayout 可扩展为完整布局（导航栏、侧边栏等）

3. **路由扩展**
   - 嵌套路由设计便于添加新页面

4. **状态管理扩展**
   - Pinia 支持添加新的 store

### 11.2 已实现功能

1. **用户模块**
   - 用户登录
   - 用户状态管理（Pinia）
   - Token 持久化
   - 全局导航栏

2. **题目模块**
   - 题目列表（分页、搜索、筛选、排序）
   - 题目详情（含提交记录展示）
   - 在线代码编辑（Monaco Editor）
   - 代码提交
   - 判题结果展示（轮询）
   - 提交记录查看（分页展示当前题目的历史提交）

3. **排行榜模块**
   - 日榜、周榜、月榜、总榜
   - 用户排名展示
   - 头像展示

4. **竞赛模块**
   - 竞赛列表
   - 竞赛详情
   - 竞赛报名
   - 竞赛题目列表
   - 竞赛排行榜
   - 权限验证（未报名用户无法查看进行中的竞赛题目）

5. **全局搜索**
   - 支持搜索题目和竞赛
   - 关键字高亮显示
   - 快速跳转到详情页

### 11.3 待实现功能

1. **用户模块**
   - 用户注册
   - 个人信息管理
   - 修改密码
   - 个人中心页面（含提交记录、统计信息）

2. **提交记录增强**
   - 代码查看功能
   - 提交统计分析（AC率、常用语言等）
   - 全局提交记录查询（跨题目）

3. **管理后台**
   - 题目管理
   - 用户管理
   - 竞赛管理
   - 题解管理

4. **题解模块**
   - 题解列表
   - 题解详情（Markdown 渲染）
   - 题解评论
   - 题解点赞

5. **其他功能**
   - 题目收藏
   - 实时通知（WebSocket）
   - 代码分享
   - 用户主页展示

---

## 十二、开发建议

### 12.1 代码规范

1. **命名规范**
   - 组件：PascalCase（如 ProblemList.vue）
   - 函数：camelCase（如 fetchProblems）
   - 常量：UPPER_SNAKE_CASE（如 API_BASE_URL）

2. **文件组织**
   - 一个组件一个文件
   - 相关功能放同一目录
   - 类型定义集中管理

3. **注释规范**
   - 公共组件必须添加注释
   - 复杂逻辑添加说明
   - API 接口添加 JSDoc

### 12.2 数据访问安全规范

**⚠️ 项目核心规范：所有 API 调用必须遵守数据访问安全模式**

#### 12.2.1 响应数据访问模式

**原则：**
1. 响应拦截器返回 `{ code, message, data }` 结构
2. 必须通过 `res.data` 访问真正的数据
3. 使用可选链 `?.` 防止空值错误
4. 提供默认值 `|| []` 和 `|| 0`
5. catch 块中重置数据

**标准模板：**
```typescript
const loadData = async () => {
  loading.value = true
  try {
    const res = await apiCall(params)
    const data = res?.data                    // ✅ 步骤1：获取 data
    list.value = data?.items || []            // ✅ 步骤2：可选链 + 默认值
    total.value = Number(data?.total || 0)    // ✅ 步骤3：Number 转换 + 默认值
  } catch (error) {
    console.error(error)
    list.value = []                           // ✅ 步骤4：重置数据
    total.value = 0
  } finally {
    loading.value = false
  }
}
```

#### 12.2.2 已修复的文件清单

| 文件 | 修复内容 | 状态 |
|------|---------|------|
| ProblemList.vue | loadData, loadRankData | ✅ 已修复 |
| ProblemDetail.vue | loadDetail, loadSubmitList, handleRecordClick, startPolling | ✅ 已修复 |
| ContestDetail.vue | loadDetail, loadProblems, loadRank | ✅ 已修复 |
| ContestList.vue | loadData | ✅ 已修复 |
| LoginView.vue | 正确使用 res.data | ✅ 无问题 |
| user.ts (store) | userInfo 持久化 | ✅ 已修复 |

#### 12.2.3 常见错误模式

**❌ 错误 1：直接访问 res**
```typescript
const res = await getList()
value = res.records  // 错误：res 不是数组
```

**❌ 错误 2：缺少空值检查**
```typescript
const res = await getList()
value = res.data.records  // 错误：data 可能为 undefined
```

**❌ 错误 3：没有默认值**
```typescript
const res = await getList()
value = res?.data.records  // 不安全：records 可能为 undefined
```

#### 12.2.4 正确模式对比

| 场景 | 错误写法 | 正确写法 |
|------|---------|---------|
| 数组赋值 | `value = res.records` | `value = res?.data?.records \|\| []` |
| 对象赋值 | `value = res.data` | `value = res?.data \|\| {}` |
| 数字赋值 | `value = res.total` | `value = Number(res?.data?.total \|\| 0)` |
| 传递参数 | `fn(res.data)` | `fn(res?.data)` |
| 条件判断 | `if (res.status)` | `if (res?.data?.status)` |

### 12.3 调试技巧

1. **Vue DevTools**
   - 查看组件树
   - 查看状态变化
   - 性能分析

2. **Network**
   - 查看请求响应
   - 调试接口问题

3. **Console**
   - 添加调试日志
   - 错误追踪

---

## 总结

Liren OJ Web 是一个功能完善、设计良好的在线判题系统前端项目。项目采用现代化的技术栈和最佳实践，具有良好的可维护性和扩展性。

### 核心优势

1. **技术栈先进**：Vue 3 + TypeScript + Vite，提供最佳开发体验
2. **类型安全**：完整的 TypeScript 类型系统，与后端完全对齐
3. **功能完善**：题目系统、竞赛系统、排行榜系统均已实现
4. **用户体验佳**：Monaco Editor、实时判题、代码缓存等贴心功能
5. **代码质量高**：清晰的目录结构、模块化设计、组件复用

### 当前状态

- **已完成**：
  - ✅ 题目模块（列表、详情、提交、判题）
  - ✅ 竞赛模块（列表、详情、报名、排行榜）
  - ✅ 排行榜模块（日榜、周榜、月榜、总榜）
  - ✅ 用户登录
  - ✅ 全局导航栏
  - ✅ 全局搜索
  - ✅ 数据访问安全修复（所有 API 调用）
  - ✅ 用户信息持久化（修复刷新丢失问题）

- **待开发**：
  - ⏳ 提交记录增强（代码查看、统计分析）
  - ⏳ 个人中心页面
  - ⏳ 管理后台
  - ⏳ 题解模块

### 已知问题和修复

| 问题 | 状态 | 修复说明 |
|------|------|---------|
| API 响应数据访问错误 | ✅ 已修复 | 所有组件使用 `res.data` 访问数据 |
| 刷新页面用户信息丢失 | ✅ 已修复 | userInfo 持久化到 localStorage |
| 排行榜 null 元素报错 | ✅ 已修复 | 添加数据过滤和可选链 |

### 适用场景

- 在线编程练习
- 算法竞赛平台
- 编程教学工具
- 技术面试系统

项目结构清晰，代码规范，类型系统完善，为后续功能开发提供了坚实的基础。

