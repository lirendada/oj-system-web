// src/utils/request.ts
import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', 
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = token // 注意：有些后端需要 'Bearer ' + token，这里先传纯 token，如果不通再改
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
    // 1. 获取后端返回的结构: { code, message, data }
    const { code, message, data } = response.data

    // 2. 关键修正：根据 ResultCode.java，成功状态码是 1000
    if (code === 1000) {
      // 业务成功，直接返回数据部分
      return data 
    } else {
      // 3. 业务失败处理
      
      // 5001: 未登录或登录已过期
      if (code === 5001) {
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        // 可以选择跳转到登录页，或者刷新页面
        // window.location.href = '/login'
        return Promise.reject(new Error(message || 'Token Expired'))
      }

      // 其他错误直接提示
      ElMessage.error(message || '系统接口异常')
      return Promise.reject(new Error(message || 'Error'))
    }
  },
  (error) => {
    // 4. HTTP 协议层面的错误 (如 404, 500, 网络断开)
    console.error('HTTP Error:', error)
    const msg = error.response?.data?.message || error.message || '网络请求失败'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default service