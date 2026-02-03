<template>
  <div class="dashboard-container">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <n-flex vertical :size="10" justify="center">
        <div class="welcome-container">
          <div class="user-avatar">
            <n-avatar round size="large" :src="userStore.avatar"/>
          </div>
          <div class="welcome-text">
            <n-text class="user-name">{{ userStore.userInfo?.Username || '用户' }}</n-text>
            <n-text depth="3" class="welcome-message">欢迎使用 StellarLauncher</n-text>
          </div>
        </div>
        
        <!-- 签到区域 -->
        <div v-if="checkinStore.checkinStatus" class="checkin-card">
          <n-flex justify="space-between" align="center">
            <n-flex vertical>
              <n-text class="checkin-title">每日签到</n-text>
              <n-text class="checkin-stats">已连续签到 {{ checkinStore.continuityDays }} 天</n-text>
            </n-flex>
            <n-button 
              quaternary
              size="small"
              :disabled="checkinStore.hasCheckedToday"
              :loading="checkinStore.checkinInProgress"
              @click="handleCheckin"
              class="checkin-button"
            >
              <n-badge v-if="!checkinStore.hasCheckedToday" dot>
                {{ checkinStore.hasCheckedToday ? '已签到' : '立即签到' }}
              </n-badge>
              <template v-else>已签到</template>
            </n-button>
          </n-flex>
        </div>
      </n-flex>
    </div>
    
    <!-- 统计卡片区域 -->
    <div class="statistics-section">
      <n-grid :x-gap="16" :y-gap="16" :cols="4">
        <!-- 资源统计卡片 -->
        <n-grid-item span="2 1000:1">
          <n-card class="stat-card glass" title="账户资源">
            <template #header-extra>
              <n-icon size="18"><BagHandleOutline /></n-icon>
            </template>
            <n-space vertical size="small">
              <n-flex justify="space-between" align="center">
                <n-text>已用流量</n-text>
                <n-text class="stat-value used">{{ utilsStore.formatTraffic(userStore.userInfo?.UsedTraffic) }}</n-text>
              </n-flex>
              <n-flex justify="space-between" align="center">
                <n-text>总流量</n-text>
                <n-text class="stat-value">{{ utilsStore.formatTraffic(userStore.userInfo?.Traffic) }}</n-text>
              </n-flex>
              <n-progress 
                type="line" 
                :percentage="trafficPercentage" 
                :indicator-placement="'inside'"
                :color="trafficColor"
                :height="12"
                border-radius="6px"
                :processing="trafficPercentage < 100"
              >
                <span>{{ trafficPercentage }}% 已使用</span>
              </n-progress>
            </n-space>
          </n-card>
        </n-grid-item>
        
        <!-- 隧道统计 -->
        <n-grid-item span="2 1000:1">
          <n-card class="stat-card glass" title="隧道统计">
            <template #header-extra>
              <n-icon size="18"><SwapHorizontalOutline /></n-icon>
            </template>
            <n-flex align="center" justify="space-around">
              <n-statistic label="在线隧道">
                <div class="stat-count online">
                  <n-number-animation 
                    ref="onlineTunnelsAnimation" 
                    :from="0" 
                    :to="tunnelStore.onlineTunnels.length"
                    :duration="1000"
                  />
                </div>
              </n-statistic>
              <n-divider vertical />
              <n-statistic label="总隧道数">
                <div class="stat-count">
                  <n-number-animation 
                    ref="totalTunnelsAnimation" 
                    :from="0" 
                    :to="tunnelStore.tunnelsArray.length"
                    :duration="1000"
                  />
                </div>
              </n-statistic>
            </n-flex>
          </n-card>
        </n-grid-item>
        
        <!-- 节点状态 -->
        <n-grid-item span="2 1000:1">
          <n-card class="stat-card glass" title="节点状态">
            <template #header-extra>
              <n-icon size="18"><ServerOutline /></n-icon>
            </template>
            <n-flex align="center" justify="space-around">
              <n-statistic label="在线节点">
                <div class="stat-count online">
                  <n-number-animation 
                    ref="onlineNodesAnimation" 
                    :from="0" 
                    :to="nodeStore.onlineNodes.length"
                    :duration="1000"
                  />
                </div>
              </n-statistic>
              <n-divider vertical />
              <n-statistic label="总节点数">
                <div class="stat-count">
                  <n-number-animation 
                    ref="totalNodesAnimation" 
                    :from="0" 
                    :to="nodeStore.nodesArray.length"
                    :duration="1000"
                  />
                </div>
              </n-statistic>
            </n-flex>
          </n-card>
        </n-grid-item>
        
        <!-- 用户信息 -->
        <n-grid-item span="2 1000:1">
          <n-card class="stat-card glass" title="账户信息">
            <template #header-extra>
              <n-icon size="18"><PersonOutline /></n-icon>
            </template>
            <n-space vertical>
              <n-flex justify="space-between">
                <n-text>用户ID</n-text>
                <n-text>{{ userStore.userInfo?.ID || '-' }}</n-text>
              </n-flex>
              <n-flex justify="space-between">
                <n-text>邮箱</n-text>
                <div>
                  <n-tooltip trigger="hover" placement="top">
                    <template #trigger>
                      <span>
                        <n-ellipsis style="max-width: 150px">
                          {{ userStore.userInfo?.Email || '-' }}
                        </n-ellipsis>
                      </span>
                    </template>
                    {{ userStore.userInfo?.Email || '-' }}
                  </n-tooltip>
                </div>
              </n-flex>
              <n-flex justify="space-between">
                <n-text>注册时间</n-text>
                <n-text>{{ utilsStore.formatDate(userStore.userInfo?.RegisterTime) }}</n-text>
              </n-flex>
            </n-space>
          </n-card>
        </n-grid-item>
      </n-grid>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  NCard, 
  NButton, 
  NFlex, 
  NText, 
  NAvatar,
  NStatistic,
  NDivider,
  NGrid,
  NGridItem,
  NSpace,
  NProgress,
  NIcon,
  NNumberAnimation,
  NTooltip,
  NBadge,
  NEllipsis,
  useMessage
} from 'naive-ui'
import { 
  PersonCircleOutline,
  BagHandleOutline,
  SwapHorizontalOutline,
  ServerOutline,
  PersonOutline,
} from '@vicons/ionicons5'
import { 
  useUserStore, 
  useCheckinStore, 
  useTunnelStore,
  useNodeStore,
  useUtilsStore
} from '@/stores'

