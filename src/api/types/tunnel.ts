// 创建隧道请求参数
export interface CreateTunnelRequest {
  nodeId: number
  proxyName: string
  localIp: string
  localPort: number
  remotePort: number
  domain: string
  proxyType: string
  accessKey: string
  hostHeaderRewrite: string
  headerXFromWhere: string
  proxyProtocolVersion: string
  useEncryption: boolean
  useCompression: boolean
}

// 创建隧道响应
export interface CreateTunnelResponse {
  code: number
  data: {
    Id: number
  }
  msg: string
}

// 删除隧道请求参数
export interface DeleteTunnelRequest {
  id: number
}

// 删除隧道响应
export interface DeleteTunnelResponse {
  code: number
  msg: string
}

// 获取隧道请求参数
export interface GetTunnelRequest {
  id?: number
  page?: number
  page_size?: number
}

// 获取隧道响应
export interface GetTunnelResponse {
  code: number
  msg: string
  pagination?: {
    page: number
    page_size: number
    pages: number
    total: number
  }
  tunnel: {
    [key: string]: {
      Domains: string
      Id: number
      Link: string
      LocalIp: string
      LocalPort: number
      NodeId: number
      NodeName: string
      ProxyName: string
      ProxyType: string
      RemotePort: number
      Status: string
      Timestamp: string
      Type: string
      data: string
    }
  }
}

// 编辑隧道请求参数
export interface EditTunnelRequest {
  id: number
  nodeId: number
  proxyName: string
  localIp: string
  localPort: number
  remotePort: number
  domain: string
  proxyType: string
  hostHeaderRewrite: string
  headerXFromWhere: string
  proxyProtocolVersion: string
  useEncryption: boolean
  useCompression: boolean
}

// 编辑隧道响应
export interface EditTunnelResponse {
  code: number
  data: {
    id: number
  }
  msg: string
}

// 隧道状态请求参数
export interface TunnelStatusRequest {
  id: string[]
}

// 隧道状态响应
export interface TunnelStatusResponse {
  code: number
  data: {
    [key: string]: {
      curConns: number
      lastCloseTime: string
      lastStartTime: string
      nodeId: number
      nodeName: string
      proxyId: number
      proxyName: string
      status: string
      todayTrafficIn: number
      todayTrafficOut: number
    }
  }
  msg: string
}

// 关闭隧道请求参数
export interface CloseTunnelRequest {
  id: number
}

// 关闭隧道响应
export interface CloseTunnelResponse {
  code: number
  data: {
    id: number
    proxyName: string
  }
  msg: string
} 