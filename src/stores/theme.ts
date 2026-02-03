import { darkTheme, lightTheme, useOsTheme } from "naive-ui"
import type { GlobalTheme } from "naive-ui"
import { defineStore } from "pinia"
import { ref, computed } from "vue"

export default defineStore('theme', () => {
  const THEME_KEY = 'theme'
  type THEME_STRING = 'light' | 'dark' | 'system'
  const currentThemeString = ref<string>(localStorage.getItem(THEME_KEY) || 'system')
  
  // 创建一个响应式的系统主题变量
  const osThemeRef = useOsTheme()
  
  const currentTheme = computed<GlobalTheme>(() => {
    let themeString = currentThemeString.value

    if (currentThemeString.value === 'system') {
      themeString = osThemeRef.value || 'light'
    }

    return themeString === 'light' ? lightTheme : darkTheme
  })

  const setTheme = (theme: THEME_STRING) => {
    localStorage.setItem(THEME_KEY, theme)
    currentThemeString.value = theme 
  }

  return {
    currentThemeString,
    currentTheme,
    
    setTheme,
  }
})