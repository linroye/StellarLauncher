import api, { setToken, clearToken, setLogout } from './request'
import userApi from './user'
import checkinApi from './checkin'
import nodeApi from './node'
import tunnelApi from './tunnel'
import shopApi from './shop'
import domainApi from './domain'

// 导出API请求实例
export { api }

// 导出Token管理方法
export { setToken, clearToken, setLogout }

// 导出API模块
export { userApi, checkinApi, nodeApi, tunnelApi, shopApi, domainApi }

// 统一导出所有API
export default {
  user: userApi,
  checkin: checkinApi,
  node: nodeApi,
  tunnel: tunnelApi,
  shop: shopApi,
  domain: domainApi
}
