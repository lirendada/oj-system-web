import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layout/BasicLayout.vue'), // 基础布局
    redirect: '/problem',
    children: [
      {
        path: '/problem',
        name: 'ProblemList',
        component: () => import('@/views/problem/ProblemList.vue'),
        meta: { title: '题目列表' }
      },
      // 其他路由后续添加
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