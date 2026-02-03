import { shopApi } from '@/api'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  OrderStatusResponse,
  Product,
  Order,
  Pagination,
  OrderListRequest
} from '@/api/types/shop'

export default defineStore('shop', () => {
  // 商品列表
  const productList = ref<Product[] | null>(null)
  
  // 订单列表
  const orderList = ref<Order[] | null>(null)
  
  // 分页信息
  const pagination = ref<Pagination>({
    page: 1,
    page_size: 10,
    pages: 1,
    total: 0
  })
  
  // 当前订单
  const currentOrderNo = ref<string | null>(null)
  const currentOrderStatus = ref<OrderStatusResponse['data'] | null>(null)
  
  // 加载状态
  const loading = ref(false)
  const creatingOrder = ref(false)
  
  // 计算属性
  const activeProducts = computed(() => {
    if (!productList.value) return []
    return productList.value.filter(product => product.is_active)
  })
  
  const currentOrder = computed(() => {
    if (!currentOrderNo.value || !orderList.value) return null
    return orderList.value.find(order => order.order_no === currentOrderNo.value) || null
  })
  
  // 按类型筛选商品
  const getProductsByAction = (action: string) => {
    if (!productList.value) return []
    return productList.value.filter(product => 
      product.is_active && product.reward_action === action
    )
  }
  
  // 按状态筛选订单
  const getOrdersByStatus = (status: number) => {
    if (!orderList.value) return []
    return orderList.value.filter(order => order.status === status)
  }
  
  // 获取商品列表
  const getProductList = async () => {
    loading.value = true
    try {
      const res = await shopApi.getProductList()
      if (res.code === 200) {
        productList.value = res.data
      } else {
        window.message.error('获取商品列表失败 ' + res.message)
      }
    } catch (error) {
      window.message.error('获取商品列表失败 ' + error)
    } finally {
      loading.value = false
    }
  }
  
  // 创建订单
  const createOrder = async (productId: number) => {
    creatingOrder.value = true
    try {
      const res = await shopApi.createOrder({ product_id: productId })
      if (res.code === 200) {
        // 创建成功后，设置当前订单号
        currentOrderNo.value = res.data.order_no
        // 返回订单数据
        return res.data
      }
      window.message.error('创建订单失败 ' + res.message)
      return null
    } catch (error) {
      window.message.error('创建订单失败 ' + error)
      return null
    } finally {
      creatingOrder.value = false
    }
  }
  
  // 获取订单列表
  const getOrderList = async (params?: OrderListRequest) => {
    loading.value = true
    try {
      const res = await shopApi.getOrderList(params)
      if (res.code === 200) {
        orderList.value = res.orders
        pagination.value = res.pagination
      } else {
        window.message.error('获取订单列表失败 ' + res.msg)
      }
    } catch (error) {
      window.message.error('获取订单列表失败 ' + error)
    } finally {
      loading.value = false
    }
  }
  
  // 查询订单状态
  const getOrderStatus = async (orderNo: string) => {
    loading.value = true
    try {
      const res = await shopApi.getOrderStatus({ order_no: orderNo })
      if (res.code === 200) {
        currentOrderNo.value = orderNo
        currentOrderStatus.value = res.data
        return res.data
      } else {
        window.message.error(`查询订单 ${orderNo} 状态失败 ` + res.message)
      }
      return null
    } catch (error) {
      window.message.error(`查询订单 ${orderNo} 状态失败 ` + error)
      return null
    } finally {
      loading.value = false
    }
  }
  
  // 删除订单
  const deleteOrder = async (orderNo: string) => {
    loading.value = true
    try {
      const res = await shopApi.deleteOrder({ order_no: orderNo })
      if (res.code === 200) {
        // 删除成功后刷新列表
        await getOrderList({
          page: pagination.value.page,
          page_size: pagination.value.page_size
        })
        window.message.success('删除订单成功')
        return true
      } else {
        window.message.error('删除订单失败 ' + res.message)
      }
      return false
    } catch (error) {
      window.message.error('删除订单失败 ' + error)
      return false
    } finally {
      loading.value = false
    }
  }
  
  // 设置当前订单
  const setCurrentOrder = (orderNo: string | null) => {
    currentOrderNo.value = orderNo
    if (orderNo) {
      getOrderStatus(orderNo)
    } else {
      currentOrderStatus.value = null
    }
  }
  
  // 初始化，获取商品列表和订单列表
  getProductList()
  getOrderList()
  
  return {
    // 状态
    productList,
    orderList,
    pagination,
    currentOrderNo,
    currentOrderStatus,
    loading,
    creatingOrder,
    
    // 计算属性
    activeProducts,
    currentOrder,
    
    // 方法
    getProductsByAction,
    getOrdersByStatus,
    getProductList,
    createOrder,
    getOrderList,
    getOrderStatus,
    setCurrentOrder,
    deleteOrder
  }
}) 