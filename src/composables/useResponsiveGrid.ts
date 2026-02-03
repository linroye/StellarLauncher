import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useLayoutStore } from '@/stores'

export function useResponsiveGrid(baseConfig: {
  default: number,
  sm?: number,
  md?: number,
  lg?: number,
  xl?: number,
  '2xl'?: number
}) {
  const layoutStore = useLayoutStore()
  const windowWidth = ref(window.innerWidth)

  // 防抖函数
  function debounce(fn: Function, delay: number) {
    let timer: number | null = null
    return (...args: any[]) => {
      if (timer) {
        clearTimeout(timer)
      }
      timer = window.setTimeout(() => {
        fn(...args)
        timer = null
      }, delay)
    }
  }

  // 更新窗口宽度
  const updateWidth = debounce(() => {
    windowWidth.value = window.innerWidth
  }, 100)

  // 在组件挂载时添加事件监听
  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })

  // 在组件卸载时移除事件监听
  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  const cols = computed(() => {
    const collapsed = layoutStore.sidebarCollapsed
    const width = windowWidth.value
    
    // 根据侧边栏状态和窗口宽度动态计算列数
    if (width >= 1536) { // 2xl
      return collapsed ? (baseConfig['2xl'] || baseConfig.xl || baseConfig.lg || baseConfig.default) : 
             (baseConfig['2xl'] || baseConfig.xl || baseConfig.lg || baseConfig.default) - 1
    }
    if (width >= 1280) { // xl
      return collapsed ? (baseConfig.xl || baseConfig.lg || baseConfig.default) :
             (baseConfig.xl || baseConfig.lg || baseConfig.default) - 1
    }
    if (width >= 1024) { // lg
      return collapsed ? (baseConfig.lg || baseConfig.default) :
             (baseConfig.lg || baseConfig.default) - 1
    }
    if (width >= 768) { // md
      return collapsed ? (baseConfig.md || baseConfig.default) :
             (baseConfig.md || baseConfig.default)
    }
    if (width >= 640) { // sm
      return baseConfig.sm || baseConfig.default
    }
    return baseConfig.default
  })

  return {
    cols
  }
} 