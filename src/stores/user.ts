import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  // 1. 定义 State
  // 初始化时优先从 localStorage 读取，防止刷新页面后 token 丢失
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<any>({})
  const role = ref('') // 用于区分 user 或 admin

  // 2. 定义 Actions
  // ✅ 设置 Token
  const setToken = (newToken: string) => {
    token.value = newToken
    // 同步保存到本地存储
    localStorage.setItem('token', newToken)
  }

  // ✅ 设置用户信息
  const setUserInfo = (info: any) => {
    userInfo.value = info
  }

  // ✅ 设置角色
  const setRole = (newRole: string) => {
    role.value = newRole
  }

  // ✅ 退出登录
  const logout = () => {
    token.value = ''
    userInfo.value = {}
    role.value = ''
    localStorage.removeItem('token')
  }

  // 3. 必须 return 出去，外部才能调用
  return {
    token,
    userInfo,
    role,
    setToken,
    setUserInfo,
    setRole,
    logout
  }
})