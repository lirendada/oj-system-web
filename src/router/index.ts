// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layout/BasicLayout.vue'),
    redirect: '/problem',
    children: [
      {
        path: '/problem',
        name: 'ProblemList',
        component: () => import('@/views/problem/ProblemList.vue'),
        meta: { title: '题目列表' }
      },
      // ✅ 新增：题目详情页路由
      // :id 是动态参数，对应 url 中的 2007326004497866754
      {
        path: '/problem/detail/:id',
        name: 'ProblemDetail',
        component: () => import('@/views/problem/ProblemDetail.vue'),
        meta: { title: '题目详情' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/LoginView.vue'),
    meta: { title: '用户登录' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router