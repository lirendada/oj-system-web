// src/utils/request.ts
import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 1. 创建 axios 实例
const service = axios.create({
  baseURL: '/api', // 配合 vite.config.ts 的 proxy
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
})

// 2. 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    
    // 确保 token 存在且不为空
    if (userStore.token) {
      // ✅ 策略 A: 标准格式 (推荐) -> 后端需支持从 Authorization 头读取
      // config.headers['Authorization'] = userStore.token
      // 或者带 Bearer 前缀:
      // config.headers['Authorization'] = `Bearer ${userStore.token}`

      // ✅ 策略 B: 自定义 Header (你之前的报错看似后端是直接解析字符串)
      // 如果你的后端 JwtUtil 是直接读取 header 里的字符串进行解析，
      // 建议用这个，或者确保 Authorization 里没有 'Bearer ' 前缀
      config.headers['Authorization'] = userStore.token
      
      // 备用：有些老系统强制读 'token' 这个 key
      // config.headers['token'] = userStore.token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 获取后端返回的完整 JSON 结构
    const res = response.data
    // 解构出 code 和 message (根据你的后端 Result 类字段调整)
    const { code, message } = res

    // ✅ 场景 1: 业务成功 (1000)
    // 这里直接返回 res (即整个 {code, msg, data})
    // 这样在 LoginView 里写 const token = res.data 才是对的
    if (code === 1000) {
      return res 
    } 

    // ✅ 场景 2: Token 过期或未登录 (5001)
    if (code === 5001) {
      const userStore = useUserStore()
      ElMessage.error('登录已过期，请重新登录')
      // 清理本地数据
      userStore.logout()
      // 跳转登录页
      router.push('/login')
      return Promise.reject(new Error(message || 'Token Expired'))
    }

    // ✅ 场景 3: 其他业务错误 (如密码错误、账号不存在等)
    ElMessage.error(message || '系统接口异常')
    return Promise.reject(new Error(message || 'Error'))
  },
  (error) => {
    // 4. HTTP 协议层面的错误 (如 404, 500, 网络断开)
    console.error('HTTP Error:', error)
    let msg = '网络请求失败'
    if (error.response) {
        // 根据 HTTP 状态码提示
        switch (error.response.status) {
            case 401: msg = '未授权，请登录'; break;
            case 403: msg = '拒绝访问'; break;
            case 404: msg = '请求地址出错'; break;
            case 500: msg = '服务器内部错误'; break;
            default: msg = error.response.data?.message || '网络错误';
        }
    }
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default service