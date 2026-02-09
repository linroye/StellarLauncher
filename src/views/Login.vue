<template>
  <div class="login-container">
    <!-- 星空背景层 -->
    <div class="background-gradient"></div>
    <div class="nebula-layer"></div>
    <div class="stars-layer"></div>
    <div class="color-dots"></div>
    <div class="cosmic-dust"></div>
    <div class="drop" data-tauri-drag-region>
      <!-- 关闭按钮 -->
      <div class="close-button" @click="handleClose">
        <n-icon :size="16" color="white">
          <CloseOutline />
        </n-icon>
      </div>
    </div>
    
    <!-- 登录卡片 -->
    <n-flex vertical align="center" justify="center" class="content-container">
      <n-card class="login-card" :bordered="false">
        <n-flex vertical :size="32">
          <!-- Logo区域 -->
          <n-flex vertical>
            <div class="logo-container">
              <n-icon :size="40" color="white">
                <RocketOutline />
              </n-icon>
            </div>
            <n-text class="app-title">
              StellarLauncher
            </n-text>
          </n-flex>

          <!-- 登录按钮 -->
          <n-button
            quaternary
            size="large"
            :loading="isLoading"
            @click="handleLogin"
            class="login-button"
          >
            <template #icon>
              <n-icon>
                <LogInOutline />
              </n-icon>
            </template>
            {{ isLoading ? '登录中...' : '开始使用' }}
          </n-button>

          <!-- 提示信息 -->
          <n-text depth="3" class="hint-text">
            点击按钮将在浏览器中打开登录页面
          </n-text>

          <!-- 切换手动输入 -->
          <n-button
            quaternary
            class="manual-toggle" 
            @click="showManualInput = !showManualInput"
            :disabled="isLoading"
          >
            {{ showManualInput ? '隐藏手动输入' : '手动输入Token' }}
          </n-button>
          
          <!-- 手动输入Token区域 -->
          <div>
            <n-collapse-transition :show="showManualInput">
              <n-space vertical>
                <input
                  class="token-input"
                  v-model="manualToken" 
                  placeholder="输入登录Token" 
                >
                  <template #prefix>
                    <n-icon :size="16" color="rgba(255, 255, 255, 0.5)">
                      <KeyOutline />
                    </n-icon>
                  </template>
                </input>
                <br />
                <n-button 
                  class="confirm-button"
                  :disabled="!manualToken || isLoading"
                  @click="handleManualLogin"
                >
                  <template #icon>
                    <n-icon>
                      <CheckmarkOutline />
                    </n-icon>
                  </template>
                  确认登录
                </n-button>
              </n-space>
            </n-collapse-transition>
          </div>
        </n-flex>
      </n-card>
    </n-flex>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  NFlex,
  NCard,
  NButton,
  NIcon,
  NText,
  useMessage,
  NCollapseTransition,
  NSpace
} from 'naive-ui'
import { 
  RocketOutline, 
  LogInOutline, 
  CloseOutline, 
  KeyOutline,
  CheckmarkOutline
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { exit } from '@tauri-apps/plugin-process'

const message = useMessage()
const isLoading = ref(false)
const authStore = useAuthStore()
const showManualInput = ref(false)
const manualToken = ref('')

const handleLogin = async () => {
  isLoading.value = true

  authStore.startLogin()

  authStore.waitParseDeepLink().then(msg => {
    message.success(msg)
  }).catch(reason => {
    message.error(`登录失败，${reason}`)
    // 登录失败时自动显示手动输入区域
    showManualInput.value = true
  }).finally(async () => {
    isLoading.value = false;
    (await getCurrentWindow()).setFocus()
  })
}

const handleManualLogin = () => {
  if (!manualToken.value) return
  
  isLoading.value = true
  
  try {
    // 保存token
    authStore.setToken(manualToken.value)
    message.success('登录成功')
    manualToken.value = ''
  } catch (error) {
    message.error(`登录失败：${error}`)
  } finally {
    isLoading.value = false
  }
}

const handleClose = async () => {
  exit(0)
}
</script>

<style scoped>
/** 滑动栏 */
.drop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 80px;
  z-index: 1000;
  --wails-draggable:drag;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* 主容器 */
.login-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100vh;
  overflow: hidden;
}

