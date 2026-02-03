<template>
  <div class="create-tunnel-container">
    <n-spin v-if="loading" :show="loading" style="margin-top: 25%;" description="正在加载节点数据..." />
    <transition name="fade-up" mode="out-in" appear>
      <div v-if="!loading" class="content-wrapper">
        <!-- 页面头部卡片 -->
        <n-card class="page-header-card glass" size="small">
          <template #header>
            <n-flex align="center" justify="space-between">
              <n-flex align="center" :size="8">
                <n-icon size="22" class="header-icon"><AddCircleOutline /></n-icon>
                <n-text style="font-size: 16px; font-weight: 500;">创建隧道</n-text>
              </n-flex>
              <n-text depth="3" style="font-size: 13px;">配置并创建新的隧道连接</n-text>
            </n-flex>
          </template>
          
          <!-- 步骤指示器 -->
          <n-steps 
            :current="steps.state.value.currentStep" 
            class="steps-container" 
            size="small"
          >
            <n-step 
              title="选择节点" 
              description="选择要使用的节点" 
              :status="steps.stepOneStatus.value" 
            />
            <n-step 
              title="选择类型" 
              description="选择隧道类型" 
              :status="steps.stepTwoStatus.value"
            />
            <n-step 
              title="配置隧道" 
              description="填写隧道配置" 
              :status="steps.stepThreeStatus.value"
            />
            <n-step 
              title="完成" 
              description="创建完成" 
              :status="steps.stepFourStatus.value"
            />
          </n-steps>
        </n-card>

        <!-- 步骤内容区域 -->
        <div class="steps-wrapper">
          <!-- 节点选择步骤 -->
          <transition name="step-fade" mode="out-in">
            <div v-if="steps.state.value.currentStep === 0" key="step-0" class="step-content">
              <node-selection
                :selected-node-id="form.state.value.selectedNodeId"
                @select="handleNodeSelect"
              />
            </div>
          </transition>

          <!-- 隧道类型选择步骤 -->
          <transition name="step-fade" mode="out-in">
            <div v-if="steps.state.value.currentStep === 1" key="step-1" class="step-content">
              <type-selection
                :selected-type="form.state.value.selectedType"
                :available-types="form.availableTypes.value"
                @select="handleTypeSelect"
                @prev="steps.prevStep"
              />
            </div>
          </transition>

          <!-- 隧道配置步骤 -->
          <transition name="step-fade" mode="out-in">
            <div v-if="steps.state.value.currentStep === 2" key="step-2" class="step-content">
              <tunnel-form
                ref="tunnelFormRef"
                v-model:form-value="form.state.value.formValue"
                :rules="form.rules.value"
                :is-http-or-https="form.isHttpOrHttps.value"
                v-model:show-advanced="form.state.value.showAdvanced"
                :selected-type="form.state.value.selectedType"
                :node-id="form.state.value.selectedNodeId"
                :generate-random-name="form.generateRandomName"
                :generate-random-port="form.generateRandomPort"
                @prev="steps.prevStep"
                @submit="handleFormSubmit"
              />
            </div>
          </transition>

          <!-- 完成步骤 -->
          <transition name="step-fade" mode="out-in">
            <div v-if="steps.state.value.currentStep === 3" key="step-3" class="step-content">
              <n-result
                :status="steps.state.value.createSuccess ? 'success' : 'error'"
                :title="steps.state.value.createSuccess ? '创建成功' : '创建失败'"
                :description="steps.state.value.createSuccess ? '隧道已成功创建' : '创建隧道时发生错误'"
                class="result-card glass"
                size="small"
              >
                <template #footer>
                  <div class="result-actions">
                    <n-button v-if="!steps.state.value.createSuccess" @click="steps.prevStep" class="action-button">
                      <template #icon>
                        <n-icon><ArrowBackOutline /></n-icon>
                      </template>
                      返回修改
                    </n-button>
                    <n-button @click="handleReset" class="action-button">
                      <template #icon>
                        <n-icon><AddCircleOutline /></n-icon>
                      </template>
                      继续创建
                    </n-button>
                    <n-button type="primary" @click="goToManage" class="action-button">
                      <template #icon>
                        <n-icon><ListOutline /></n-icon>
                      </template>
                      管理隧道
                    </n-button>
                  </div>
                </template>
              </n-result>
            </div>
          </transition>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNodeStore } from '@/stores'
