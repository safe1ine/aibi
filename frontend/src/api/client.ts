/**
 * API 客户端工具
 * 使用生成的 API 客户端
 */

import { Configuration, AuthApi, DatasourcesApi, ChatApi, SettingsApi } from '../generated'
import api from './index'

// 创建配置
const config = new Configuration({
  basePath: '', // 使用相对路径
})

// 认证 API
export const authApi = new AuthApi(config)

// 数据源 API
export const datasourcesApi = new DatasourcesApi(config)

// 聊天 API
export const chatApi = new ChatApi(config)

// 设置 API
export const settingsApi = new SettingsApi(config)

// 辅助函数：获取当前 token
export const getToken = () => localStorage.getItem('token')

// 辅助函数：设置 token 到所有 API 配置
export const setToken = (token: string) => {
  const newConfig = new Configuration({
    basePath: '',
    baseOptions: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  // 重新创建 API 实例
  Object.assign(authApi, new AuthApi(newConfig))
  Object.assign(datasourcesApi, new DatasourcesApi(newConfig))
  Object.assign(chatApi, new ChatApi(newConfig))
  Object.assign(settingsApi, new SettingsApi(newConfig))
}
