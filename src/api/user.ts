import request from '@/utils/request'
// 引入全局类型
import type { UserLoginDTO, UserLoginVO, Result, UserRegisterRequest } from '@/types/global'

enum Api {
  Login = '/user/login'
}

/**
 * 用户登录
 * 参数: UserLoginDTO { userAccount, password }
 * 响应: UserLoginVO { token, userId, nickName... }
 */
export const userLogin = (data: UserLoginDTO) => {
  return request.post<any, UserLoginVO>(Api.Login, data)
}

export const getInfo = () => {
  return request.get<any, Result<any>>('/user/info')
}


/**
 * 用户注册
 * @param data 注册信息
 */
export const userRegister = (data: UserRegisterRequest) => {
  return request.post<any, number>('/user/register', data)
}

/**
 * 发送忘记密码验证码
 * @param email 邮箱地址
 */
export const sendForgetCode = (email: string) => {
  return request.post<any, any>('/user/forget/send-code', { email })
}

/**
 * 重置密码
 * @param data 重置密码参数
 */
export const resetPassword = (data: any) => {
  return request.post<any, any>('/user/forget/reset', data)
}