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
│   │   └── contest.ts    # 比赛接口（预留）
│   ├── components/       # 公共组件
│   │   ├── CodeEditor/   # 代码编辑器组件
│   │   └── MdViewer/     # Markdown 查看器组件
│   ├── layout/           # 布局组件
│   │   └── BasicLayout.vue
│   ├── router/           # 路由配置
│   │   └── index.ts
│   ├── stores/           # 状态管理
│   │   └── user.ts
│   ├── styles/           # 全局样式
│   │   └── index.scss
│   ├── types/            # TypeScript 类型定义
│   │   └── global.d.ts
│   ├── utils/            # 工具函数
│   │   └── request.ts    # Axios 封装
│   ├── views/            # 页面组件
│   │   ├── problem/
│   │   │   ├── ProblemList.vue    # 题目列表页
│   │   │   └── ProblemDetail.vue  # 题目详情页
│   │   └── user/
│   │       └── LoginView.vue      # 用户登录页
│   ├── App.vue           # 应用根组件
│   └── main.ts           # 应用入口
├── index.html            # HTML 入口
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript 配置
└── vite.config.ts        # Vite 配置
```

---

## 二、路由配置

### 2.1 路由结构

| 路径 | 组件 | 说明 |
|-----|------|------|
| `/` | BasicLayout | 基础布局（嵌套路由） |
| `/problem` | ProblemList | 题目列表页 |
| `/problem/detail/:id` | ProblemDetail | 题目详情页（动态参数） |
| `/login` | LoginView | 用户登录页 |

### 2.2 路由特点

- 默认重定向到 `/problem`
- 使用动态路由参数 `:id` 获取题目详情
- 路由元信息（meta）包含页面标题
- 嵌套路由设计，支持布局扩展

### 2.3 路由配置代码

```typescript
// src/router/index.ts
{
  path: '/',
  component: BasicLayout,
  redirect: '/problem',
  children: [
    {
      path: 'problem',
      component: () => import('@/views/problem/ProblemList.vue'),
      meta: { title: '题目列表' }
    },
    {
      path: 'problem/detail/:id',
      component: () => import('@/views/problem/ProblemDetail.vue'),
      meta: { title: '题目详情' }
    }
  ]
},
{
  path: '/login',
  component: () => import('@/views/user/LoginView.vue'),
  meta: { title: '登录' }
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

**UI 组件：**
- `el-table`：表格展示
- `el-pagination`：分页组件
- `el-input`：搜索输入框
- `el-select`：难度筛选下拉框
- `el-tag`：难度标签

**数据结构：**
```typescript
// 查询参数
queryParams: {
  current: 1,
  pageSize: 10,
  keyword: '',
  difficulty: undefined
}

// 响应数据
problemList: {
  records: ProblemVO[],
  total: number,
  size: number,
  current: number,
  pages: number
}
```

**关键方法：**
- `fetchProblems()`：获取题目列表
- `handleSearch()`：搜索处理
- `handleReset()`：重置筛选
- `handlePageChange()`：分页处理
- `goToDetail()`：跳转到详情页

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
  problemId: number,
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
  problemId: number,
  language: string,
  code: string
}

// 判题结果
judgeResult: {
  submitId: number,
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

---

## 四、API 接口层

### 4.1 request.ts - Axios 封装

**功能描述：**
- 基于 Axios 创建 HTTP 请求实例
- 配置请求/响应拦截器
- 统一错误处理
- Token 认证机制

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
| getProblemList | GET | /problem/list | 获取题目列表（分页） |
| getProblemDetail | GET | /problem/:id | 获取题目详情 |
| submitCode | POST | /problem/submit | 提交代码 |
| getSubmitResult | GET | /problem/submit/result/:id | 查询判题结果 |

**请求参数：**
```typescript
// 获取题目列表
getProblemList(params: {
  current: number;
  pageSize: number;
  keyword?: string;
  difficulty?: number;
})

// 提交代码
submitCode(data: {
  problemId: number;
  language: string;
  code: string;
})
```

**响应数据：**
```typescript
// 题目列表响应
{
  code: 1000,
  data: {
    records: ProblemVO[],
    total: number,
    size: number,
    current: number
  }
}

// 题目详情响应
{
  code: 1000,
  data: ProblemDetailVO
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

### 4.4 预留接口文件

- **judge.ts**：判题相关接口（空文件，预留）
- **contest.ts**：比赛相关接口（空文件，预留）

---

## 五、状态管理

### 5.1 user.ts - 用户状态

**状态定义：**
```typescript
state: {
  isLogin: boolean;      // 登录状态
  token: string;         // 用户 Token
  user: UserEntity | null;  // 用户信息
}
```

**方法列表：**
- `setLoginState(user, token)`：设置登录状态
- `logout()`：登出并清除状态
- `loadState()`：从 localStorage 加载状态

**持久化策略：**
- 使用 localStorage 存储用户状态
- 应用启动时自动加载状态
- 登出时清除所有状态

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

---

## 七、类型系统

### 7.1 类型定义文件：src/types/global.d.ts

**类型组织结构：**

#### 7.1.1 通用类型
- `Result<T>`：统一响应结构
- `PageRequest`：分页请求参数
- `PageResult<T>`：分页响应结果

#### 7.1.2 枚举类型

| 枚举名 | 说明 | 值 |
|-------|------|---|
| `DifficultyEnum` | 题目难度 | EASY=1, MEDIUM=2, HARD=3 |
| `SubmitStatusEnum` | 判题状态 | PENDING=0, JUDGING=10, SUCCEED=30, FAILED=40 |
| `JudgeResultEnum` | 判题结果 | AC=0, WA=1, TLE=2, MLE=3, OLE=4, RE=5, CE=6, SE=7 |
| `LanguageEnum` | 编程语言 | Java, C++, Python, C, Go, JavaScript |
| `ContestStatusEnum` | 比赛状态 | NOT_STARTED=0, IN_PROGRESS=1, ENDED=2 |
| `UserStatusEnum` | 用户状态 | DISABLED=0, NORMAL=1 |

**枚举文本映射：**
- `DifficultyText`：难度文本（简单/中等/困难）
- `JudgeResultText`：判题结果文本（通过/答案错误/超时等）
- `JudgeResultClass`：判题结果样式类名（result-ac/result-wa 等）
- `ContestStatusText`：比赛状态文本

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
| `SubmitRecordVO` | 提交记录 |
| `ContestVO` | 比赛信息 |
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

4. **用户友好的界面**
   - Element Plus 组件库
   - 自定义样式优化
   - 响应式设计

5. **功能完整的在线判题**
   - Monaco Editor 集成
   - 多语言支持
   - 实时判题
   - 代码缓存

6. **良好的代码组织**
   - 清晰的目录结构
   - 模块化设计
   - 组件复用

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

### 11.2 待实现功能

1. **用户模块**
   - 用户注册
   - 个人信息管理
   - 修改密码

2. **比赛模块**
   - 比赛列表
   - 比赛详情
   - 比赛排名

3. **提交记录**
   - 提交历史查询
   - 代码查看
   - 统计分析

4. **管理后台**
   - 题目管理
   - 用户管理
   - 比赛管理

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

### 12.2 调试技巧

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

Liren OJ Web 是一个设计良好、功能完整的在线判题系统前端项目。项目采用现代化的技术栈和最佳实践，具有良好的可维护性和扩展性。项目结构清晰，代码规范，类型系统完善，为后续功能开发提供了坚实的基础。
