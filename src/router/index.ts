import { createRouter, createWebHistory } from 'vue-router'
import BasicLayout from '@/layout/BasicLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
          meta: { hideFooter: true } // 详情页可能不需要底部 footer，看你喜好
        },
        // ✅ 新增：竞赛列表路由
        {
          path: 'contest',
          name: 'ContestList',
          component: () => import('@/views/contest/ContestList.vue')
        },
        // 预留：竞赛详情路由 (后面开发详情页时会用到)
        {
          path: 'contest/:id',
          name: 'ContestDetail',
          component: () => import('@/views/contest/ContestDetail.vue')
        },
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/user/LoginView.vue'),
      meta: { transition: 'rocket' } 
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import("@/views/user/RegisterView.vue"),
      meta: { transition: 'rocket' } 
    },
    {
      path: '/forget-password',
      name: 'ForgetPassword',
      component: () => import("@/views/user/ForgetPasswordView.vue")
    },
    {
      path: '/center',
      name: 'UserCenter',
      component: () => import('@/views/user/UserCenterView.vue')
    }
  ]
})

export default router