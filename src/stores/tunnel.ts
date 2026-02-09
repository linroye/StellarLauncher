import { tunnelApi } from '@/api'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  CreateTunnelRequest,
  EditTunnelRequest,
  GetTunnelResponse,
  TunnelStatusResponse
} from '@/api/types/tunnel'
import { invoke } from '@tauri-apps/api/core'
import { listen, type UnlistenFn } from '@tauri-apps/api/event'

export type TypeEnum = 'info' | 'warning' | 'error'
export type ProcessStatus = 'Ready' | 'Running' | 'RemoteRunning' | 'Stopped' | 'Failed'
// 初始化的时候，如果隧道状态是online就是隧道已经在别处运行了
export type Process = {
  [key: string]: {
    status: ProcessStatus,
    unlisten?: Promise<UnlistenFn>,
    unlistenError?: Promise<UnlistenFn>,
    unlistenTerminated?: Promise<UnlistenFn>,
    logs: {
      type: TypeEnum
      content: string
    }[]
  }
}

export default defineStore('tunnel', () => {
  // 状态
  const tunnels = ref<GetTunnelResponse['tunnel'] | null>(null)
  const tunnelStatus = ref<TunnelStatusResponse['data'] | null>(null)
  const loading = ref(false)
  const statusLoading = ref(false)
  const creating = ref(false)
  const pagination = ref({
    page: 1,
    page_size: 10,
    pages: 1,
    total: 0
  })
  const process = ref<Process>({})
  const startedToastShown = ref<{ [key: string]: boolean }>({})
  const errorToastShown = ref<{ [key: string]: boolean }>({})

  // 计算属性
  const tunnelsArray = computed(() => {
    if (!tunnels.value) return []
    return Object.values(tunnels.value)
  })

  const onlineTunnels = computed(() => {
    return tunnelsArray.value.filter(tunnel => tunnel.Status === 'online')
  })

  // 获取隧道列表
  const getTunnels = async (page = 1, page_size = 10) => {
    loading.value = true
    try {
      const res = await tunnelApi.getTunnel({ page, page_size })
      if (res.code === 200) {
        tunnels.value = res.tunnel
        if (res.pagination) {
          pagination.value = res.pagination
        }
      } else {
        window.message.error('获取隧道列表失败 ' + res.msg)
      } 
    } catch (error) {
      window.message.error('获取隧道列表失败 ' + error)
    } finally {
      loading.value = false
    }
  }

  // 创建隧道
  const createTunnel = async (data: CreateTunnelRequest) => {
    creating.value = true
    try {
      const res = await tunnelApi.createTunnel(data)
      if (res.code === 200) {
        window.message.success('创建隧道成功')
        await getTunnels(pagination.value.page, pagination.value.page_size)
        return true
      } else {
        window.message.error('创建隧道失败 ' + res.msg)
      }
      return false
    } catch (error) {
      window.message.error('创建隧道失败 ' + error)
      return false
    } finally {
      creating.value = false
    }
  }

  // 编辑隧道
  const editTunnel = async (data: EditTunnelRequest) => {
    try {
      const res = await tunnelApi.editTunnel(data)
      if (res.code === 200) {
        window.message.success('编辑隧道成功')
        await getTunnels(pagination.value.page, pagination.value.page_size)
        return true
      } 
      window.message.error('编辑隧道失败 ' + res.msg)
      return false
    } catch (error) {
      window.message.error('编辑隧道失败 ' + error)
      return false
    }
  }

  // 删除隧道
  const deleteTunnel = async (id: number) => {
    try {
      // 删除前先停止相关进程
      if (process.value[id]) {
        invoke('stop_frpc', { id }).catch((error) => {
          console.error('停止隧道进程失败:', error)
        })
        await process.value[id].unlisten?.then(unlisten => unlisten())
        handleProcessStatus(id.toString(), 'Stopped')
        // 给进程一些时间停止
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      const res = await tunnelApi.deleteTunnel({ id })
      if (res.code === 200) {
        window.message.success('删除隧道成功')
        
        // 清理本地进程状态
        if (process.value[id]) {
          delete process.value[id]
        }
        
        await getTunnels(pagination.value.page, pagination.value.page_size)
        return true
      } else {
        window.message.error('删除隧道失败 ' + res.msg)
      }
      return false
    } catch (error: any) {
      let errorMessage = '删除隧道失败'
      if (error.message === '服务器无响应') {
        errorMessage = '删除隧道失败：服务器连接超时，请检查网络连接后重试'
      } else if (error.message?.includes('Network Error')) {
        errorMessage = '删除隧道失败：网络连接错误，请检查网络后重试'
      } else if (error.message?.includes('timeout')) {
        errorMessage = '删除隧道失败：请求超时，请稍后重试'
      } else {
        errorMessage = '删除隧道失败：' + error.message
      }
      window.message.error(errorMessage, {
        duration: 5000,
        closable: true
      })
      console.error('删除隧道错误:', error)
      return false
    }
  }

  // 获取隧道状态
  const getTunnelStatus = async (ids: string[]) => {
    statusLoading.value = true
    try {
      const res = await tunnelApi.getTunnelStatus({ id: ids })
      if (res.code === 200) {
        tunnelStatus.value = res.data
      } else {
        window.message.error('获取隧道状态失败 ' + res.msg)
      }
    } catch (error) {
      window.message.error('获取隧道状态失败 ' + error)
    } finally {
      statusLoading.value = false
    }
  }

  // 强制关闭隧道
  const closeTunnel = async (id: number) => {
    try {
      const res = await tunnelApi.closeTunnel({ id })
      if (res.code === 200) {
        window.message.success(`关闭隧道 ${res.data.proxyName} 成功`)
        // 更新进程状态
        if (process.value[id]) {
          process.value[id].status = 'Stopped'
          process.value[id].logs.push({
            type: 'info',
            content: '隧道强制已关闭'
          })
        }
        return true
      } else {
        window.message.error('关闭隧道失败 ' + res.msg)
      }
      return false
    } catch (error) {
      window.message.error('关闭隧道失败 ' + error)
      return false
    }
  }

  // 启动隧道进程
  const startTunnel = async (id: number, token: string) => {
    process.value[id] = {
      status: 'Ready',
      logs: []
    }
    startedToastShown.value[id] = false
    errorToastShown.value[id] = false

    try {
      await invoke('run_frpc', { id, token })
      
      // 存储unlisten函数，用于后续停止隧道时调用
      process.value[id].unlisten = listen(`message-${id}`, (event) => {
        handleProcessOutput(id.toString(), event.payload as string)
      })
      process.value[id].unlistenError = listen(`error-${id}`, (event) => {
        handleProcessError(id.toString(), event.payload as string)
      })
      process.value[id].unlistenTerminated = listen(`terminated-${id}`, (event) => {
        handleProcessTerminated(id.toString(), event.payload as string)
      })

      handleProcessStatus(id.toString(), 'Running')
      return true
    } catch (error: any) {
      console.error('启动隧道进程失败:', error)
      const errorStr = String(error)
      
      // 检查是否是因为frpc缺失
      if (
        errorStr.includes('Failed to create sidecar command') || 
        errorStr.includes('Failed to spawn sidecar') || 
        errorStr.includes('program not found') ||
        errorStr.includes('The system cannot find the file specified')
      ) {
        window.dialog.error({
          title: '组件缺失',
          content: '核心组件 frpc 未找到，可能已被杀毒软件误删。\n请尝试重新安装软件，并将其添加到白名单中。',
          positiveText: '确定'
        })
      } else {
        window.message.error('启动隧道失败: ' + errorStr)
      }

      if (process.value[id]) {
        process.value[id].status = 'Failed'
        process.value[id].logs.push({
          type: 'error',
          content: '启动失败: ' + errorStr
        })
      }
      return false
    }
  }

  // 停止隧道进程
  const stopTunnel = async (id: number) => {
    invoke('stop_frpc', { id }).catch((error) => {
      console.error('停止隧道失败:', error)
      if (process.value[id]) {
        process.value[id].status = 'Failed'
        process.value[id].logs.push({
          type: 'error',
          content: '停止隧道失败: ' + error
        })
      }
    })
    // 调用unlisten函数，移除事件监听
    await process.value[id].unlisten?.then(unlisten => unlisten())
    await process.value[id].unlistenError?.then(unlisten => unlisten())
    await process.value[id].unlistenTerminated?.then(unlisten => unlisten())
    handleProcessStatus(id.toString(), 'Stopped')
    if (process.value[id]) {
      // 延迟检查状态，给进程时间退出
      setTimeout(() => {
        if (process.value[id] && process.value[id].status === 'Failed') {
          window.message.error('隧道异常退出，可能是权限问题或进程已被系统终止')
        } else {
          window.message.info('隧道已停止')
        }
      }, 1000)
    }
  }

  // 停止所有隧道进程
  const stopAllTunnels = async () => {
    const ids = Object.keys(process.value)
    for (const id of ids) {
      await stopTunnel(Number(id))
    }
  }

  // 处理进程输出
  const handleProcessOutput = async (id: string, output: string) => {
    let type: TypeEnum = 'info'
    if (process.value[id]) {
      if (output.includes('[I]')) {
        type = 'info'
      } else if (output.includes('[W]')) {
        type = 'warning'
      } else if (output.includes('[E]')) {
        type = 'error'
      }
      process.value[id].logs.push({
        type,
        content: output.replace(/'/g, '').trim()
      })  
      
      if (output.includes('隧道启动成功') && !startedToastShown.value[id]) {
        startedToastShown.value[id] = true
        window.message.success('隧道启动成功')
      }

      if (output.includes('启动错误') && !errorToastShown.value[id]) {
        const idx = output.indexOf('启动错误')
        let reason = output.substring(idx)
        const parts = reason.split(':')
        if (parts.length > 1) {
          reason = parts.slice(1).join(':').trim()
        }
        errorToastShown.value[id] = true
        window.message.error('隧道启动错误：' + reason, { duration: 6000, closable: true })
        invoke('stop_frpc', { id }).catch((error) => {
          console.error('停止隧道进程失败:', error)
        })
        if (process.value[id]) {
          process.value[id].status = 'Failed'
          process.value[id].logs.push({
            type: 'error',
            content: '检测到启动错误，已自动结束进程'
          })
        }
      }
    }
  }

  // 处理进程错误
  const handleProcessError = (id: string, error: string) => {
    if (process.value[id]) {
      process.value[id].logs.push({
        type: 'error',
        content: error
      })
      process.value[id].status = 'Failed'
      
      if (!errorToastShown.value[id]) {
        errorToastShown.value[id] = true
        window.message.error('隧道错误：' + error, { duration: 6000, closable: true })
      }
    }
  }

  // 处理进程终止
  const handleProcessTerminated = (id: string, message: string) => {
    if (process.value[id]) {
       // 如果是主动停止的，忽略非错误退出码（或者根据需求调整）
       // 但通常 terminated 事件意味着进程没了
       
       process.value[id].logs.push({
        type: 'error', // 终止通常算作错误或警告，视情况而定
        content: message
      })
      
      // 如果状态已经是 Stopped (比如用户点了停止)，则不需要变成 Failed
      if (process.value[id].status !== 'Stopped') {
         process.value[id].status = 'Failed'
         if (!errorToastShown.value[id]) {
            errorToastShown.value[id] = true
            window.message.error('隧道已终止：' + message, { duration: 6000, closable: true })
         }
      }
      
      // 清理后端状态（虽然进程已死，但确保万一）
      invoke('stop_frpc', { id: Number(id) }).catch(() => {})
    }
  }

  // 处理进程状态变化
  const handleProcessStatus = (id: string, status: ProcessStatus) => {
    if (process.value[id]) {
      process.value[id].status = status
      if (status === 'Failed') {
        const tunnelName = tunnels.value?.[id]?.ProxyName || `隧道 #${id}`
        process.value[id].logs.push({
          type: 'error',
          content: `隧道 ${tunnelName} 异常退出 - 这可能是由于网络连接问题、权限不足或进程被系统终止导致的`
        })
        
        // 提供更具体的错误提示
        window.message.error(`隧道 ${tunnelName} 异常退出`, {
          duration: 5000,
          closable: true
        })

        if (!errorToastShown.value[id]) {
          const logs = process.value[id].logs || []
          let detail = ''
          for (let i = logs.length - 1; i >= 0; i--) {
            const c = logs[i].content || ''
            if (c.includes('启动错误') || c.includes('进程退出错误')) {
              detail = c
              break
            }
            if (!detail && logs[i].type === 'error') {
              detail = c
            }
          }
          if (detail) {
            errorToastShown.value[id] = true
            window.message.error('隧道失败：' + detail, { duration: 6000, closable: true })
          }
        }
      }
    }
  }

  // init
  getTunnels().then(async () => {
    // 处理刷新的隧道
    const frpcIds = Object.keys(process.value)
    for (const id of frpcIds) {
      if (tunnels.value?.[id]) {
        process.value[id] = {
          status: 'Running',
          logs: []
        }
      }
    }

    // 处理数据，把远程运行隧道打入
    if (tunnels.value && typeof tunnels.value === 'object') {
      for (const key of Object.keys(tunnels.value)) {
        const tunnel = tunnels.value[key];
        if (tunnel.Status === 'online') {
          process.value[tunnel.Id.toString()] = {
            status: 'RemoteRunning',
            logs: [
              {
                type: 'info',
                content: '隧道已经在别处运行'
              }
            ]
          }
        }
      }
    }
  }).catch((error) => {
    console.error('获取隧道列表失败:', error)
  })

  return {
    // 状态
    tunnels,
    tunnelStatus,
    loading,
    statusLoading,
    creating,
    pagination,
    process,

    // 计算属性
    tunnelsArray,
    onlineTunnels,

    // 方法
    getTunnels,
    createTunnel,
    editTunnel,
    deleteTunnel,
    getTunnelStatus,
    closeTunnel,
    startTunnel,
    stopTunnel,
    stopAllTunnels,
  }
})
