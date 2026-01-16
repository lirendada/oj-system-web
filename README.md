# Liren OJ Web - 用户端

基于 Vue 3 + TypeScript + Vite + Element Plus 开发的在线判题系统用户端。

## 技术栈

- **框架**: Vue 3.5 (Composition API)
- **构建工具**: Vite 7.2
- **UI 组件库**: Element Plus 2.13
- **状态管理**: Pinia 3.0
- **路由管理**: Vue Router 4.6
- **HTTP 客户端**: Axios 1.13
- **Markdown 渲染**: markdown-it 14.1 + github-markdown-css
- **代码编辑器**: Monaco Editor 0.55
- **分屏组件**: splitpanes 4.0
- **开发语言**: TypeScript 5.9

## 功能模块

### 1. 题目练习
- 题目列表(分页、搜索、难度筛选)
- 题目详情(支持 Markdown 渲染)
- 代码编辑器(Monaco Editor)
- 提交代码(支持 Java/C++/Python)
- 实时查看判题结果(轮询机制)
- 查看提交记录列表
- 测试用例结果展示

### 2. 排行榜系统
- 总榜 Top 10
- 日榜 Top 10
- 周榜 Top 10
- 月榜 Top 10
- 实时排名数据展示

### 3. 竞赛系统
- 竞赛列表(分页、搜索、状态筛选)
- 竞赛详情
- 竞赛题目列表
- 竞赛报名
- 竞赛排行榜

### 4. 用户系统
- 用户登录
- 用户注册
- 忘记密码(邮箱验证码)
- 个人中心
- 个人信息编辑
- 用户统计信息(提交数、通过数、Rating)

### 5. 全局导航
- 顶部导航栏(Logo、题目、竞赛、个人中心)
- 用户状态展示
- 快捷跳转

## 开发指南

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问地址: http://localhost:3000

### 构建生产版本
```bash
npm run build
```

### 预览生产版本
```bash
npm run preview
```

## 默认配置

### 重要提示

⚠️ **环境配置**: 本项目使用 `http://localhost:10020` 作为后端网关地址，这是本地开发环境的默认配置。在生产环境中，请修改 `vite.config.ts` 中的代理配置为实际的后端服务地址。

### API 代理
开发环境默认代理到后端网关: `http://localhost:10020`

### 端口
- 开发服务器端口: `3000`
- 后端网关端口: `10020`

## 项目结构

```
liren-oj-web/
├── src/
│   ├── api/              # API 接口层
│   │   ├── problem.ts    # 题目相关接口
│   │   ├── user.ts       # 用户相关接口
│   │   ├── contest.ts    # 竞赛相关接口
│   │   └── judge.ts      # 判题相关接口
│   ├── types/            # TypeScript 类型定义
│   │   └── global.ts     # 全局类型定义
│   ├── utils/            # 工具函数
│   │   └── request.ts    # Axios 封装
│   ├── stores/           # 状态管理
│   ├── router/           # 路由配置
│   ├── layout/           # 布局组件
│   │   └── BasicLayout.vue
│   ├── views/            # 页面组件
│   │   ├── problem/      # 题目相关页面
│   │   ├── contest/      # 竞赛相关页面
│   │   └── user/         # 用户相关页面
│   ├── components/       # 公共组件
│   │   ├── CodeEditor/   # 代码编辑器(Monaco Editor)
│   │   ├── MdViewer/     # Markdown 查看器
│   │   ├── GlobalHeader.vue
│   │   └── RocketLoader.vue
│   ├── styles/           # 全局样式
│   ├── hooks/            # 组合式函数
│   ├── App.vue           # 应用根组件
│   └── main.ts           # 应用入口
├── public/               # 静态资源
├── index.html            # HTML 入口
├── vite.config.ts        # Vite 配置
├── tsconfig.json         # TypeScript 配置
└── package.json          # 项目依赖
```

## 核心功能实现

### 1. 代码提交流程

```javascript
// 1. 用户提交代码
submitProblem(data) → 获得submitId

// 2. 轮询判题结果
setInterval(() => {
  getSubmitResult(submitId)
}, 2000)

// 3. 判题完成后停止轮询
if (status === 30) { // SUCCEED
  clearInterval()
  显示最终结果
}
```

### 2. Markdown 渲染

使用 `markdown-it` 进行 Markdown 渲染，配合 `github-markdown-css` 实现 GitHub 风格样式。

```vue
<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup lang="ts">
import MarkdownIt from 'markdown-it'
const md = new MarkdownIt()
const renderedHtml = md.render(markdownContent)
</script>
```

### 3. 代码编辑器配置

Monaco Editor 配置支持语法高亮、自动补全、主题切换等功能。

```typescript
// 支持的语言
const languages = [
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' }
]
```

## 特色功能

1. **完整的类型系统**: 与后端 Java 实体完全对齐的 TypeScript 类型定义
2. **响应式布局**: 适配不同屏幕尺寸
3. **实时判题结果**: 前端轮询机制，实时展示判题进度
4. **代码编辑器**: Monaco Editor 提供专业的编程体验
5. **分屏布局**: 题目描述和代码编辑器可调整宽度
6. **统一错误处理**: Axios 拦截器统一处理请求和响应错误
7. **数据持久化**: 用户登录状态持久化到 localStorage

## 注意事项

1. **雪花算法 ID 处理**: 所有 ID 字段使用 String 类型，避免 JavaScript 精度丢失
2. **Token 认证**: 所有 API 请求自动携带 Authorization 头
3. **统一响应格式**: 后端返回格式为 `{ code, message, data }`
4. **错误码 1000**: code 为 1000 表示成功，其他值为失败
5. **轮询优化**: 判题结果轮询最多 60 次，超过则停止轮询
6. **路由守卫**: 未登录用户访问需要登录的页面时自动跳转到登录页

## 技术亮点

1. **组件化设计**: 高度模块化的组件结构，易于维护和扩展
2. **性能优化**: 路由懒加载，提升首屏加载速度
3. **开发体验**: Vite HMR 提供极速的开发体验
4. **类型安全**: 完整的 TypeScript 类型定义，减少运行时错误
5. **用户体验**: RocketLoader 动画、过渡动画等提升交互体验

## 浏览器支持

- Chrome (推荐)
- Firefox
- Edge
- Safari

## 许可证

MIT License
