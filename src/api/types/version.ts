// 获取版本信息请求参数
export interface VersionRequest {
  platform?: 'windows' | 'macos' | 'linux'
  arch?: 'amd64' | 'arm64' | 'universal' // universal仅macos
}

// 下载链接结构
export interface DownloadUrls {
  [platform: string]: {
    [arch: string]: string
  }
}

// 获取版本信息响应
export interface VersionResponse {
  code: number
  data: {
    version: string
    info: string
    download_url: DownloadUrls
    is_force_update: boolean
  }
  msg: string
}
