import api from './request'
import type {
  ProductListResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderListResponse,
  OrderListRequest,
  OrderStatusRequest,
  OrderStatusResponse,
  DeleteOrderRequest,
  DeleteOrderResponse
} from './types/shop'

/**
 * 商品相关API
 */
export const shopApi = {
  /**
   * 获取商品列表
   * @returns Promise<ProductListResponse>
   */
  async getProductList(): Promise<ProductListResponse> {
    const response = await api.get('/api/v1/shop/products')
    return response.data
  },

  /**
   * 创建订单
   * @param data 创建订单请求参数
   * @returns Promise<CreateOrderResponse>
   */
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await api.post('/api/v1/shop/order/create', data)
    return response.data
  },

  /**
   * 获取用户订单列表
   * @param params 分页参数
   * @returns Promise<OrderListResponse>
   */
  async getOrderList(params: OrderListRequest = { page: 1, page_size: 10 }): Promise<OrderListResponse> {
    const response = await api.get('/api/v1/shop/orders', { params })
    return response.data
  },

  /**
   * 查询订单状态
   * @param params 订单状态请求参数
   * @returns Promise<OrderStatusResponse>
   */
  async getOrderStatus(params: OrderStatusRequest): Promise<OrderStatusResponse> {
    const response = await api.get('/api/v1/shop/order/status', { params })
    return response.data
  },

  /**
   * 删除订单
   * @param data 删除订单请求参数
   * @returns Promise<DeleteOrderResponse>
   */
  async deleteOrder(data: DeleteOrderRequest): Promise<DeleteOrderResponse> {
    const response = await api.post('/api/v1/shop/order/delete', data)
    return response.data
  }
}

export default shopApi 