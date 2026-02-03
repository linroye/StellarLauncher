<template>
  <n-flex vertical :size="24">
    <n-card title="设置" size="large" :bordered="false">
      <template #header-extra>
        <n-text depth="3">应用程序设置</n-text>
      </template>

      <!-- 自启动设置 -->
      <n-card title="启动设置" class="setting-section">
        <n-flex vertical :size="16">
          <n-form-item label="开机自启">
            <n-flex align="center" justify="space-between">
              <n-text>设置应用是否随系统启动</n-text>
              <n-switch
                :value="autoStartEnabled"
                @update:value="handleAutoStartChange"
                :loading="isProcessing"
              />
            </n-flex>
          </n-form-item>
        </n-flex>
      </n-card>

      <!-- 外观设置 -->
      <n-card title="外观设置" class="setting-section">
        <n-flex vertical :size="16">
          <n-form-item label="主题模式">
            <n-text strong>选择主题模式</n-text>
          </n-form-item>

          <n-grid :cols="3" :x-gap="24" responsive="screen">
            <n-grid-item>
              <ThemePreview
                preview-theme="light"
                theme-label="浅色"
                :selected="themeStore.currentThemeString === 'light'"
                @select="handleThemeChange('light')"
              />
            </n-grid-item>
            <n-grid-item>
              <ThemePreview
                preview-theme="dark"
                theme-label="深色"
                :selected="themeStore.currentThemeString === 'dark'"
                @select="handleThemeChange('dark')"
              />
            </n-grid-item>
            <n-grid-item>
              <ThemePreview
                :preview-theme="osTheme === 'dark' ? 'dark' : 'light'"
                theme-label="跟随系统"
                :selected="themeStore.currentThemeString === 'system'"
                @select="handleThemeChange('system')"
              >
                <template #icon>
                  <DesktopOutline />
                </template>
                <template #subtitle>
                  <n-text depth="3" :style="{ fontSize: '11px' }">
                    当前: {{ osTheme === 'dark' ? '深色' : '浅色' }}
                  </n-text>
                </template>
              </ThemePreview>
            </n-grid-item>
          </n-grid>
        </n-flex>
      </n-card>
    </n-card>
  </n-flex>
</template>

<script setup lang="ts">
import {
  NFlex,
  NCard,
  NText,
  NFormItem,
  NGrid,
  NGridItem,
  NSwitch,
  NButton,
  useMessage,
  NModal,
  NDivider,
  NAlert
} from 'naive-ui'
import { ref, onMounted } from 'vue'
import { useThemeStore } from '@/stores'
import { DesktopOutline } from '@vicons/ionicons5'
import ThemePreview from '@/components/ThemePreview.vue'
import { useOsTheme } from 'naive-ui'
import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'

const themeStore = useThemeStore()
const message = useMessage()
const autoStartEnabled = ref(false)
const isProcessing = ref(false)
const showUpdateModal = ref(false)

// 检查自启动状态
onMounted(async () => {
  try {
    autoStartEnabled.value = await isEnabled()
  } catch (err) {
    console.error('检查自启动状态失败:', err)
    message.error('检查自启动状态失败')
  }
})

// 处理自启动状态变更
const handleAutoStartChange = async (value: boolean) => {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    if (value) {
      await enable()
      message.success('已启用开机自启')
    } else {
      await disable()
      message.success('已禁用开机自启')
    }
    autoStartEnabled.value = value
  } catch (err) {
    console.error('设置自启动状态失败:', err)
    message.error(`设置失败，可能需要管理员权限: ${err}`)
    // 恢复开关状态
    autoStartEnabled.value = !value
  } finally {
    isProcessing.value = false
  }
}

const osTheme = useOsTheme()

const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
  themeStore.setTheme(mode)
}
</script>

<style scoped>
.setting-section {
  margin-bottom: 16px;
}

.setting-section:last-child {
  margin-bottom: 0;
}
</style>
