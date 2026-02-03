import { setToken as setApiToken, clearToken as clearApiToken, setLogout } from '@/api/request'
import { defineStore } from "pinia"
import { ref, computed } from 'vue'
import router from '@/router'
import { listen } from '@tauri-apps/api/event'
import { openUrl } from '@tauri-apps/plugin-opener'

export default defineStore('auth', () => {
  const TOKEN_KEY = 'token'
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  setApiToken(token.value || '')

  const isLogged = computed(() => !!token.value)
  
  const setToken = (Token: string) => {
    localStorage.setItem(TOKEN_KEY, Token)
    token.value = Token
    setApiToken(Token)
  }
  
  const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY)
    token.value = null
    clearApiToken()
  }
  
  const waitParseDeepLink = (timeout: number = 30000): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      const off = await listen<string>('deep-link', (url) => {
        const uri = new URL(url.payload)
        const params = uri.searchParams
        if (uri.pathname === '/callback') {
          const Token = params.get('token')
          const type = params.get('type')
          const reason = params.get('reason')
          if (type === 'allowed') {
            setToken(Token as string)
            resolve('登录成功')
          } else if (type === 'denied') {
            reject(reason)
          } else {
            reject('无效的授权')
          }
        }
      })
      setTimeout(() => {
        off()
        reject('超时')
      }, timeout)
    })
  }
  
  const startLogin = () => {
    openUrl(encodeURI('https://console.stellarfrp.top/authorize?client_id=Stellar Launcher&redirect_uri=srlr:///callback'))
  }
  
  const logout = () => {
    clearToken()

    // 显示退出成功消息
    window.message.success('退出成功')
    
    // 跳转到登录页面
    router.push('/dashboard') // 登录界面和主界面逻辑不同，登录前不使用路由，所以将路由跳转至仪表盘使得登录后的页面是仪表盘
  }

  setLogout(logout)

  return {
    token,
    isLogged,
    setToken,
    clearToken,
    waitParseDeepLink,
    startLogin,
    logout,
  }
})