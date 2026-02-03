// 签到状态响应类型
export interface CheckinStatusResponse {
  code: number
  data: {
    checkin_count: number
    continuity_days: number
    has_checked: boolean
    last_checkin: string
    max_reward: string
    min_reward: string
  }
  msg: string
}

// 签到日志参数
export interface CheckinLogsRequest {
  page: number
  page_size: number
}

// 签到日志响应类型
export interface CheckinLogsResponse {
  code: number
  logs: Array<{
    checkin_date: string
    continuity_days: number
    created_at: string
    id: number
    reward_traffic: string
  }>
  msg: string
  pagination: {
    page: number
    page_size: number
    pages: number
    total: number
  }
}

// 签到响应类型
export interface CheckinResponse {
  code: number
  data: {
    checkin_date: string
    continuity_days: number
    reward_traffic: string
  }
  msg: string
} 