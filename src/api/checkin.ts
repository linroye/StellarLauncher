import api from './request'
import type {
  CheckinStatusResponse,
  CheckinLogsRequest,
  CheckinLogsResponse,
  CheckinResponse
} from './types/checkin'

/**
 * 签到相关API
 */
export const checkinApi = {
  /**
   * 获取签到状态
   * @returns Promise<CheckinStatusResponse>
   */
  async getStatus(): Promise<CheckinStatusResponse> {
    const response = await api.get('/api/v1/users/checkin/status')
    return response.data
  },

  /**
   * 获取签到日志
   * @param params 分页参数
   * @returns Promise<CheckinLogsResponse>
   */
  async getLogs(params: CheckinLogsRequest): Promise<CheckinLogsResponse> {
    const response = await api.get('/api/v1/users/checkin/logs', { params })
    return response.data
  },

  /**
   * 进行签到
   * @returns Promise<CheckinResponse>
   */
  async doCheckin(): Promise<CheckinResponse> {
    const response = await api.post('/api/v1/users/checkin')
    return response.data
  }
}

export default checkinApi 