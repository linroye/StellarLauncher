<template>
  <div class="user-info-container">
    <!-- 用户信息卡片 -->
    <div class="user-card-section">
      <n-card class="user-card glass">
        <template #header>
          <div class="user-header">
            <n-avatar 
              round 
              size="large" 
              :src="userStore.avatar"
              class="user-avatar"
            >
              <template #fallback>
                <n-icon size="30"><PersonCircleOutline /></n-icon>
              </template>
            </n-avatar>
            <div class="user-title">
              <h2 class="username">{{ userStore.userInfo?.Username || '用户' }}</h2>
              <div class="user-meta">
                <n-tag size="small" type="info">ID: {{ userStore.userInfo?.ID || '-' }}</n-tag>
                <n-tag size="small" :type="userStore.userInfo?.IsVerified ? 'success' : 'warning'">
                  {{ userStore.userInfo?.IsVerified ? '已验证' : '未验证' }}
                </n-tag>
              </div>
            </div>
          </div>
        </template>
        
        <div class="user-info-content">
          <!-- 用户基本信息 -->
          <div class="info-section">
            <n-thing title="基本信息" class="section-header">
              <template #avatar>
                <div class="section-indicator"></div>
              </template>
            </n-thing>
            
            <n-grid :cols="gridCols" :x-gap="16" :y-gap="16">
              <n-grid-item>
                <n-card size="small" class="info-card">
                  <n-space align="center">
                    <n-el class="info-icon">
                      <n-icon><MailOutline /></n-icon>
                    </n-el>
                    <n-space vertical size="small">
                      <n-text depth="3" size="small">邮箱</n-text>
                      <n-text>{{ userStore.userInfo?.Email || '-' }}</n-text>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>
              
              <n-grid-item>
                <n-card size="small" class="info-card">
                  <n-space align="center">
                    <n-el class="info-icon">
                      <n-icon><PeopleOutline /></n-icon>
                    </n-el>
                    <n-space vertical size="small">
                      <n-text depth="3" size="small">用户组</n-text>
                      <n-text>{{ userStore.userInfo?.GroupName || '-' }}</n-text>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>
              
              <n-grid-item>
                <n-card size="small" class="info-card">
                  <n-space align="center">
                    <n-el class="info-icon">
                      <n-icon><CalendarOutline /></n-icon>
                    </n-el>
                    <n-space vertical size="small">
                      <n-text depth="3" size="small">注册时间</n-text>
                      <n-text>{{ utilsStore.formatDate(userStore.userInfo?.RegisterTime) }}</n-text>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>
              
              <n-grid-item>
                <n-card size="small" class="info-card">
                  <n-space align="center">
                    <n-el class="info-icon">
                      <n-icon><ShieldCheckmarkOutline /></n-icon>
                    </n-el>
                    <n-space vertical size="small">
                      <n-text depth="3" size="small">账户状态</n-text>
                      <n-tag :type="userStore.userInfo?.Status === 1 ? 'success' : 'warning'" size="small">
                        {{ userStore.userInfo?.Status === 1 ? '正常' : '受限' }}
                      </n-tag>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>

              <n-grid-item>
                <n-card size="small" class="info-card">
                  <n-space align="center">
                    <n-el class="info-icon">
                      <n-icon><TimeOutline /></n-icon>
                    </n-el>
                    <n-space vertical size="small">
                      <n-text depth="3" size="small">用户组到期时间</n-text>
                      <n-text>{{ utilsStore.formatDate(userStore.userInfo?.GroupTime) || '永久' }}</n-text>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>

              <n-grid-item>
                <n-card size="small" class="info-card">
                  <n-space align="center">
                    <n-el class="info-icon">
                      <n-icon><SpeedometerOutline /></n-icon>
                    </n-el>
                    <n-space vertical size="small">
                      <n-text depth="3" size="small">最大带宽</n-text>
                      <n-text>{{ utilsStore.formatBandwidth(userStore.userInfo?.Bandwidth) }}</n-text>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>
            </n-grid>
          </div>
          
          <!-- 资源信息 -->
          <div class="info-section">
            <n-thing title="资源信息" class="section-header">
              <template #avatar>
                <div class="section-indicator"></div>
              </template>
            </n-thing>
            
            <n-grid :cols="2" :x-gap="16">
              <!-- 流量使用情况卡片 -->
              <n-grid-item>
                <n-card size="small" class="resource-card">
                  <n-space vertical size="large">
                    <n-space align="center">
                      <n-el class="resource-icon traffic">
                        <n-icon><CloudDownloadOutline /></n-icon>
                      </n-el>
                      <n-text strong>流量使用情况</n-text>
                    </n-space>
                    
                    <n-grid :cols="3">
                      <n-grid-item>
                        <n-descriptions :column="1" label-placement="top">
                          <n-descriptions-item label="已用流量">
                            <n-text>{{ utilsStore.formatTraffic(userStore.userInfo?.UsedTraffic) }}</n-text>
                          </n-descriptions-item>
                        </n-descriptions>
                      </n-grid-item>
                      <n-grid-item>
                        <n-descriptions :column="1" label-placement="top">
                          <n-descriptions-item label="总流量">
                            <n-text>{{ utilsStore.formatTraffic(userStore.userInfo?.Traffic) }}</n-text>
                          </n-descriptions-item>
                        </n-descriptions>
                      </n-grid-item>
                      <n-grid-item>
                        <n-descriptions :column="1" label-placement="top">
                          <n-descriptions-item label="剩余流量">
                            <n-text>{{ utilsStore.formatTraffic(remainingTraffic) }}</n-text>
                          </n-descriptions-item>
                        </n-descriptions>
                      </n-grid-item>
                    </n-grid>
                    
                    <n-space vertical>
                      <n-progress 
                        type="line" 
                        :percentage="trafficPercentage" 
                        :color="trafficColor"
                        :height="8"
                        border-radius="3px"
                        :processing="trafficPercentage < 100"
                        :indicator-placement="'inside'"
                      />
                      <n-text align="right" size="small" :depth="3">
                        <n-text :style="{color: trafficColor}">{{ trafficPercentage }}%</n-text> 已使用
                      </n-text>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>

              <!-- 隧道信息卡片 -->
              <n-grid-item span="1">
                <n-card size="small" class="resource-card">
                  <n-space vertical>
                    <n-space align="center">
                      <n-el class="resource-icon tunnels">
                        <n-icon><SwapHorizontalOutline /></n-icon>
                      </n-el>
                      <n-text strong>隧道配额</n-text>
                    </n-space>
                    <n-space align="center" justify="space-between">
                      <n-descriptions :column="1" label-placement="top">
                        <n-descriptions-item label="可用隧道数量">
                          <n-text>{{ userStore.userInfo?.Tunnels || '0/0' }}</n-text>
                        </n-descriptions-item>
                      </n-descriptions>
                      <n-progress 
                        type="circle" 
                        :percentage="tunnelPercentage" 
                        :color="tunnelColor"
                        style="width: 100px; height: 100px;"
                      >
                        <n-text>{{ tunnelPercentage }}%</n-text>
                      </n-progress>
                    </n-space>
                  </n-space>
                </n-card>
              </n-grid-item>
            </n-grid>
          </div>

          <!-- 账户操作 -->
          <div class="info-section">
            <n-thing title="账户操作" class="section-header">
              <template #avatar>
                <div class="section-indicator"></div>
              </template>
            </n-thing>
            
            <n-space>
              <n-button 
                @click="refreshUserInfo"
                :loading="userStore.userInfoLoading"
                type="primary"
                secondary
              >
                <template #icon>
                  <n-icon><RefreshOutline /></n-icon>
                </template>
                刷新信息
              </n-button>
              
              <n-button 
                type="error" 
                @click="authStore.logout()"
                secondary
              >
                <template #icon>
                  <n-icon><LogOutOutline /></n-icon>
                </template>
                退出登录
              </n-button>
            </n-space>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  NCard, 
  NAvatar, 
  NIcon,
  NTag,
  NSpace,
  NButton,
  NGrid,
  NGridItem,
  NProgress,
  NThing,
  NText,
  NEl,
  NDescriptions,
  NDescriptionsItem,
  useMessage 
} from 'naive-ui'
import { 
  PersonCircleOutline,
  MailOutline,
  PeopleOutline,
  CalendarOutline,
  ShieldCheckmarkOutline,
  SwapHorizontalOutline,
  CloudDownloadOutline,
  TimeOutline,
  SpeedometerOutline,
  RefreshOutline,
  LogOutOutline
} from '@vicons/ionicons5'
import { useUserStore } from '@/stores'
import { useAuthStore } from '@/stores'
import { useUtilsStore } from '@/stores'

