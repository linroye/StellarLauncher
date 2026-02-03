import api from './request'
import type {
  NodeListResponse,
  NodeInfoResponse
} from './types/node'

/**
 * 节点相关API
 */
export const nodeApi = {
  /**
   * 获取节点列表
   * @returns Promise<NodeListResponse>
   */
  async getNodeList(): Promise<NodeListResponse> {
    const response = await api.get('/api/v1/nodes/get')
    return response.data
  },

  /**
   * 获取节点信息
   * @returns Promise<NodeInfoResponse>
   */
  async getNodeInfo(): Promise<NodeInfoResponse> {
    const response = await api.get('/api/v1/nodes/info')
    return response.data
  }
}

export default nodeApi 