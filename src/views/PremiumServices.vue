<template>
  <div class="premium-services">
    <n-card :bordered="false" class="header-card glass">
      <template #header>
        <n-flex align="center">
          <n-icon size="22" class="header-icon"><CartOutline /></n-icon>
          <n-text strong style="font-size: 16px; font-weight: 500;">增值服务</n-text>
        </n-flex>
      </template>

      <n-tabs 
        type="line" 
        animated
        :value="activeTab"
        @update:value="handleTabChange"
      >
        <n-tab-pane name="products" tab="商品列表">
          <n-flex justify="end" style="margin-bottom: 16px">
            <n-button type="primary" :loading="shopStore.loading" @click="shopStore.getProductList()">
              <template #icon>
                <n-icon><RefreshOutline /></n-icon>
              </template>
              刷新
            </n-button>
          </n-flex>

          <!-- 商品列表 -->
          <n-empty 
            description="暂无商品数据" 
            v-show="!shopStore.loading && !shopStore.activeProducts.length"
          />
          
  <div>
            <n-grid
              v-show="shopStore.loading || shopStore.activeProducts.length"
              :cols="cols"
              responsive="screen"
              :x-gap="16"
              :y-gap="16"
            >
              <n-grid-item
                v-for="product in shopStore.activeProducts"
                :key="product.id"
              >
                <n-card class="product-card glass">
                  <template #header>
                    <n-flex align="center" justify="space-between">
                      <n-text strong class="product-name">{{ product.name }}</n-text>
                      <n-tag :bordered="false" type="primary" size="small">
                        ¥{{ product.price.toFixed(2) }}
                      </n-tag>
                    </n-flex>
                  </template>

                  <n-flex vertical class="product-content">
                    <div class="product-description">
                      {{ product.description }}
                    </div>
                  </n-flex>

                  <template #footer>
                    <n-flex justify="end">
                      <n-button 
                        type="primary" 
                        secondary 
                        round 
                        @click="handlePurchase(product)"
                      >
                        <template #icon>
                          <n-icon><CartOutline /></n-icon>
                        </template>
                        购买
                      </n-button>
                    </n-flex>
                  </template>
                </n-card>
              </n-grid-item>
            </n-grid>
          </div>
        </n-tab-pane>

        <n-tab-pane name="orders" tab="订单记录">
          <n-flex justify="end" style="margin-bottom: 16px">
            <n-button type="primary" :loading="shopStore.loading" @click="shopStore.getOrderList()">
              <template #icon>
                <n-icon><RefreshOutline /></n-icon>
              </template>
              刷新
            </n-button>
          </n-flex>

          <n-data-table
            class="order-table glass"
            :columns="columns"
            :data="shopStore.orderList || []"
            :loading="shopStore.loading"
            :pagination="{
              page: shopStore.pagination.page,
              pageSize: shopStore.pagination.page_size,
              pageCount: shopStore.pagination.pages,
              itemCount: shopStore.pagination.total,
              onUpdatePage: (page) => shopStore.getOrderList({ page, page_size: shopStore.pagination.page_size }),
              onUpdatePageSize: (pageSize) => shopStore.getOrderList({ page: 1, page_size: pageSize })
            }"
          />
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 创建订单对话框 -->
    <n-modal v-model:show="showCreateModal" preset="dialog" title="确认购买" style="max-width: 600px">
      <template #header>
        <n-flex align="center">
          <n-icon size="22" class="header-icon"><CartOutline /></n-icon>
          <n-text strong style="font-size: 16px; font-weight: 500;">确认购买</n-text>
        </n-flex>
      </template>
      <n-form
        ref="formRef"
        label-placement="left"
        label-width="auto"
        require-mark-placement="right-hanging"
        size="medium"
      >
        <n-form-item label="商品名称">
          <n-text>{{ selectedProduct?.name }}</n-text>
        </n-form-item>
        <n-form-item label="商品价格">
          <n-text type="primary">¥{{ selectedProduct ? selectedProduct.price.toFixed(2) : '0.00' }}</n-text>
        </n-form-item>
      </n-form>
      <template #action>
        <n-button
          type="primary"
          :loading="shopStore.creatingOrder"
          @click="handleConfirmPurchase"
        >
          确认购买
        </n-button>
      </template>
    </n-modal>

    <!-- 支付对话框 -->
    <n-modal v-model:show="showPayModal" preset="dialog" title="订单支付" :closable="false">
      <template #header>
        <n-flex align="center">
          <n-icon size="22" class="header-icon"><WalletOutline /></n-icon>
          <n-text strong style="font-size: 16px; font-weight: 500;">请使用爱发电完成支付</n-text>
        </n-flex>
      </template>
      <n-flex vertical justify="center" align="center" class="pay-content">
        <n-text>订单号：{{ currentOrderLink?.order_no }}</n-text>
        <n-button
          type="primary"
          style="margin-top: 16px"
          @click="openPayLink"
        >
          前往支付
        </n-button>
      </n-flex>
    </n-modal>

    <!-- 删除订单对话框 -->
    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="warning"
      title="确认删除"
      content="确定要删除该订单吗？此操作不可恢复。"
      positive-text="确认"
      negative-text="取消"
      @positive-click="confirmDelete"
      @negative-click="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h } from 'vue'