const userStore = useUserStore()
const authStore = useAuthStore()
const utilsStore = useUtilsStore()
const message = useMessage()

// 响应式布局
const gridCols = ref(2)

// 计算剩余流量
const remainingTraffic = computed(() => {
  if (!userStore.userInfo) return 0
  
  const used = userStore.userInfo.UsedTraffic as number || 0
  const total = userStore.userInfo.Traffic as number || 0
  
  return utilsStore.calculateRemainingTraffic(used, total)
})

// 计算流量使用百分比
const trafficPercentage = computed(() => {
  if (!userStore.userInfo) return 0
  
  // 获取流量数据（数字类型）
  const used = userStore.userInfo.UsedTraffic as number || 0
  const total = userStore.userInfo.Traffic as number || 0
  
  return utilsStore.calculateTrafficPercentage(used, total)
})

// 根据流量使用情况设置流量条颜色
const trafficColor = computed(() => {
  return utilsStore.getColorByPercentage(trafficPercentage.value)
})

// 计算隧道使用百分比
const tunnelPercentage = computed(() => {
  if (!userStore.userInfo) return 0
  
  const [availableTunnels, totalTunnels] = userStore.userInfo?.Tunnels.split('/') || ['0', '0']

  // 使用通用函数计算百分比
  return utilsStore.calculateResourcePercentage(Number(availableTunnels), Number(totalTunnels))
})

