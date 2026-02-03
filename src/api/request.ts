import axios from 'axios'
import type { AxiosResponse } from 'axios'

// 定义通用响应接口
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data?: T
}

// 创建axios实例
const api = axios.create({
  baseURL: 'https://api.stellarfrp.top',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 保存token的变量
let authToken: string = ''
let logout: () => void = () => {}

// 提供给外部设置token的方法
export const setToken = (token: string) => authToken = token

export const setLogout = (fn: () => void) => logout = fn

// 清除token的方法
export const clearToken = () => authToken = ''

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = authToken
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // API请求可能成功，但业务状态需要从返回的code中判断
    const res = response.data as ApiResponse

    // 判断业务状态码
    if (res.code !== 200) {
      // 业务处理失败
      switch (res.code) {
        case 401:
          // 未授权，清除token
          clearToken()
          logout()
          console.error('未授权，请重新登录')
          break
        case 403:
          console.error('权限不足：' + res.msg)
          break
        case 404:
          console.error('请求的资源不存在：' + res.msg)
          break
        default:
          console.error('请求失败：' + res.msg)
      }
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    
    // 业务处理成功，返回原始响应
    return response
  },
  (error) => {
    // 处理网络错误（非200 HTTP状态码）
    let message = '网络请求失败'
    if (error.response) {
      // 请求已发出，服务器以非200状态码响应
      switch (error.response.status) {
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求的资源不存在'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败(${error.response.status})`
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      message = '服务器无响应'
    } else {
      // 设置请求时发生错误
      message = error.message
    }
    
    console.error(message)
    return Promise.reject(new Error(message))
  }
)

export default api