import { checkinApi } from "@/api"
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { CheckinStatusResponse, CheckinLogsResponse, CheckinResponse } from "@/api/types/checkin"

export default defineStore('checkin', () => {
  // 状态
  const checkinStatus = ref<CheckinStatusResponse['data'] | null>(null)
  const checkinLogs = ref<CheckinLogsResponse['logs'] | null>(null)
  const checkinPagination = ref<CheckinLogsResponse['pagination'] | null>(null)
  const checkinLoading = ref(false)
  const checkinInProgress = ref(false)

  // 计算属性
  const hasCheckedToday = computed(() => checkinStatus.value?.has_checked || false)
  const continuityDays = computed(() => checkinStatus.value?.continuity_days || 0)
  const checkinCount = computed(() => checkinStatus.value?.checkin_count || 0)
  const lastCheckin = computed(() => checkinStatus.value?.last_checkin || '')
  const maxReward = computed(() => checkinStatus.value?.max_reward || '0 GB')
  const minReward = computed(() => checkinStatus.value?.min_reward || '0 GB')

  // 获取签到状态
  const getCheckinStatus = async () => {
    checkinLoading.value = true
    try {
      const res = await checkinApi.getStatus()
      if (res.code === 200) {
        checkinStatus.value = res.data
      } else {
        window.message.error('获取签到状态失败 ' + res.msg)
      }
    } catch (error) {
      window.message.error('获取签到状态失败 ' + error)
    } finally {
      checkinLoading.value = false
    }
  }

  // 获取签到日志
  const getCheckinLogs = async (page = 1, pageSize = 10) => {
    checkinLoading.value = true
    try {
      const res = await checkinApi.getLogs({ page, page_size: pageSize })
      if (res.code === 200) {
        checkinLogs.value = res.logs
        checkinPagination.value = res.pagination
      } else {
        window.message.error('获取签到日志失败 ' + res.msg)
      }
    } catch (error) {
      window.message.error('获取签到日志失败 ' + error)
    } finally {
      checkinLoading.value = false
    }
  }

  // 执行签到
  const doCheckin = async (): Promise<CheckinResponse['data'] | null> => {
    checkinInProgress.value = true
    try {
      const res = await checkinApi.doCheckin()
      // 签到成功后更新状态
      if (res.code === 200) {
        await getCheckinStatus()
        return res.data
      }
      return null
    } catch (error) {
      window.message.error('签到失败 ' + error)
      return null
    } finally {
      checkinInProgress.value = false
    }
  }

  // 初始化时获取签到状态
  getCheckinStatus()

  return {
    // 状态
    checkinStatus,
    checkinLogs,
    checkinPagination,
    checkinLoading,
    checkinInProgress,

    // 计算属性
    hasCheckedToday,
    continuityDays,
    checkinCount,
    lastCheckin,
    maxReward,
    minReward,

    // 方法
    getCheckinStatus,
    getCheckinLogs,
    doCheckin
  }
}) 