// 根据隧道使用情况设置颜色
const tunnelColor = computed(() => {
  return utilsStore.getColorByPercentage(tunnelPercentage.value)
})

// 刷新用户信息
const refreshUserInfo = async () => {
  await userStore.getUserInfo()
  message.success('用户信息已更新')
}
</script>

<style scoped>
.user-info-container {
  position: relative;
}

/* 用户信息卡片 */
.user-card-section {
  max-width: 800px;
  margin: 0 auto;
  padding-top: 20px;
}

.user-card {
  border-radius: 12px;
  overflow: hidden;
}

.glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.user-header {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.user-avatar {
  margin-right: 16px;
  position: relative;
}

.user-avatar::after {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(74, 74, 255, 0.4) 0%, rgba(128, 128, 255, 0.4) 100%);
  z-index: -1;
  opacity: 0.5;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.7; }
  100% { transform: scale(1); opacity: 0.5; }
}

.user-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-meta {
  display: flex;
  gap: 8px;
}

.username {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

/* 用户信息内容样式 */
.user-info-content {
  padding: 0 10px;
}

.info-section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 16px;
}

.section-indicator {
  width: 4px;
  height: 16px;
  background: linear-gradient(to bottom, #4a4aff, #8080ff);
  border-radius: 2px;
}

/* 信息卡片 */
.info-card {
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.info-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(74, 74, 255, 0.1);
  color: #4a4aff;
}

/* 资源卡片 */
.resource-card {
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  height: 100%;
}

.resource-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.resource-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
}

.resource-icon.tunnels {
  background: rgba(24, 160, 88, 0.1);
  color: #18a058;
}

.resource-icon.traffic {
  background: rgba(74, 74, 255, 0.1);
  color: #4a4aff;
}
</style>