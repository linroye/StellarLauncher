<template>
  <n-config-provider :theme="themeStore.currentTheme" :locale="zhCN" :date-locale="dateZhCN">
    <n-dialog-provider>
      <n-message-provider>
        <Init />

        <MainLayout v-if="authStore.isLogged" />
        <Login v-else />

        <!-- 版本更新提示弹窗 -->
        <n-modal
          v-model:show="showUpdateModal"
          :closable="!updateInfo.isForceUpdate"
          :mask-closable="false"
          :auto-focus="false"
          :close-on-esc="!updateInfo.isForceUpdate"
          style="width: 500px"
        >
          <n-card
            :bordered="false"
            size="large"
            role="dialog"
            aria-modal="true"
            class="update-modal"
          >

            <div class="update-content">
              <!-- 版本信息 -->
              <div class="version-info">
                <n-flex align="center" justify="space-between" class="version-row">
                  <div class="version-item">
                    <n-text depth="3" class="version-label">当前版本</n-text>
                    <n-text strong class="version-number">{{ updateInfo.currentVersion }}</n-text>
                  </div>
                  <n-icon size="24" color="#18a058" class="arrow-icon">
                    <svg viewBox="0 0 24 24">
                      <path fill="currentColor" d="M4 11v2h12l-5.5 5.5l1.42 1.42L19.84 12l-7.92-7.92L10.5 5.5L16 11H4Z"/>
                    </svg>
                  </n-icon>
                  <div class="version-item">
                    <n-text depth="3" class="version-label">最新版本</n-text>
                    <n-text strong class="version-number new-version">{{ updateInfo.version }}</n-text>
                  </div>
                </n-flex>
              </div>

              <!-- 更新内容 -->
              <n-divider dashed>
                <n-text depth="2">更新内容</n-text>
              </n-divider>

              <div class="update-info">
                <n-scrollbar style="max-height: 200px">
                  <div class="update-description">
                    {{ updateInfo.note || '本次更新包含性能优化和问题修复' }}
                  </div>
                </n-scrollbar>
              </div>
            </div>

            <template #footer>
              <n-flex justify="end" :size="12">
                <n-button
                  v-if="!updateInfo.isForceUpdate"
                  @click="handleLaterUpdate"
                  quaternary
                >
                  稍后提醒
                </n-button>
                <n-button
                  type="primary"
                  @click="handleUpdate"
                  :loading="false"
                  size="medium"
                >
                  <template #icon>
                    <n-icon>
                      <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7l7-7z"/>
                      </svg>
                    </n-icon>
                  </template>
                  <span>立即更新</span>
                </n-button>
              </n-flex>
            </template>
          </n-card>
        </n-modal>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { dateZhCN, zhCN, NConfigProvider, NMessageProvider, NDialogProvider, NModal, NText, NDivider, NCard, NFlex, NIcon, NAlert, NButton, NScrollbar } from 'naive-ui'
import MainLayout from '@/components/MainLayout.vue'
import { useThemeStore, useAuthStore } from '@/stores'
import Login from './views/Login.vue'
import { ref } from 'vue'
import Init from './components/init.vue'
import { check } from '@tauri-apps/plugin-updater'
import { relaunch } from '@tauri-apps/plugin-process'

const themeStore = useThemeStore()
const authStore = useAuthStore()

// 版本更新相关状态
const showUpdateModal = ref(false)
const updateInfo = ref({
  currentVersion: '',
  version: '',
  note: '',
  isForceUpdate: false
})

// 处理更新
let handleUpdate = async () => {}

// 稍后提醒
const handleLaterUpdate = () => {
  showUpdateModal.value = false
}

onMounted(async () => {
  const update = await check()
  if (update) {
    updateInfo.value.currentVersion = update.currentVersion
    updateInfo.value.version = update.version
    updateInfo.value.note = update.body || ''
    updateInfo.value.isForceUpdate = update.rawJson?.force_update as boolean || false
    handleUpdate = async () => {
      await update.downloadAndInstall()
      await relaunch()
      showUpdateModal.value = false
    }
    showUpdateModal.value = true
  }
})

</script>

<style scoped>
.update-modal {
  max-width: 500px;
  border-radius: 10px;
}

.update-content {
  padding: 0;
}

.version-info {
  margin-bottom: 24px;
  padding: 20px;
  background: linear-gradient(135deg, var(--n-color-target) 0%, var(--n-color-target-hover) 100%);
  border-radius: 12px;
  border: 1px solid var(--n-border-color);
}

.version-row {
  width: 100%;
}

.version-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.version-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.version-number {
  font-size: 18px;
  font-weight: 600;
  padding: 8px 16px;
  background-color: var(--n-color-embedded);
  border-radius: 8px;
  border: 1px solid var(--n-border-color);
  min-width: 80px;
  text-align: center;
}

.new-version {
  background: linear-gradient(135deg, #18a058 0%, #36ad6a 100%);
  color: white;
  border-color: #18a058;
}

.arrow-icon {
  margin: 0 16px;
  margin-top: 25px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.update-info {
  margin: 16px 0;
  padding: 20px;
  background-color: var(--n-color-embedded);
  border-radius: 12px;
  border: 1px solid var(--n-border-color);
}

.update-description {
  line-height: 1.8;
  color: var(--n-text-color);
  white-space: pre-wrap;
  word-break: break-word;
}

.force-update-alert {
  margin-top: 20px;
}

/* 深色主题适配 */
:deep(.n-divider) {
  margin: 20px 0;
}

/* 响应式设计 */
@media (max-width: 600px) {
  .update-modal {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }

  .version-row {
    flex-direction: column;
    gap: 16px;
  }

  .arrow-icon {
    transform: rotate(90deg);
    margin: 8px 0;
  }

  .version-item {
    width: 100%;
  }
}
</style>