// 商品信息
export interface Product {
  id: number
  sku_id: string
  name: string
  description: string
  price: number
  plan_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  reward_action: string
  reward_value: string
}

// 商品列表响应
export interface ProductListResponse {
  code: number
  message: string
  data: Product[]
}

// 创建订单请求参数
export interface CreateOrderRequest {
  product_id: number
}

// 创建订单响应
export interface CreateOrderResponse {
  code: number
  message: string
  data: {
    order_link: string
    order_no: string
  }
}

// 订单状态枚举
export enum OrderStatus {
  /** 待支付 */
  Pending = 0,
  /** 已支付 */
  Paid = 1,
  /** 已取消 */
  Cancelled = 2,
  /** 已退款 */
  Refunded = 3
}

// 订单信息
export interface Order {
  id: number
  order_no: string
  user_id: number
  product_id: number
  product_sku_id: string
  product_name: string
  amount: number
  status: OrderStatus
  remark: string
  afdian_trade_no: {
    String: string
    Valid: boolean
  }
  reward_action: {
    String: string
    Valid: boolean
  }
  reward_value: {
    String: string
    Valid: boolean
  }
  reward_executed: boolean
  created_at: string
  updated_at: string
  paid_at: {
    Time: string
    Valid: boolean
  }
}

// 分页信息
export interface Pagination {
  page: number
  page_size: number
  pages: number
  total: number
}

// 订单列表响应
export interface OrderListResponse {
  code: number
  msg: string
  orders: Order[]
  pagination: Pagination
}

// 订单列表请求参数
export interface OrderListRequest {
  page: number
  page_size: number
}

// 订单状态请求参数
export interface OrderStatusRequest {
  order_no: string
}

// 订单状态响应
export interface OrderStatusResponse {
  code: number
  message: string
  data: {
    order_no: string
    status: OrderStatus
    amount: number
    product_name: string
    created_at: string
    paid_at: string
    reward_executed: boolean
  }
}

// 删除订单请求参数
export interface DeleteOrderRequest {
  order_no: string
}

// 删除订单响应
export interface DeleteOrderResponse {
  code: number
  message: string
} 