import { 
  NButton, NIcon, NTooltip, NPagination, NEmpty, NText, NFlex,
  NGrid, NGridItem, NCard, useMessage, NDataTable, NModal, NForm,
  NFormItem, NInput, NTag, NTabs, NTabPane
} from 'naive-ui'
import { 
  RefreshOutline, CartOutline, DocumentTextOutline, 
  WalletOutline 
} from '@vicons/ionicons5'
import { useShopStore } from '@/stores'
import { useResponsiveGrid } from '@/composables/useResponsiveGrid'
import type { DataTableColumns, FormInst } from 'naive-ui'
import type { Order, Product } from '@/api/types/shop'
import { OrderStatus } from '@/api/types/shop'
import { openUrl } from '@tauri-apps/plugin-opener'

const shopStore = useShopStore()
const message = useMessage()

const { cols } = useResponsiveGrid({
  default: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  '2xl': 4
})

// 状态
const activeTab = ref('products')
const showCreateModal = ref(false)
const showPayModal = ref(false)
const showDeleteModal = ref(false)
const selectedProduct = ref<Product | null>(null)
const currentOrderLink = ref<{ order_no: string; order_link: string } | null>(null)
const pendingDeleteOrderNo = ref<string | null>(null)
const formRef = ref<FormInst | null>(null)

// 处理标签页切换
const handleTabChange = (value: string) => {
  activeTab.value = value
  if (value === 'orders') {
    shopStore.getOrderList()
  } else if (value === 'products') {
    shopStore.getProductList()
  }
}

// 处理删除订单
const handleDelete = (orderNo: string) => {
  pendingDeleteOrderNo.value = orderNo
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (pendingDeleteOrderNo.value) {
    const success = await shopStore.deleteOrder(pendingDeleteOrderNo.value)
    if (success) {
      showDeleteModal.value = false
      pendingDeleteOrderNo.value = null
    }
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  pendingDeleteOrderNo.value = null
}

// 表格列定义
const columns: DataTableColumns<Order> = [
  {
    title: '订单号',
    key: 'order_no',
    width: 180
  },
  {
    title: '商品名称',
    key: 'product_name'
  },
  {
    title: '金额',
    key: 'amount',
    render(row) {
      return `¥${row.amount.toFixed(2)}`
    }
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      const statusMap = {
        [OrderStatus.Pending]: { text: '待支付', type: 'warning' as const },
        [OrderStatus.Paid]: { text: '已支付', type: 'success' as const },
        [OrderStatus.Cancelled]: { text: '已取消', type: 'error' as const },
        [OrderStatus.Refunded]: { text: '已退款', type: 'info' as const }
      }
      const status = statusMap[row.status] || { text: '未知', type: 'default' as const }
      return h(NTag, { type: status.type }, { default: () => status.text })
    }
  },
  {
    title: '创建时间',
    key: 'created_at',
    render(row) {
      return new Date(row.created_at).toLocaleString()
    }
  },
  {
    title: '支付时间',
    key: 'paid_at',
    render(row) {
      return row.paid_at.Valid ? new Date(row.paid_at.Time).toLocaleString() : '-'
    }
  },
  {
    title: '操作',
    key: 'actions',
    render(row) {
      const actions = []
      
      if (row.status === OrderStatus.Pending) {
        actions.push(
          h(
            NButton,
            {
              size: 'small',
              style: 'margin-right: 8px',
              onClick: () => handleRetryPay(row)
            },
            { default: () => '继续支付' }
          )
        )
      }
      
      actions.push(
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            onClick: () => handleDelete(row.order_no)
          },
          { default: () => '删除' }
        )
      )
      
      return actions
    }
  }
]

// 处理购买
const handlePurchase = (product: Product) => {
  selectedProduct.value = product
  showCreateModal.value = true
}

// 确认购买
const handleConfirmPurchase = async () => {
  if (!selectedProduct.value) return
  
  const orderData = await shopStore.createOrder(selectedProduct.value.id)
  if (orderData) {
    showCreateModal.value = false
    currentOrderLink.value = orderData
    showPayModal.value = true
  }
}

// 打开支付链接
const openPayLink = async () => {
  if (!currentOrderLink.value) return
  await openUrl(currentOrderLink.value.order_link)
}

// 继续支付
const handleRetryPay = async (order: Order) => {
  const orderData = await shopStore.createOrder(order.product_id)
  if (orderData) {
    currentOrderLink.value = orderData
    showPayModal.value = true
  }
}
</script>

<style scoped>
.premium-services {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  /* 确保滚动条始终显示，防止跳动 */
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

.header-card {
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 0;
  z-index: 10;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
}

.services-content {
  flex: 1;
  padding: 0 0 24px 0;
}

.header-icon {
  margin-right: 8px;
  color: var(--primary-color);
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass:hover {
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.product-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: cardEnter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-name {
  font-size: 16px;
  line-height: 1.5;
  margin-right: 8px;
}

.product-content {
  gap: 12px;
}

.product-description {
  font-size: 14px;
  color: var(--text-color-2);
  line-height: 1.6;
  margin-bottom: 8px;
}

.product-card :deep(.n-card-footer) {
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover :deep(.n-card-footer) {
  opacity: 1;
  transform: translateY(0);
}

.product-card :deep(.n-button) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card :deep(.n-button:hover) {
  transform: scale(1.1);
}

.order-table {
  margin-top: 8px;
}

.pay-content {
  padding: 24px 0;
}

@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .premium-services {
    padding: 8px;
  }
  
  .header-card {
    margin-bottom: 8px;
  }

  .product-card {
    margin: 8px;
  }
}
</style>
