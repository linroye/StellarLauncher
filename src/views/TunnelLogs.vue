<template>
  <div class="logs-container">
    <n-card :bordered="false" class="header-card glass">
      <template #header>
        <n-flex align="center" justify="space-between">
          <n-flex align="center" :size="8">
            <n-icon size="22" class="header-icon"><DocumentTextOutline /></n-icon>
            <n-text style="font-size: 16px; font-weight: 500;">隧道日志</n-text>
          </n-flex>
          <n-select
            v-model:value="selectedTunnelId"
            :options="tunnelOptions"
            placeholder="选择隧道"
            :default-value="'all'"
            style="width: 200px"
          />
        </n-flex>
      </template>
    </n-card>

    <!-- 单个隧道日志 -->
    <div v-if="selectedTunnelId && selectedTunnelId !== 'all'" class="logs-wrapper">
      <n-empty
        v-if="!selectedTunnelLogs.length"
        description="暂无日志数据"
      />
      <n-scrollbar v-else style="max-height: calc(100vh - 180px)">
        <div class="log-container glass">
          <div
            v-for="(log, index) in selectedTunnelLogs"
            :key="index"
            class="log-line"
            :class="log.type"
          >
            {{ log.content }}
          </div>
        </div>
      </n-scrollbar>
    </div>

    <!-- 所有隧道日志 -->
    <div v-else class="logs-wrapper">
      <n-empty
        v-if="!tunnelStatusList.length"
        description="暂无日志数据"
      />
      <n-collapse v-else>
        <n-collapse-item
          v-for="item in tunnelStatusList"
          :key="item.id"
          :title="formatTunnelTitle(item.id)"
          class="log-group glass"
        >
          <template #header-extra>
            <n-tag :type="getTunnelStatusTagType(Number(item.id))">
              {{ getTunnelStatusText(Number(item.id)) }}
            </n-tag>
          </template>

          <n-scrollbar style="max-height: 300px">
            <div class="log-container">
              <div
                v-for="(log, index) in item.status.logs"
                :key="index"
                class="log-line"
                :class="log.type"
              >
                {{ log.content }}
              </div>
            </div>
          </n-scrollbar>
        </n-collapse-item>
      </n-collapse>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  NCard, NText, NSelect, NEmpty,
  NCollapse, NCollapseItem, NTag, NScrollbar,
  NIcon, NFlex
} from 'naive-ui'
import { DocumentTextOutline } from '@vicons/ionicons5'
import { useTunnelStore } from '@/stores'
import { storeToRefs } from 'pinia'
import type { Process } from '@/stores/tunnel'

const tunnelStore = useTunnelStore()
const { process } = storeToRefs(tunnelStore)

// 选中的隧道ID
const selectedTunnelId = ref<string>('all')

// 隧道选项
const tunnelOptions = computed(() => {
  if (!process.value) return []
  return [
    {
      label: '全部隧道',
      value: 'all'
    },
    ...Object.entries(process.value).map(([id, status]) => ({
      label: `${tunnelStore.tunnels?.[id]?.ProxyName || `隧道 #${id}`} (#${id})`,
      value: id
    }))
  ]
})

// 获取选中隧道的日志
const selectedTunnelLogs = computed(() => {
  if (!selectedTunnelId.value || selectedTunnelId.value === 'all' || !process.value[selectedTunnelId.value]) {
    return []
  }
  return process.value[selectedTunnelId.value].logs
})

// 处理后的隧道状态列表
const tunnelStatusList = ref<Array<{
  id: string
  status: Process[string]
}>>([])

// 监听 Process 变化
watch(process, (newValue) => {
  if (!newValue) {
    tunnelStatusList.value = []
    return
  }
  tunnelStatusList.value = Object.entries(newValue).map(([id, status]) => ({
    id,
    status: status as Process[string]
  }))
}, { immediate: true })

// 格式化隧道标题
const formatTunnelTitle = (id: string) => {
  const tunnel = tunnelStore.tunnels?.[id]
  return tunnel ? `${tunnel.ProxyName} (#${id})` : `隧道 #${id}`
}

// 获取隧道状态标签类型
const getTunnelStatusTagType = (id: number) => {
  const status = process.value[id]?.status
  if (!status) return 'default'
  
  switch (status) {
    case 'Running':
      return 'success'
    case 'RemoteRunning':
      return 'info'
    case 'Failed':
      return 'error'
    case 'Stopped':
      return 'default'
    default:
      return 'default'
  }
}

// 获取隧道状态文本
const getTunnelStatusText = (id: number) => {
  const status = process.value[id]?.status
  if (!status) return '未运行'
  
  switch (status) {
    case 'Running':
      return '运行中'
    case 'RemoteRunning':
      return '远程运行'
    case 'Failed':
      return '异常退出'
    case 'Stopped':
      return '已停止'
    default:
      return '未运行'
  }
}
</script>

<style scoped>
.logs-container {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

.header-card {
  border-radius: 12px;
  overflow: hidden;
  position: sticky;
  top: 0;
  z-index: 10;
}

.logs-wrapper {
  flex: 1;
  padding: 0;
  margin-bottom: 16px;
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.glass:hover {
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.log-container {
  font-family: "JetBrains Mono", Monaco, Menlo, Consolas, monospace;
  padding: 12px;
  border-radius: 8px;
}

.log-line {
  padding: 4px 12px;
  line-height: 1.6;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.log-line.with-border {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.log-line:hover {
  background: rgba(255, 255, 255, 0.03);
}

.log-line.info {
  color: #2080f0;
}

.log-line.warning {
  color: #f0a020;
}

.log-line.error {
  color: #d03050;
}

.log-group {
  padding-top: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.log-group :deep(.n-collapse-item__header) {
  padding: 12px 16px;
  transition: all 0.2s ease;
}

.log-group :deep(.n-collapse-item__header:hover) {
  background: rgba(255, 255, 255, 0.05);
}

.log-group :deep(.n-collapse-item__content-wrapper) {
  padding: 0;
}

.log-group :deep(.n-collapse-item__content-inner) {
  padding: 0;
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
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .logs-container {
    padding: 8px;
  }

  .log-line {
    padding: 4px 8px;
  }
}

/* 动画效果 */
.log-line {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
