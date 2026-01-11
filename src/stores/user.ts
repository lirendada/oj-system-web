import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserLoginVO } from '@/types/global'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<UserLoginVO | null>(null)

  const setLoginState = (data: UserLoginVO) => {
    token.value = data.token
    userInfo.value = data
    
    localStorage.setItem('token', data.token)
    // 缓存用户信息
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  const loadState = () => {
    const storedUser = localStorage.getItem('userInfo')
    if (storedUser) {
      try {
        userInfo.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('解析用户信息失败', e)
        localStorage.removeItem('userInfo')
      }
    }
  }

  const logout = () => {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  loadState()

  return {
    token,
    userInfo,
    setLoginState,
    logout
  }
})