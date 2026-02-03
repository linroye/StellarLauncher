<template>
  <div>
    <div class="step-header">
      <n-button size="small" @click="$emit('prev')" class="back-button" quaternary round>
        <template #icon>
          <n-icon><ArrowBackOutline /></n-icon>
        </template>
        返回选择节点
      </n-button>
    </div>
    
    <n-grid :cols="cols" :x-gap="16" :y-gap="16" class="type-grid">
      <n-grid-item v-for="type in availableTypes" :key="type" span="1 m:1 l:1 xl:1 2xl:1" class="type-grid-item">
        <n-card
          class="type-card glass"
          :class="{ 'selected': selectedType === type }"
          hoverable
          size="small"
          @click="selectType(type)"
        >
          <template #header>
            <n-flex align="center" :size="12">
              <n-el class="type-icon-container">
                <n-icon size="22" class="type-icon">
                  <component :is="getTypeIcon(type)" />
                </n-icon>
              </n-el>
              <n-text strong>{{ type.toUpperCase() }}</n-text>
            </n-flex>
          </template>
          
          <n-text class="type-desc">{{ getTypeDescription(type) }}</n-text>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import {
  SwapHorizontalOutline,
  GlobeOutline,
  ShieldOutline,
  SpeedometerOutline,
  ServerOutline,
  ArrowBackOutline
} from '@vicons/ionicons5'
import { useResponsiveGrid } from '@/composables/useResponsiveGrid'

const props = defineProps<{
  selectedType: string
  availableTypes: string[]
}>()

const emit = defineEmits<{
  (e: 'select', type: string): void
  (e: 'prev'): void
}>()

const { cols } = useResponsiveGrid({
  default: 2,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 3,
  '2xl': 3
})

function getTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'tcp':
      return SwapHorizontalOutline
    case 'udp':
      return SpeedometerOutline
    case 'http':
      return GlobeOutline
    case 'https':
      return ShieldOutline
    default:
      return ServerOutline
  }
}

function getTypeDescription(type: string) {
  switch (type.toLowerCase()) {
    case 'tcp':
      return 'TCP隧道，适用于大多数应用程序，如远程桌面、SSH等'
    case 'udp':
      return 'UDP隧道，适用于需要低延迟的应用，如游戏、视频会议等'
    case 'http':
      return 'HTTP隧道，适用于网站、API等HTTP服务'
    case 'https':
      return 'HTTPS隧道，适用于需要加密的HTTP服务'
    default:
      return '通用隧道'
  }
}

function selectType(type: string) {
  emit('select', type)
}
</script>

<style scoped>
.step-header {
  display: flex;
  margin-bottom: 8px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.type-grid {
  width: 100%;
  padding: 8px;
}

.type-grid-item {
  /* 为选中状态的放大效果预留空间 */
  padding: 4px;
  margin: 4px;
}

.type-card {
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border-radius: 12px;
  overflow: visible;
  transform-origin: center;
  position: relative;
}

.type-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.type-card.selected {
  border-color: #18a058;
  box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.2);
  animation: pulse 1.5s infinite;
  transform: translateY(-2px);
  z-index: 2;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(24, 160, 88, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(24, 160, 88, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 160, 88, 0); }
}

.type-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(24, 160, 88, 0.1);
  color: #18a058;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.selected .type-icon-container {
  transform: scale(1.1);
}

.type-desc {
  font-size: 13px;
  line-height: 1.4;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .type-grid {
    padding: 4px;
  }
  
  .type-grid-item {
    padding: 2px;
    margin: 2px;
  }
  
  .type-card:hover,
  .type-card.selected {
    transform: translateY(-2px);
  }
}
</style> 