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

export const domainApi = {
  async getMyDomains(): Promise<MyDomainsResponse> {
    const res = await api.get('/api/v1/domain/me')
    return res.data
  }
}

export default domainApi
