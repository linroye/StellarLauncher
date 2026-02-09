import api from './request'

export interface MyDomainsResponse {
  code: number
  msg: string
  domains: {
    [key: string]: {
      domain: string
      is_icp: boolean
    }
  }
}

export interface SSLInfo {
  id: number
  domain: string
  email: string
  status: string
  issuer: string
  expiration_date: string
  created_at: string
  certificate: string
  private_key: string
}

export interface SSLListResponse {
  code: number
  data: SSLInfo[]
  msg: string
}

export const domainApi = {
  async getMyDomains(): Promise<MyDomainsResponse> {
    const res = await api.get('/api/v1/domain/me')
    return res.data
  },

  async getSSLList(): Promise<SSLListResponse> {
    const res = await api.get('/api/v1/domain/ssl/list')
    return res.data
  }
}

export default domainApi
