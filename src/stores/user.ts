import { userApi } from "@/api"
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { UserInfoResponse, ResetTokenRequest } from "@/api/types/user"
import { sha256 } from "js-sha256"

export default defineStore('user', () => {
  const userInfo = ref<UserInfoResponse['data'] | null>(null)
  const userInfoLoading = ref(false)

  const avatar = computed(() => {
    if (!userInfo.value) return 'https://weavatar.com/avatar/'
    const hash = sha256(userInfo.value!.Email)
    return `https://weavatar.com/avatar/${hash}`
  })

  const getUserInfo = async () => {
    userInfoLoading.value = true
    try {
      const res = await userApi.getUserInfo()
      if (res.code === 200) {
        userInfo.value = res.data
      } else {
        window.message.error('获取用户信息失败 ' + res.message)
      }
    } catch (error) {
      window.message.error('获取用户信息失败 ' + error)
    } finally {
      userInfoLoading.value = false
    }
  }

  const resetToken = async (data: ResetTokenRequest): Promise<string> => {
    try {
      const res = await userApi.resetToken(data)
      if (res.code === 200) {
        return res.data.token
      } else {
        window.message.error('重置Token失败 ' + res.message)
      }
      return ''
    } catch (error) {
      window.message.error('重置Token失败 ' + error)
      return ''
    }
  }

  // init
  getUserInfo()

  return {
    userInfo,
    userInfoLoading,
    avatar,

    // 方法
    getUserInfo,
    resetToken
  }
})