const message = useMessage()

// 数字动画引用
const onlineTunnelsAnimation = ref<InstanceType<typeof NNumberAnimation> | null>(null)
const totalTunnelsAnimation = ref<InstanceType<typeof NNumberAnimation> | null>(null)
const onlineNodesAnimation = ref<InstanceType<typeof NNumberAnimation> | null>(null)
const totalNodesAnimation = ref<InstanceType<typeof NNumberAnimation> | null>(null)

// 导入存储
const userStore = useUserStore()
const checkinStore = useCheckinStore()
const tunnelStore = useTunnelStore()
const nodeStore = useNodeStore()
const utilsStore = useUtilsStore()

// 计算流量使用百分比
const trafficPercentage = computed(() => {
  if (!userStore.userInfo) return 0
  
  // 获取流量数据（数字类型）
  const used = userStore.userInfo.UsedTraffic as number || 0
  const total = userStore.userInfo.Traffic as number || 0
  
  return utilsStore.calculateTrafficPercentage(used, total)
})

// 根据流量使用情况设置进度条颜色
const trafficColor = computed(() => {
  return utilsStore.getColorByPercentage(trafficPercentage.value)
})

// 处理签到
const handleCheckin = async () => {
  if (checkinStore.hasCheckedToday) return
  
  const result = await checkinStore.doCheckin()
  if (result) {
    message.success(`签到成功，获得 ${result.reward_traffic}`)
    // 更新用户信息以获取新的流量数据
    userStore.getUserInfo()
  } else {
    message.error('签到失败，请稍后再试')
  }
}
</script>

<style scoped>
/* 主容器 */
.dashboard-container {
  position: relative;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 28px;
}

.welcome-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.user-avatar {
  flex-shrink: 0;
  position: relative;
}


@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.7; }
  100% { transform: scale(1); opacity: 0.5; }
}

.welcome-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
}

.welcome-message {
  font-size: 14px;
}

.highlight {
  background: linear-gradient(90deg, #4a4aff, #8080ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 600;
}

/* 玻璃拟态效果 */
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
  transform: translateY(-2px);
}

/* 签到卡片 */
.checkin-card {
  background: linear-gradient(135deg, rgba(74, 74, 255, 0.1) 0%, rgba(128, 128, 255, 0.1) 100%);
  border-radius: 12px;
  padding: 12px 16px;
  margin-top: 16px;
  border: 1px solid rgba(128, 128, 255, 0.2);
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(74, 74, 255, 0.1);
  transition: all 0.3s ease;
}

.checkin-card:hover {
  border: 1px solid rgba(128, 128, 255, 0.3);
  box-shadow: 0 6px 16px rgba(74, 74, 255, 0.15);
}

.checkin-title {
  font-size: 14px;
  font-weight: 600;
}

.checkin-stats {
  font-size: 12px;
  opacity: 0.8;
}

.checkin-button {
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.checkin-button:hover:not(:disabled) {
  transform: translateY(-2px);
  background-color: rgba(74, 74, 255, 0.1);
}

.checkin-button:disabled {
  opacity: 0.6;
}

/* 统计卡片 */
.statistics-section {
  margin-bottom: 28px;
}

.stat-card {
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.stat-value.used {
  background: none;
  -webkit-background-clip: initial;
  background-clip: initial;
  color: var(--info-color); /* 使用info-color表示已用流量 */
}

.stat-count {
  font-size: 32px;
  font-weight: 700;
}

.stat-count.online {
  color: var(--success-color);
  text-shadow: 0 0 10px rgba(24, 160, 88, 0.3);
}
</style>
