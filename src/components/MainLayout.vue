<template>
  <div style="height: 100%;">
    <n-layout-header class="header" data-tauri-drag-region>
      <n-image :preview-disabled="true" src="logo.png" width="180" />

      <div class="window-controls">
        <div class="control-button minimize" @click="handleMinimize">
          <n-icon><RemoveOutline /></n-icon>
        </div>
        <div class="control-button maximize" @click="handleMaximize">
          <n-icon>
            <component :is="isMaximized ? ContractOutline : ExpandOutline" />
          </n-icon>
        </div>
        <div class="control-button close" @click="handleClose">
          <n-icon><CloseOutline /></n-icon>
        </div>
      </div>
    </n-layout-header>
    <n-divider :style="`margin: 0; --n-color: rgba(31, 34, 37, ${themeStore.currentTheme.name === 'dark' ? '0.9' : '0.09'});`" />
  </div>
  <n-layout has-sider class="content">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      show-trigger="bar"
      :native-scrollbar="false"
      :collapsed="collapsed"
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <!-- 主导航区域 -->
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        @update:value="handleSelect"
        :value="activeKey"
      />

      <!-- 底部区域 -->
      <div class="bottom-menu">
        <n-divider style="margin: 5px;" />
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="bottomMenuOptions"
          @update:value="handleSelect"
          :value="activeKey"
        />
      </div>
    </n-layout-sider>
    <n-layout-content class="main-content">
      <router-view v-slot="{ Component }" style="padding: 24px;">
        <transition name="slide-down" mode="out-in" appear>
          <div class="page-content-wrapper" :key="route.fullPath">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, h, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NAvatar, NIcon, useMessage } from 'naive-ui'
import {
  HomeOutline,
  AddCircleOutline,
  SettingsOutline,
  DocumentTextOutline,
  CartOutline,
  RemoveOutline,
  CloseOutline,
  ExpandOutline,
  ContractOutline
} from '@vicons/ionicons5'
import { useUserStore, useThemeStore, useTunnelStore } from '@/stores'
import { useLayoutStore } from '@/stores'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { exit } from '@tauri-apps/plugin-process'

window.message = useMessage()

const userStore = useUserStore()
const themeStore = useThemeStore()
const tunnelStore = useTunnelStore()

const router = useRouter()
const route = useRoute()

const layoutStore = useLayoutStore()
const collapsed = computed({
  get: () => layoutStore.sidebarCollapsed,
  set: (value) => layoutStore.sidebarCollapsed = value
})

// 当前激活的菜单项
const activeKey = computed<string>(() => router.currentRoute.value.name as string)

// 窗口状态
const isMaximized = ref(false)

// 窗口控制函数
const handleMinimize = async () => {
  (await getCurrentWindow()).minimize()
}

const handleMaximize = async () => {
  isMaximized.value = !isMaximized.value
  const currentWindow = await getCurrentWindow()
  if (isMaximized.value) {
    currentWindow.maximize()
  } else {
    currentWindow.unmaximize()
  }
}

const handleClose = async  () => {
  await tunnelStore.stopAllTunnels()
  exit(0)
}

// 主导航菜单选项
const menuOptions = [
  {
    label: '仪表盘',
    key: 'dashboard',
    icon: () => h(HomeOutline)
  },
  {
    label: '创建隧道',
    key: 'create-tunnel',
    icon: () => h(AddCircleOutline)
  },
  {
    label: '管理隧道',
    key: 'manage-tunnels',
    icon: () => h(SettingsOutline)
  },
  {
    label: '隧道日志',
    key: 'tunnel-logs',
    icon: () => h(DocumentTextOutline)
  }
]

// 底部菜单选项
const bottomMenuOptions = computed(() => [
  {
    label: userStore.userInfo?.Username || '用户',
    key: 'user-info',
    icon: () => h(NIcon, null, { default: () => h(
      NAvatar, {
        round: true,
        size: 22,
        src: userStore.avatar
      }
    )}),
  },
  {
    label: '增值服务',
    key: 'premium-services',
    icon: () => h(CartOutline)
  },
  {
    label: '设置',
    key: 'settings',
    icon: () => h(SettingsOutline)
  }
])

// 处理主菜单选择
const handleSelect = (key: string) => {
  router.push({ name: key })
}
</script>

<style scoped>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8.5px 20px;
  }

  .header-button {
    opacity: 0.4;
    transition: opacity 0.2s ease;
  }

  .header-button:hover {
    opacity: 1;
  }

  .window-controls {
    display: flex;
    align-items: center;
  }

  .control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.6s ease;
    opacity: 0.4;
  }

  .control-button:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .control-button.minimize:hover {
    color: var(--primary-color, #18a058);
  }

  .control-button.maximize:hover {
    color: var(--warning-color, #f0a020);
  }

  .control-button.close:hover {
    background-color: #e53935;
    color: white;
  }

  .content {
    height: calc(100vh - 64px);
    overflow: hidden; /* 防止内容溢出 */
  }
  
  .main-content {
    overflow: auto; /* 允许内容溢出并显示滚动条 */
  }

  .bottom-menu {
    position: absolute;
    bottom: 0;
    width: 100%;
  }

  /* 页面内容过渡动画效果 */
  .page-content-wrapper {
    position: relative;
    overflow-x: hidden;
    height: 100%;
  }

  /* Vue过渡动画 - 从上方滑入 */
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: all 0.3s ease;
  }

  .slide-down-enter-from {
    transform: translateY(-20px);
    opacity: 0;
  }

  .slide-down-leave-to {
    opacity: 0;
  }

  /* 滑入动画 */
  @keyframes slideDown {
    from { 
      transform: translateY(-20px); 
      opacity: 0;
    }
    to { 
      transform: translateY(0); 
      opacity: 1;
    }
  }
</style>