/* 关闭按钮 */
.close-button {
  margin-right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(106, 93, 205, 0.2);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(106, 93, 205, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
  opacity: 0.4;
}

.close-button:hover {
  background: rgba(106, 93, 205, 0.4);
  opacity: 1;
}

.close-button:active {
  background: rgba(106, 93, 205, 0.5);
  transform: scale(0.95);
}

/* 渐变背景 */
.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    #0f0524 0%, 
    #1a1342 15%, 
    #16213e 30%, 
    #1f3060 45%, 
    #3a2b63 60%,
    #6b2c62 75%,
    #5d2555 90%,
    #421d4b 100%
  );
  z-index: 1;
}

/* 星云层 */
.nebula-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  background:
    radial-gradient(ellipse at 30% 40%, rgba(111, 78, 211, 0.3) 0%, transparent 70%),
    radial-gradient(ellipse at 70% 30%, rgba(255, 99, 177, 0.3) 0%, transparent 70%),
    radial-gradient(ellipse at 50% 70%, rgba(64, 190, 255, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse at 20% 20%, rgba(255, 215, 83, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 90% 90%, rgba(159, 107, 224, 0.2) 0%, transparent 70%),
    radial-gradient(ellipse at 10% 60%, rgba(76, 175, 124, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 10%, rgba(255, 145, 83, 0.15) 0%, transparent 60%);
  animation: nebula-animation 30s ease-in-out infinite alternate;
}

@keyframes nebula-animation {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 0.7;
  }
  50% {
    transform: translate(-10px, -5px) scale(1.05);
    opacity: 0.9;
  }
  100% {
    transform: translate(10px, 5px) scale(1);
    opacity: 0.8;
  }
}

/* 星星层 */
.stars-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
}

.stars-layer::before {
  content: '';
  position: absolute;
  width: 1px;
  height: 1px;
  background: white;
  border-radius: 50%;
  box-shadow:
    120px 80px 0 0 rgba(255, 255, 255, 0.8),
    300px 150px 0 0 rgba(255, 255, 255, 0.6),
    500px 100px 0 0 rgba(255, 255, 255, 0.9),
    700px 200px 0 0 rgba(255, 255, 255, 0.7),
    900px 120px 0 0 rgba(255, 255, 255, 0.8),
    1100px 180px 0 0 rgba(255, 255, 255, 0.5),
    200px 350px 0 0 rgba(255, 255, 255, 0.7),
    400px 400px 0 0 rgba(255, 255, 255, 0.8),
    600px 300px 0 0 rgba(255, 255, 255, 0.6),
    800px 350px 0 0 rgba(255, 255, 255, 0.9),
    1000px 330px 0 0 rgba(255, 255, 255, 0.7),
    1200px 380px 0 0 rgba(255, 255, 255, 0.8),
    150px 450px 0 0 rgba(255, 255, 255, 0.6),
    350px 500px 0 0 rgba(255, 255, 255, 0.9),
    550px 550px 0 0 rgba(255, 255, 255, 0.7),
    750px 600px 0 0 rgba(255, 255, 255, 0.8),
    950px 650px 0 0 rgba(255, 255, 255, 0.6),
    1150px 700px 0 0 rgba(255, 255, 255, 0.9),
    250px 250px 0 0 rgba(255, 255, 255, 0.7),
    450px 280px 0 0 rgba(255, 255, 255, 0.8),
    650px 220px 0 0 rgba(255, 255, 255, 0.6),
    850px 260px 0 0 rgba(255, 255, 255, 0.9),
    1050px 240px 0 0 rgba(255, 255, 255, 0.7),
    1250px 280px 0 0 rgba(255, 255, 255, 0.8);
  animation: stars-twinkle 4s ease-in-out infinite;
}

