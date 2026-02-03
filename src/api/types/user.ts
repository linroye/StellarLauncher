// 用户信息响应类型
export interface UserInfoResponse {
  message: string
  code: number
  msg: string
  data: {
    Bandwidth: number
    Email: string
    GroupID: number
    GroupName: string
    ID: number
    GroupTime: string
    IsVerified: number
    RegisterTime: string
    Traffic: number
    Status: number
    Tunnels: string
    UsedTraffic: number
    VerifyCount: number
    Username: string
  }
}

// 重置密钥请求参数
export interface ResetTokenRequest {
  account: string
  password: string
}

// 重置密钥响应类型
export interface ResetTokenResponse {
  message: string
  code: number
  data: {
    token: string
  }
  msg: string
} 