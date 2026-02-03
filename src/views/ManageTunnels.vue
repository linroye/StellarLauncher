<template>
  <div>
    <n-card :bordered="false" class="header-card">
      <template #header>
        <n-text strong>隧道管理</n-text>
      </template>
      <template #header-extra>
        <n-flex>
          <n-button type="primary" :loading="tunnelStore.loading" @click="tunnelStore.getTunnels()">
            <template #icon>
              <n-icon><RefreshOutline /></n-icon>
            </template>
            刷新
          </n-button>
          <n-button type="primary" @click="handleCreate">
            <template #icon>
              <n-icon><AddCircleOutline /></n-icon>
            </template>
            创建隧道
          </n-button>
        </n-flex>
      </template>

      <n-empty description="暂无隧道数据" v-show="!tunnelStore.loading && !Object.keys(tunnelStore.tunnels || {}).length" />
      
      <div>
        <n-grid
          v-show="tunnelStore.loading || Object.keys(tunnelStore.tunnels || {}).length"
          :cols="cols"
          responsive="screen"
          :x-gap="12"
          :y-gap="12"
        >
          <n-grid-item
            v-for="tunnel in Object.values(tunnelStore.tunnels || {})"
            :key="tunnel.Id"
          >
            <n-card
              class="tunnel-card glass"
            >
              <template #header>
                <n-flex align="center">
                  <n-badge 
                    :dot="true"
                    :type="getTunnelStatusType(tunnel.Id)"
                    :color="getTunnelStatusColor(tunnel.Id)"
                    style="margin-right: 8px"
                  />
                  <n-text strong style="margin-right: 8px">{{ tunnel.ProxyName }}</n-text>
                  <n-text depth="3" style="font-size: 0.9em">#{{ tunnel.Id }}</n-text>
                </n-flex>
              </template>
              <template #header-extra>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-switch
                      :value="isTunnelRunning(tunnel.Id)"
                      :loading="closingStatus[tunnel.Id]"
                      @update:value="(value) => handleStatusChange(tunnel, value)"
                      size="small"
                    />
                  </template>
                  {{ getTunnelStatusTip(tunnel.Id) }}
                </n-tooltip>
              </template>

              <n-flex vertical>
                <div class="tunnel-info-item">
                  <n-text depth="3">节点：</n-text>
                  <n-text>{{ tunnel.NodeName }}</n-text>
                </div>

                <div class="tunnel-info-item">
                  <n-text depth="3">类型：</n-text>
                  <n-text>{{ tunnel.ProxyType }}</n-text>
                </div>

                <div class="tunnel-info-item">
                  <n-text depth="3">地址：</n-text>
                  <n-text>{{ tunnel.LocalIp }}:{{ tunnel.LocalPort }} → :{{ tunnel.RemotePort }}</n-text>
                </div>

                <div class="tunnel-info-item">
                  <n-text depth="3">链接：</n-text>
                  <n-ellipsis style="max-width: 80%; display: inline-block">
                    <n-text class="link" @click="copyText(tunnel.Link)">{{ tunnel.Link }}</n-text>
                  </n-ellipsis>
                </div>

                <div class="tunnel-info-item">
                  <n-text depth="3">域名：</n-text>
                  <n-ellipsis style="max-width: 80%; display: inline-block">
                    <n-text class="link" @click="copyText(tunnel.Domains)">{{ tunnel.Domains || '-' }}</n-text>
                  </n-ellipsis>
                </div>
              </n-flex>

              <template #footer>
                <n-flex justify="end" class="action-buttons">
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-button quaternary circle size="small" @click="handleDetail(tunnel)">
                        <template #icon><n-icon><InformationCircleOutline /></n-icon></template>
                      </n-button>
                    </template>
                    查看详情
                  </n-tooltip>

                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-button quaternary circle size="small" @click="handleEdit(tunnel)">
                        <template #icon><n-icon><SettingsOutline /></n-icon></template>
                      </n-button>
                    </template>
                    编辑隧道
                  </n-tooltip>

                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-button
                        quaternary
                        circle
                        size="small"
                        type="error"
                        @click="handleDelete(Number(tunnel.Id))"
                      >
                        <template #icon><n-icon><TrashOutline /></n-icon></template>
                      </n-button>
                    </template>
                    删除隧道
                  </n-tooltip>
                </n-flex>
              </template>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>

      <n-flex justify="center" style="margin-top: 16px">
        <n-pagination
          v-model:page="tunnelStore.pagination.page"
          v-model:page-size="tunnelStore.pagination.page_size"
          :page-count="tunnelStore.pagination.pages"
          :page-sizes="[10, 20, 30, 40]"
          show-size-picker
          @update:page="(page) => tunnelStore.getTunnels(page, tunnelStore.pagination.page_size)"
          @update:page-size="(size) => tunnelStore.getTunnels(1, size)"
        >
          <template #prefix="{ itemCount }">
            共 {{ itemCount ?? 0 }} 条
          </template>
        </n-pagination>
      </n-flex>
    </n-card>

    <n-modal
      v-model:show="showDeleteModal"
      preset="dialog"
      type="warning"
      title="确认删除"
      content="确定要删除该隧道吗？此操作不可恢复。"
      positive-text="确认"
      negative-text="取消"
      @positive-click="confirmDelete"
      @negative-click="cancelDelete"
    />

    <n-modal
      v-model:show="showForceCloseModal"
      preset="dialog"
      type="warning"
      title="确认强制关闭"
      content="该隧道正在其他客户端运行中，确定要强制关闭吗？"
      positive-text="确认"
      negative-text="取消"
      @positive-click="confirmForceClose"
      @negative-click="cancelForceClose"
    />

    <!-- 添加详情模态框 -->
    <n-modal v-model:show="showDetailModal" style="width: 800px">
      <n-card
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header>
          <n-text strong>隧道详情</n-text>
        </template>
        
        <n-descriptions v-if="selectedTunnel" bordered :column="3">
          <n-descriptions-item label="隧道ID">
            {{ selectedTunnel.Id }}
          </n-descriptions-item>
          <n-descriptions-item label="隧道名称">
            {{ selectedTunnel.ProxyName }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="selectedTunnel.Status === 'online' ? 'success' : 'default'">
              {{ selectedTunnel.Status === 'online' ? '在线' : '离线' }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="节点">
            {{ selectedTunnel.NodeName }}
          </n-descriptions-item>
          <n-descriptions-item label="类型">
            {{ selectedTunnel.ProxyType }}
          </n-descriptions-item>
          <n-descriptions-item label="本地地址">
            {{ selectedTunnel.LocalIp }}:{{ selectedTunnel.LocalPort }}
          </n-descriptions-item>
          <n-descriptions-item label="远程端口">
            {{ selectedTunnel.RemotePort }}
          </n-descriptions-item>
          <n-descriptions-item label="链接">
            <n-ellipsis style="max-width: 100%">
              <n-text class="link" @click="copyText(selectedTunnel.Link)">
                {{ selectedTunnel.Link }}
              </n-text>
            </n-ellipsis>
          </n-descriptions-item>
          <n-descriptions-item label="域名" v-if="selectedTunnel.Domains">
            <n-ellipsis style="max-width: 100%">
              <n-text class="link" @click="copyText(selectedTunnel.Domains)">
                {{ selectedTunnel.Domains }}
              </n-text>
            </n-ellipsis>
          </n-descriptions-item>
          <n-descriptions-item label="当前连接数">
            {{ (tunnelStatus || {})[selectedTunnel.Id]?.curConns || 0 }}
          </n-descriptions-item>
          <n-descriptions-item label="最后启动时间">
            {{ formatDate((tunnelStatus || {})[selectedTunnel.Id]?.lastStartTime) }}
          </n-descriptions-item>
          <n-descriptions-item label="最后关闭时间">
            {{ formatDate((tunnelStatus || {})[selectedTunnel.Id]?.lastCloseTime) }}
          </n-descriptions-item>
          <n-descriptions-item label="今日流入流量">
            {{ formatTraffic((tunnelStatus || {})[selectedTunnel.Id]?.todayTrafficIn) }}
          </n-descriptions-item>
          <n-descriptions-item label="今日流出流量">
            {{ formatTraffic((tunnelStatus || {})[selectedTunnel.Id]?.todayTrafficOut) }}
          </n-descriptions-item>
          <n-descriptions-item label="创建时间">
            {{ formatDate(selectedTunnel.CreatedAt) }}
          </n-descriptions-item>
          <n-descriptions-item label="更新时间">
            {{ formatDate(selectedTunnel.UpdatedAt) }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>
    </n-modal>

    <!-- 添加编辑模态框 -->
    <n-modal v-model:show="showEditModal" preset="card" :bordered="false" style="width: 800px;"> 
      <tunnel-form
        ref="tunnelFormRef"
        v-if="editingTunnel"
        v-model:form-value="editForm.state.value.formValue"
        :rules="editForm.rules.value"
        :is-http-or-https="editForm.isHttpOrHttps.value"
        v-model:show-advanced="editForm.state.value.showAdvanced"
        :selected-type="editForm.state.value.selectedType"
        :node-id="editForm.state.value.selectedNodeId"
        :generate-random-name="editForm.generateRandomName"
        :generate-random-port="editForm.generateRandomPort"
        :is-edit="true"
        @submit="handleEditSubmit"
      >
        <template #submit-text>保存修改</template>
      </tunnel-form>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NButton, NIcon, NTooltip, NEllipsis, NPagination, NEmpty, 
  NText, NSwitch, NFlex, NGrid, NGridItem, NCard, NBadge, useMessage,
  NDescriptions, NDescriptionsItem, NTag
} from 'naive-ui'
import { 
  AddCircleOutline, SettingsOutline, TrashOutline, RefreshOutline, 
  InformationCircleOutline, SwapHorizontalOutline 
} from '@vicons/ionicons5'
import { useTunnelStore, useUtilsStore, useAuthStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { useTunnelForm } from '@/composables/useTunnelForm'
import { useResponsiveGrid } from '@/composables/useResponsiveGrid'
import TunnelForm from '@/components/tunnel/TunnelForm.vue'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'

const router = useRouter()
const message = useMessage()
const tunnelStore = useTunnelStore()
const utilsStore = useUtilsStore()
const authStore = useAuthStore()
const { tunnelStatus, process } = storeToRefs(tunnelStore)
const { formatTraffic, formatDate } = utilsStore

const { cols } = useResponsiveGrid({
  default: 1,
  sm: 1,
  md: 2,
  lg: 3,
  xl: 4,
  '2xl': 4
})

// 状态
const showDeleteModal = ref(false)
const showForceCloseModal = ref(false)
const pendingDeleteId = ref<number | null>(null)
const pendingForceCloseId = ref<number | null>(null)
const closingStatus = ref<Record<number, boolean>>({})

// 添加详情相关的状态
const showDetailModal = ref(false)
const selectedTunnel = ref<any>(null)

// 编辑相关状态
const showEditModal = ref(false)
const editingTunnel = ref<any>(null)
const tunnelFormRef = ref(null)
const editForm = useTunnelForm()

// 方法
const handleCreate = () => {
  router.push('/create-tunnel')
}

const handleEdit = (tunnel: any) => {
  editingTunnel.value = tunnel
  editForm.state.value = {
    selectedNodeId: tunnel.NodeId.toString(),
    selectedType: tunnel.ProxyType,
    showAdvanced: false,
    formValue: {
      nodeId: tunnel.NodeId,
      proxyName: tunnel.ProxyName,
      localIp: tunnel.LocalIp,
      localPort: tunnel.LocalPort,
      remotePort: tunnel.RemotePort,
      domain: tunnel.Domains || '',
      proxyType: tunnel.ProxyType,
      accessKey: tunnel.AccessKey || '',
      hostHeaderRewrite: tunnel.HostHeaderRewrite || '',
      headerXFromWhere: tunnel.HeaderXFromWhere || '',
      proxyProtocolVersion: tunnel.ProxyProtocolVersion || '',
      useEncryption: tunnel.UseEncryption,
      useCompression: tunnel.UseCompression
    }
  }
  showEditModal.value = true
}

const handleDelete = (id: number) => {
  pendingDeleteId.value = id
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (pendingDeleteId.value !== null) {
    const success = await tunnelStore.deleteTunnel(pendingDeleteId.value)
    if (success) {
      showDeleteModal.value = false
      pendingDeleteId.value = null
    }
    // 删除失败时保持模态框打开，让用户可以重试
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  pendingDeleteId.value = null
}

const handleDetail = (tunnel: any) => {
  selectedTunnel.value = tunnel
  showDetailModal.value = true
}

const copyText = async (text: string) => {
  if (!text) return
  await writeText(text)
  message.success('复制成功')
}

// 获取隧道状态类型
const getTunnelStatusType = (id: number) => {
  const status = process.value[id]?.status
  if (!status) return 'default'
  
  switch (status) {
    case 'Running':
      return 'success'
    case 'RemoteRunning':
      return 'info'
    case 'Failed':
      return 'error'
    default:
      return 'default'
  }
}

// 获取隧道状态颜色
const getTunnelStatusColor = (id: number) => {
  const status = process.value[id]?.status
  if (!status) return '#86909c5f'
  
  switch (status) {
    case 'Running':
      return undefined // 使用默认的成功色
    case 'RemoteRunning':
      return '#2080f0' // 使用信息色
    case 'Failed':
      return undefined // 使用默认的错误色
    default:
      return '#86909c5f'
  }
}

// 获取隧道状态提示
const getTunnelStatusTip = (id: number) => {
  const status = process.value[id]?.status
  if (!status) return '隧道未运行'
  
  switch (status) {
    case 'Running':
      return '点击停止隧道'
    case 'RemoteRunning':
      return '点击强制关闭隧道'
    case 'Failed':
      return '隧道运行失败'
    case 'Stopped':
      return '点击启动隧道'
    default:
      return '隧道未运行'
  }
}

// 判断隧道是否运行中
const isTunnelRunning = (id: number) => {
  const status = process.value[id]?.status
  return status === 'Running' || status === 'RemoteRunning'
}

// 处理状态变更
const handleStatusChange = async (tunnel: any, value: boolean) => {
  const id = tunnel.Id
  const status = process.value[id]?.status

  if (value) {
    // 启动隧道
    closingStatus.value[id] = true
    try {
      const success = await tunnelStore.startTunnel(id, authStore.token!)
      if (!success) {
        message.error('启动隧道失败')
      }
    } finally {
      closingStatus.value[id] = false
    }
  } else {
    // 关闭隧道
    if (status === 'RemoteRunning') {
      // 如果是远程运行，显示强制关闭确认框
      pendingForceCloseId.value = id
      showForceCloseModal.value = true
    } else {
      // 本地运行，直接停止
      closingStatus.value[id] = true
      try {
        tunnelStore.stopTunnel(id)
      } finally {
        closingStatus.value[id] = false
      }
    }
  }
}

// 确认强制关闭
const confirmForceClose = async () => {
  const id = pendingForceCloseId.value
  if (id !== null) {
    closingStatus.value[id] = true
    try {
      const success = await tunnelStore.closeTunnel(id)
      if (success) {
        showForceCloseModal.value = false
        pendingForceCloseId.value = null
      }
    } finally {
      tunnelStore.process[id].status = 'Stopped'
      closingStatus.value[id] = false
    }
  }
}

// 取消强制关闭
const cancelForceClose = () => {
  showForceCloseModal.value = false
  pendingForceCloseId.value = null
}

// 处理编辑提交
const handleEditSubmit = async () => {
  if (!editingTunnel.value) return
  
  try {
    const success = await tunnelStore.editTunnel({
      id: editingTunnel.value.Id,
      ...editForm.state.value.formValue
    })
    
    if (success) {
      showEditModal.value = false
      editingTunnel.value = null
      // 刷新隧道列表
      tunnelStore.getTunnels()
    }
  } catch (error) {
    message.error('修改失败')
  }
}
</script>

<style scoped>
.header-card {
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 0;
  z-index: 10;
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

.tunnel-card {
  height: 100%;
  transition: all 0.15s ease;
  cursor: pointer;
  border-radius: 12px;
  overflow: visible; /* 允许内容溢出，以显示阴影效果 */
  transform-origin: center;
  position: relative; /* 确保z-index生效 */
}

.tunnel-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.tunnel-card.selected {
  border-color: #18a058;
  box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.2);
  animation: pulse 1s infinite;
  transform: translateY(-2px);
  z-index: 2; /* 确保选中的卡片在最上层 */
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(24, 160, 88, 0.4); }
  70% { box-shadow: 0 0 0 4px rgba(24, 160, 88, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 160, 88, 0); }
}

.tunnel-info-item {
  padding: 4px 0;
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.link {
  color: var(--n-primary-color);
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.link:hover {
  color: var(--n-primary-color-hover);
}

.link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--n-primary-color);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.action-buttons {
  gap: 4px;
  opacity: 0;
  transform: translateY(4px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tunnel-card:hover .action-buttons {
  opacity: 1;
  transform: translateY(0);
}

.action-buttons :deep(button) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-buttons :deep(button:hover) {
  transform: scale(1.1);
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
  .tunnels-container {
    padding: 8px;
  }
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

/* 编辑模态框样式 */
.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(24, 160, 88, 0.1);
  color: #18a058;
}

:deep(.n-modal) {
  --n-card-color: var(--n-color);
}

:deep(.n-card-header) {
  padding: 16px 24px;
  border-bottom: 1px solid var(--n-border-color);
  background: var(--n-card-color);
}

:deep(.n-card__content) {
  padding: 24px;
  background: var(--n-card-color);
}

:deep(.n-card) {
  background: var(--n-card-color) !important;
}
</style>