import { AddCircleOutline, ListOutline, ArrowBackOutline } from '@vicons/ionicons5'
import { useTunnelForm } from '@/composables/useTunnelForm'
import { useTunnelSteps } from '@/composables/useTunnelSteps'
import NodeSelection from '@/components/tunnel/NodeSelection.vue'
import TypeSelection from '@/components/tunnel/TypeSelection.vue'
import TunnelForm from '@/components/tunnel/TunnelForm.vue'

const router = useRouter()
const nodeStore = useNodeStore()
const tunnelFormRef = ref(null)
const loading = ref(true)

// 初始化表单和步骤状态
const form = useTunnelForm()
const steps = useTunnelSteps(form.state)

// 处理节点选择
function handleNodeSelect(nodeId: string) {
  form.state.value.selectedNodeId = nodeId
  steps.nextStep()
}

// 处理类型选择
function handleTypeSelect(type: string) {
  form.selectType(type)
  steps.nextStep()
  }
  
// 处理表单提交
async function handleFormSubmit() {
  const success = await form.validateAndSubmit()
  steps.state.value.createSuccess = success
  steps.nextStep()
}

// 重置所有状态
function handleReset() {
  form.resetForm()
  steps.resetSteps()
}

// 跳转到管理页面
function goToManage() {
  router.push({ name: 'manage-tunnels' })
}

// 组件挂载时，确保节点数据已加载
onMounted(async () => {
  try {
    if (!nodeStore.nodeList) {
      await nodeStore.getNodeList()
    }
    form.generateRandomName()
  } finally {
    // 添加一个小延迟，让加载动画更流畅
    setTimeout(() => {
      loading.value = false
    }, 300)
  }
})
</script>

<style scoped>
.create-tunnel-container {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  /* 确保滚动条始终显示，防止跳动 */
  overflow-y: scroll;
  scrollbar-gutter: stable;
}

.content-wrapper {
  width: 100%;
  height: 100%;
  animation: content-enter 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 入场动画 */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.15s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@keyframes content-enter {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header-card {
  border-radius: 12px;
  overflow: hidden;
  /* 固定头部卡片，防止滚动影响 */
  position: sticky;
  top: 0;
  z-index: 10;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
}

.steps-wrapper {
  position: relative;
  min-height: 300px;
  width: 100%;
  /* 防止水平滚动 */
  overflow-x: hidden;
  /* 添加内边距，确保底部有足够空间 */
  padding-bottom: 24px;
  flex: 1;
}

.step-content {
  margin-top: 12px;
  transition: all 0.3s ease;
  min-height: 450px;
  position: relative;
  width: 100%;
  padding: 0;
  /* 确保内容不会超出容器 */
  max-width: 100%;
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

/* 步骤切换动画 */
.step-fade-enter-active,
.step-fade-leave-active {
  transition: opacity 0.12s ease, transform 0.12s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.step-fade-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.result-card {
  padding: 12px;
  border-radius: 12px;
}

.action-button {
  min-width: 110px;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 步骤指示器动画 */
:deep(.n-steps) .n-step:not(:first-child) .n-step-splitor {
  transition: background-color 0.5s ease;
}

:deep(.n-steps) .n-step-content {
  transition: color 0.3s ease;
}

:deep(.n-steps) .n-step-indicator {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

:deep(.n-steps) .n-step-indicator-slot {
  transition: color 0.3s ease;
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
  .create-tunnel-container {
    padding: 8px;
  }
  
  .page-header-card {
    margin-bottom: 8px;
  }
  
  .step-content {
    margin-top: 8px;
  }
}
</style>
