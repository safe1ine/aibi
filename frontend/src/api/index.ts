import axios, { AxiosError } from 'axios'
import { Configuration } from './generated'

// API 客户端配置
const api = axios.create({
  baseURL: '/api',
})

// 请求拦截器：添加 JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：处理 401 错误
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// 导出配置创建器 - 用于生成的 API 客户端
export const createApiConfig = () =>
  new Configuration({
    basePath: '',
    baseOptions: {
      headers: {},
    },
  })

// 导出 API 实例和生成的类
export { api }
export * from './generated'
export default api
