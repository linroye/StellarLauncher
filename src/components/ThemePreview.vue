<template>
  <div class="theme-preview-container">
    <div
      class="theme-preview"
      :class="{
        'theme-preview--light': previewTheme === 'light',
        'theme-preview--dark': previewTheme === 'dark',
        'theme-preview--selected': selected
      }"
      @click="$emit('select')"
    >
    <!-- 模拟应用窗口 -->
    <div class="preview-window">
      <!-- 标题栏 -->
      <div class="preview-titlebar">
        <div class="preview-titlebar-buttons">
          <div class="preview-button preview-button--close"></div>
          <div class="preview-button preview-button--minimize"></div>
          <div class="preview-button preview-button--maximize"></div>
        </div>

      </div>
      
      <!-- 主要内容区域 -->
      <div class="preview-content">
        <!-- 侧边栏 -->
        <div class="preview-sidebar">
          <div class="preview-logo"></div>
          <div class="preview-nav-items">
            <div class="preview-nav-item preview-nav-item--active"></div>
            <div class="preview-nav-item"></div>
            <div class="preview-nav-item"></div>
          </div>
        </div>
        
        <!-- 主内容区 -->
        <div class="preview-main">
          <!-- 卡片区域 -->
          <div class="preview-cards">
            <div class="preview-card preview-card--large"></div>
            <div class="preview-card preview-card--medium"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 选中状态指示器 -->
    <div v-if="selected" class="preview-selected-indicator">
      <n-icon :size="16">
        <CheckmarkCircleOutline />
      </n-icon>
    </div>
    </div>

    <!-- 主题名称 -->
    <div class="preview-label">
      <n-icon :size="16" class="preview-icon">
        <slot name="icon">
          <SunnyOutline v-if="previewTheme === 'light'" />
          <MoonOutline v-else />
        </slot>
      </n-icon>
      <div class="preview-label-content">
        <span class="preview-label-title">{{ themeLabel }}</span>
        <slot name="subtitle"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { SunnyOutline, MoonOutline, CheckmarkCircleOutline } from '@vicons/ionicons5'

interface Props {
  previewTheme: 'light' | 'dark'
  themeLabel: string
  selected?: boolean
}

defineProps<Props>()
defineEmits<{
  select: []
}>()
</script>

<style scoped>
.theme-preview-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
}

.theme-preview {
  position: relative;
  width: 100%;
  height: 100px;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  background: var(--n-color);
}

.theme-preview:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.theme-preview:hover .preview-logo {
  transform: scale(1.1);
  background: linear-gradient(45deg, #5555ff, #7777ff, #9999ff);
}

.theme-preview:hover .preview-nav-item {
  transform: translateX(2px);
}

.theme-preview:hover .preview-nav-item--active {
  transform: translateX(4px) scale(1.05);
}

.theme-preview:hover .preview-card {
  transform: translateY(-1px);
  opacity: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-preview:hover .preview-card--large {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-preview:hover .preview-card--medium {
  transform: translateY(-1px) rotateX(5deg);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  animation: card-pulse 2s ease-in-out infinite;
}

@keyframes card-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

.theme-preview:hover .preview-titlebar-buttons .preview-button {
  transform: scale(1.1);
}

.theme-preview--selected {
  border-color: #18a058;
  box-shadow: 0 0 0 2px #18a058, 0 4px 12px rgba(24, 160, 88, 0.3);
  transform: translateY(-2px);
}

.theme-preview--selected:hover {
  box-shadow: 0 0 0 2px #18a058, 0 8px 24px rgba(24, 160, 88, 0.4);
  transform: translateY(-4px);
}

/* 浅色主题预览 */
.theme-preview--light {
  background: #ffffff;
  border-color: #e0e0e6;
}

.theme-preview--light .preview-window {
  background: #ffffff;
}

.theme-preview--light .preview-titlebar {
  background: #f7f7f8;
  border-bottom: 1px solid #e0e0e6;
}

.theme-preview--light .preview-sidebar {
  background: #fafafc;
  border-right: 1px solid #e0e0e6;
}

.theme-preview--light .preview-main {
  background: #ffffff;
}

.theme-preview--light .preview-card {
  background: #f7f7f8;
  border: 1px solid #e0e0e6;
}

.theme-preview--light .preview-nav-item--active {
  background: #18a058;
}

.theme-preview--light .preview-nav-item {
  background: #e0e0e6;
}

.theme-preview--light:hover .preview-card {
  background: #f0f0f2;
  border-color: #d0d0d6;
}

/* 深色主题预览 */
.theme-preview--dark {
  background: #101014;
  border-color: #2d2d30;
}

.theme-preview--dark .preview-window {
  background: #101014;
}

.theme-preview--dark .preview-titlebar {
  background: #1a1a1e;
  border-bottom: 1px solid #2d2d30;
}

.theme-preview--dark .preview-sidebar {
  background: #16161a;
  border-right: 1px solid #2d2d30;
}

.theme-preview--dark .preview-main {
  background: #101014;
}

.theme-preview--dark .preview-card {
  background: #1a1a1e;
  border: 1px solid #2d2d30;
}

.theme-preview--dark .preview-nav-item--active {
  background: #63e2b7;
}

.theme-preview--dark .preview-nav-item {
  background: #2d2d30;
}

.theme-preview--dark:hover .preview-card {
  background: #202024;
  border-color: #3d3d40;
}



/* 预览窗口结构 */
.preview-window {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-titlebar {
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
}

.preview-titlebar-buttons {
  display: flex;
  gap: 4px;
}

.preview-button {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.preview-button--close {
  background: #ff5f57;
}

.preview-button--minimize {
  background: #ffbd2e;
}

.preview-button--maximize {
  background: #28ca42;
}

.preview-title {
  font-size: 8px;
  opacity: 0.7;
  font-weight: 500;
}

.preview-content {
  display: flex;
  height: calc(100% - 20px);
}

.preview-sidebar {
  width: 45px;
  padding: 8px 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-logo {
  width: 20px;
  height: 12px;
  background: linear-gradient(45deg, #4a4aff, #8080ff);
  border-radius: 2px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.preview-nav-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-nav-item {
  width: 100%;
  height: 8px;
  border-radius: 2px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.preview-nav-item--active {
  opacity: 1;
  transition: all 0.3s ease;
}

.preview-main {
  flex: 1;
  padding: 8px;
}

.preview-cards {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  padding: 2px;
}

.preview-card {
  border-radius: 4px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.preview-card--large {
  height: 20px;
}

.preview-card--medium {
  height: 16px;
}

/* 标签和指示器 */
.preview-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--n-text-color);
  margin-top: 12px;
  width: 100%;
}

.preview-icon {
  opacity: 0.8;
  flex-shrink: 0;
}

.preview-label-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: center;
}

.preview-label-title {
  font-weight: 600;
  line-height: 1.2;
  font-size: 14px;
}

.preview-label-subtitle {
  font-size: 11px;
  opacity: 0.7;
  font-weight: 400;
  color: var(--n-text-color-2);
}

.preview-selected-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #18a058;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}
</style>
