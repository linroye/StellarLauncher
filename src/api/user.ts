import api from './request'
import type {
  UserInfoResponse,
  ResetTokenRequest,
  ResetTokenResponse
} from './types/user'

/**
 * 用户相关API
 */
export const userApi = {
  /**
   * 获取用户信息
   * @returns Promise<UserInfoResponse>
   */
  async getUserInfo(): Promise<UserInfoResponse> {
    const response = await api.get('/api/v1/users/info')
    return response.data
  },

  /**
   * 重置用户令牌
   * @param data 账号和密码
   * @returns Promise<ResetTokenResponse>
   */
  async resetToken(data: ResetTokenRequest): Promise<ResetTokenResponse> {
    const response = await api.post('/api/v1/users/resettoken', data)
    return response.data
  }
}

export default userApi 