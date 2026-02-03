// 节点列表响应类型
export interface NodeListResponse {
  code: number
  msg: string
  data: {
    [key: string]: {
      AllowedTypes: string[]
      Description: string[]
      ID: string
      NodeName: string
      PortRange: string
      Status: number
    }
  }
}

// 节点信息响应类型
export interface NodeInfoResponse {
  code: number
  msg: string
  data: {
    [key: string]: {
      Clients: number
      Load: string
      NodeName: string
      Status: string
      TotalTrafficIn: string
      TotalTrafficOut: string
      TrafficIn: string
      TrafficOut: string
      Version: string
    }
  }
  summary: {
    AllNodesTrafficIn: string
    AllNodesTrafficOut: string
  }
} 