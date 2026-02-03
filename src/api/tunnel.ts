import api from './request'
import type {
  CreateTunnelRequest,
  CreateTunnelResponse,
  DeleteTunnelRequest,
  DeleteTunnelResponse,
  GetTunnelRequest,
  GetTunnelResponse,
  EditTunnelRequest,
  EditTunnelResponse,
  TunnelStatusRequest,
  TunnelStatusResponse,
  CloseTunnelRequest,
  CloseTunnelResponse
} from './types/tunnel'

/**
 * 隧道相关API
 */
export const tunnelApi = {
  /**
   * 创建隧道
   * @param data 创建隧道请求参数
   * @returns Promise<CreateTunnelResponse>
   */
  async createTunnel(data: CreateTunnelRequest): Promise<CreateTunnelResponse> {
    const response = await api.post('/api/v1/proxy/create', data)
    return response.data
  },

  /**
   * 删除隧道
   * @param data 删除隧道请求参数
   * @returns Promise<DeleteTunnelResponse>
   */
  async deleteTunnel(data: DeleteTunnelRequest): Promise<DeleteTunnelResponse> {
    const response = await api.post('/api/v1/proxy/delete', data)
    return response.data
  },

  /**
   * 获取隧道列表或指定隧道信息
   * @param params 获取隧道请求参数
   * @returns Promise<GetTunnelResponse>
   */
  async getTunnel(params?: GetTunnelRequest): Promise<GetTunnelResponse> {
    const response = await api.get('/api/v1/proxy/get', { params })
    return response.data
  },

  /**
   * 编辑隧道
   * @param data 编辑隧道请求参数
   * @returns Promise<EditTunnelResponse>
   */
  async editTunnel(data: EditTunnelRequest): Promise<EditTunnelResponse> {
    const response = await api.post('/api/v1/proxy/edit', data)
    return response.data
  },

  /**
   * 获取隧道状态
   * @param data 隧道状态请求参数
   * @returns Promise<TunnelStatusResponse>
   */
  async getTunnelStatus(data: TunnelStatusRequest): Promise<TunnelStatusResponse> {
    const response = await api.get('/api/v1/proxy/status', { data })
    return response.data
  },

  /**
   * 强制关闭隧道
   * @param data 关闭隧道请求参数
   * @returns Promise<CloseTunnelResponse>
   */
  async closeTunnel(data: CloseTunnelRequest): Promise<CloseTunnelResponse> {
    const response = await api.post('/api/v1/proxy/close', data)
    return response.data
  }
}

export default tunnelApi