@keyframes stars-twinkle {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 添加彩色光点 */
.color-dots {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 4;
  overflow: hidden;
}

.color-dots::before {
  content: '';
  position: absolute;
  width: 2px;
  height: 2px;
  background: #ff5e5e;
  border-radius: 50%;
  box-shadow:
    120px 80px 0 0 rgba(255, 94, 94, 0.8),
    300px 150px 0 0 rgba(255, 187, 94, 0.7),
    500px 100px 0 0 rgba(168, 255, 94, 0.6),
    700px 200px 0 0 rgba(94, 255, 181, 0.7),
    900px 120px 0 0 rgba(94, 203, 255, 0.8),
    1100px 180px 0 0 rgba(120, 94, 255, 0.7),
    200px 350px 0 0 rgba(255, 94, 221, 0.6),
    400px 400px 0 0 rgba(255, 94, 94, 0.8),
    600px 300px 0 0 rgba(255, 187, 94, 0.7),
    800px 350px 0 0 rgba(168, 255, 94, 0.6),
    1000px 330px 0 0 rgba(94, 255, 181, 0.7),
    1200px 380px 0 0 rgba(94, 203, 255, 0.8);
  animation: color-twinkle 5s ease-in-out infinite;
}

@keyframes color-twinkle {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 宇宙尘埃效果 */
.cosmic-dust {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  overflow: hidden;
}

.cosmic-dust::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  width: calc(100% + 20px);
  height: calc(100% + 20px);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E");
  opacity: 0.3;
  animation: dust-drift 60s linear infinite;
}

@keyframes dust-drift {
  0% {
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    transform: translate(-20px, -20px) rotate(1deg);
  }
}

/* 内容容器 */
.content-container {
  position: relative;
  z-index: 10;
  height: 100vh;
}

/* 登录卡片 */
.login-card {
  width: 420px;
  text-align: center;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0) 50%, 
    rgba(255, 255, 255, 0.1) 100%);
  z-index: -1;
}

.logo-container {
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background: rgba(106, 93, 205, 0.1);
  box-shadow: 0 10px 30px rgba(106, 93, 205, 0.4);
}

.app-title {
  font-size: 28px;
  font-weight: bold;
  background: linear-gradient(135deg, #e6e6ff 0%, #b3b3ff 50%, #8080ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-button {
  width: 100%;
  height: 50px;
  border-radius: 25px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  color: #fff;
  background: linear-gradient(135deg, #6d5dcd 0%, #3a7bd5 100%) !important;
  box-shadow: 0 8px 25px rgba(106, 93, 205, 0.4);
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(106, 93, 205, 0.5);
}

.login-button:active {
  transform: translateY(0);
  box-shadow: 0 8px 20px rgba(106, 93, 205, 0.4);
}

.hint-text {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.7);
}

.manual-toggle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: color 0.3s ease;
}

.manual-toggle:hover {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: underline;
}

.token-input {
  background-color: transparent;
  border: none;
  border-bottom: 1px solid rgba(106, 93, 205, 0.3);
  color: rgba(255, 255, 255, 0.9);
  padding: 8px 0;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.token-input:hover {
  border-bottom: 1px solid rgba(106, 93, 205, 0.7);
}

/* 删除默认聚焦样式 */
.token-input:focus {
  outline: none;
}

/* 确认按钮样式 */
.confirm-button {
  background: linear-gradient(135deg, #6d5dcd 0%, #3a7bd5 100%) !important;
  border: none !important;
  height: 40px !important;
  border-radius: 12px !important;
  color: white !important;
  font-weight: 500 !important;
  box-shadow: 0 4px 15px rgba(106, 93, 205, 0.4) !important;
  transition: all 0.3s ease !important;
}

.confirm-button:hover:not(:disabled) {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(106, 93, 205, 0.5) !important;
}

.confirm-button:active:not(:disabled) {
  transform: translateY(0) !important;
  box-shadow: 0 4px 15px rgba(106, 93, 205, 0.4) !important;
}

.confirm-button:disabled {
  opacity: 0.5 !important;
  background: linear-gradient(135deg, #6d5dcd 0%, #3a7bd5 100%) !important;
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>