<template>
  <n-grid :cols="cols" :x-gap="16" :y-gap="16" class="node-grid">
    <n-grid-item v-for="node in nodeStore.nodesArray" :key="node.ID" span="1 m:1 l:1 xl:1 2xl:1" class="node-grid-item">
      <n-card
        class="node-card glass"
        :class="{
          'selected': selectedNodeId === node.ID,
          'disabled': node.Status !== 1
        }"
        hoverable
        size="small"
        @click="node.Status === 1 && selectNode(node.ID)"
      >
        <template #header>
          <div class="node-header">
            <span class="node-status" :class="node.Status === 1 ? 'online' : 'offline'" />
            <n-el class="node-icon">
              <n-icon><ServerOutline /></n-icon>
            </n-el>
            <n-text strong>{{ node.NodeName }}</n-text>
          </div>
        </template>
        
        <div class="node-content">
          <div class="node-info-item">
            <n-text depth="3" class="node-info-label">支持协议：</n-text>
            <n-space size="small" class="protocol-tags">
              <n-tag v-for="type in node.AllowedTypes" :key="type" size="tiny" round class="protocol-tag">
                {{ type }}
              </n-tag>
            </n-space>
          </div>
          
          <n-divider style="margin: 8px 0" />
          
          <div class="node-info-item">
            <n-text depth="3" class="node-info-label">端口范围：</n-text>
            <n-text>{{ node.PortRange || '不限' }}</n-text>
          </div>
          
          <div class="node-description" v-if="node.Description && node.Description.length">
            <n-text depth="3" class="node-info-label">节点说明：</n-text>
            <n-ul class="compact-ul">
              <n-li v-for="(desc, index) in node.Description" :key="index">
                <n-text class="desc-text">{{ desc }}</n-text>
              </n-li>
            </n-ul>
          </div>
        </div>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script setup lang="ts">
import { ServerOutline } from '@vicons/ionicons5'
import { useNodeStore } from '@/stores'
import { useResponsiveGrid } from '@/composables/useResponsiveGrid'

const props = defineProps<{
  selectedNodeId: string
}>()

const emit = defineEmits<{
  (e: 'select', nodeId: string): void
}>()

const nodeStore = useNodeStore()
const { cols } = useResponsiveGrid({
  default: 2,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
  '2xl': 6
})

function selectNode(nodeId: string) {
  emit('select', nodeId)
}
</script>

<style scoped>
.node-grid {
  width: 100%;
  padding: 8px;
}

.node-grid-item {
  /* 为选中状态的放大效果预留空间 */
  padding: 4px;
  margin: 4px;
}

.node-card {
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border-radius: 12px;
  overflow: visible; /* 允许内容溢出，以显示阴影效果 */
  transform-origin: center;
  position: relative; /* 确保z-index生效 */
}

.node-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.node-card.selected {
  border-color: #18a058;
  box-shadow: 0 0 0 2px rgba(24, 160, 88, 0.2);
  animation: pulse 1.5s infinite;
  transform: translateY(-2px);
  z-index: 2; /* 确保选中的卡片在最上层 */
}

.node-card.disabled {
  cursor: not-allowed;
  opacity: 0.7;
  filter: grayscale(0.5);
}

.node-card.disabled:hover {
  transform: none;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: none;
}

.node-card.disabled .node-icon {
  opacity: 0.5;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(24, 160, 88, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(24, 160, 88, 0); }
  100% { box-shadow: 0 0 0 0 rgba(24, 160, 88, 0); }
}

.node-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(24, 160, 88, 0.1);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.selected .node-icon {
  transform: scale(1.1);
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.node-info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.node-info-label {
  font-size: 12px;
  margin-bottom: 1px;
}

.protocol-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.protocol-tag {
  margin-right: 0;
}

.node-description {
  margin-top: 2px;
}

.desc-text {
  font-size: 12px;
  line-height: 1.3;
}

.compact-ul {
  margin: 0;
  padding-left: 16px;
}

.compact-ul :deep(li) {
  margin: 2px 0;
}

.node-status {
  border-radius: 50%;
  width: 8px;
  height: 8px;
  display: inline-block;
  transition: all 0.3s ease;
}

.online {
  background-color: #18a058;
}

.offline {
  background-color: #f53f3f;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .node-grid {
    padding: 4px;
  }
  
  .node-grid-item {
    padding: 2px;
    margin: 2px;
  }
  
  .node-card {
    font-size: 12px;
  }
  
  .node-icon {
    width: 24px;
    height: 24px;
  }
}
</style> 