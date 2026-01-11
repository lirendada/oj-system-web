import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // 配合 vite proxy
  timeout: 10000,  // 请求超时时间
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 LocalStorage 获取 Token (假设存为 token)
    const token = localStorage.getItem('token')
    if (token) {
      // 这里的 header key 需要确认，通常是 Authorization 或 token
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, message, data } = response.data
    
    // 假设 200 代表业务成功 (根据 Result 类的常量定义调整)
    if (code === 200) {
      return data // 直接返回 data，让调用处少写一层 .data
    } else {
      // 业务错误处理
      ElMessage.error(message || '系统接口异常')
      
      // 处理特定错误码，如 Token 过期 (401)
      if (code === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(message || 'Error'))
    }
  },
  (error) => {
    // HTTP 状态码错误处理
    const msg = error.response?.data?.message || error.message
    ElMessage.error(msg || '网络请求失败')
    return Promise.reject(error)
  }
)

export default service