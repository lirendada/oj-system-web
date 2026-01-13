import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  // 1. 定义 State
  // 初始化时优先从 localStorage 读取，防止刷新页面后 token 丢失
  const token = ref(localStorage.getItem('token') || '')

  // ✅ 修复：userInfo 也要持久化，刷新页面后从 localStorage 恢复
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

  const role = ref('') // 用于区分 user 或 admin

  // 2. 定义 Actions
  // ✅ 设置 Token
  const setToken = (newToken: string) => {
    token.value = newToken
    // 同步保存到本地存储
    localStorage.setItem('token', newToken)
  }

  // ✅ 设置用户信息 - 同步保存到 localStorage
  const setUserInfo = (info: any) => {
    userInfo.value = info
    try {
      localStorage.setItem('userInfo', JSON.stringify(info))
    } catch (error) {
      console.error('保存用户信息失败', error)
    }
  }

  // ✅ 设置角色
  const setRole = (newRole: string) => {
    role.value = newRole
  }

  // ✅ 退出登录 - 清除所有本地数据
  const logout = () => {
    token.value = ''
    userInfo.value = {}
    role.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo') // ✅ 也要清除用户信息
  }

  // ✅ 获取当前登录用户信息
  const getLoginUser = async () => {
    try {
      const res = await getInfo()
      if (res?.data) {
        setUserInfo(res.data)
        return res.data
      }
    } catch (error) {
      console.error('获取用户信息失败', error)
    }
    return null
  }

  // 3. 必须 return 出去，外部才能调用
  return {
    token,
    userInfo,
    role,
    setToken,
    setUserInfo,
    setRole,
    logout,
    getLoginUser
  }
})