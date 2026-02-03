import { ref, computed } from 'vue'
import { useTunnelStore, useNodeStore } from '@/stores'
import type { CreateTunnelRequest } from '@/api/types/tunnel'

export interface TunnelFormState {
  selectedNodeId: string
  selectedType: string
  showAdvanced: boolean
  formValue: CreateTunnelRequest
}

export function useTunnelForm() {
  const tunnelStore = useTunnelStore()

  const state = ref<TunnelFormState>({
    selectedNodeId: '',
    selectedType: '',
    showAdvanced: false,
    formValue: {
      nodeId: 0,
      proxyName: '',
      localIp: '127.0.0.1',
      localPort: 0,
      remotePort: 0,
      domain: '',
      proxyType: '',
      accessKey: '',
      hostHeaderRewrite: '',
      headerXFromWhere: '',
      proxyProtocolVersion: '',
      useEncryption: true,
      useCompression: true
    }
  })

  const availableTypes = computed(() => {
    const nodeStore = useNodeStore()
    const nodeId = state.value.selectedNodeId
    if (nodeId && nodeStore.nodeList && nodeStore.nodeList[nodeId]?.AllowedTypes) {
      return nodeStore.nodeList[nodeId].AllowedTypes.map(t => t.toLowerCase())
    }
    return ['tcp', 'udp', 'http', 'https']
  })

  const isHttpOrHttps = computed(() => {
    return state.value.selectedType === 'http' || state.value.selectedType === 'https'
  })

  const rules = computed(() => ({
    proxyName: {
      required: true,
      message: '请输入隧道名称',
      trigger: 'blur',
      validator: (rule: any, value: string) => {
        if (!value) return false
        if (value.length < 3 || value.length > 50) return new Error('隧道名称长度应在3-50个字符之间')
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) return new Error('隧道名称只能包含字母、数字、下划线和连字符')
        return true
      }
    },
    localPort: {
      required: true,
      type: 'number',
      message: '请输入本地端口',
      trigger: 'blur',
      validator: (rule: any, value: number) => {
        if (!value) return false
        if (value < 1 || value > 65535) return new Error('端口号必须在1-65535之间')
        return true
      }
    },
    remotePort: isHttpOrHttps.value ? undefined : {
      required: true,
      type: 'number',
      message: '请输入目标端口',
      trigger: 'blur',
      validator: (rule: any, value: number) => {
        if (!value) return false
        if (value < 1 || value > 65535) return new Error('端口号必须在1-65535之间')
        const nodeStore = useNodeStore()
        const nodeId = state.value.selectedNodeId
        if (nodeId && nodeStore.nodeList && nodeStore.nodeList[nodeId]?.PortRange) {
          const range = nodeStore.nodeList[nodeId].PortRange.split('-')
          const minPort = parseInt(range[0], 10)
          const maxPort = parseInt(range[1], 10)
          if (value < minPort || value > maxPort) {
            return new Error(`端口号必须在节点允许的范围内(${minPort}-${maxPort})`)
          }
        }
        return true
      }
    },
    localIp: {
      required: true,
      message: '请输入目标地址',
      trigger: 'blur',
      validator: (rule: any, value: string) => {
        if (!value) return false
        // IPv4地址验证
        const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        // IPv6地址验证
        const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$|^([0-9a-fA-F]{1,4}:){1,7}:$|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/
        // 主机名验证
        const hostnameRegex = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
        
        if (!ipv4Regex.test(value) && !ipv6Regex.test(value) && !hostnameRegex.test(value)) {
          return new Error('请输入有效的IP地址或主机名')
        }
        return true
      }
    },
    domain: isHttpOrHttps.value ? {
      required: true,
      message: state.value.selectedType === 'https' ? '请选择域名' : '请输入域名',
      trigger: 'blur',
      validator: (rule: any, value: string) => {
        if (!value) return false
        // 域名验证（允许通配符）
        const domainRegex = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/
        if (!domainRegex.test(value)) {
          return new Error('请输入有效的域名格式，如：example.com 或 *.example.com')
        }
        return true
      }
    } : undefined,
    accessKey: state.value.showAdvanced ? {
      validator: (rule: any, value: string) => {
        if (value && value.length > 0 && value.length < 6) {
          return new Error('访问密钥长度至少为6个字符')
        }
        return true
      },
      trigger: 'blur'
    } : undefined,
    hostHeaderRewrite: state.value.showAdvanced ? {
      validator: (rule: any, value: string) => {
        if (value && !isHttpOrHttps.value) {
          return new Error('仅HTTP/HTTPS隧道支持Host重写')
        }
        return true
      },
      trigger: 'blur'
    } : undefined
  }))

  function selectType(type: string) {
    state.value.selectedType = type
    state.value.formValue.proxyType = type
    
    const lowerType = type.toLowerCase()
    // 设置 HTTP/HTTPS 的默认端口
    if (lowerType === 'http') {
      state.value.formValue.remotePort = 80
    } else if (lowerType === 'https') {
      state.value.formValue.remotePort = 443
    } else if (lowerType === 'tcp' || lowerType === 'udp') {
      // 对于 TCP/UDP，设置为节点允许的最小端口
      const nodeStore = useNodeStore()
      const nodeId = state.value.selectedNodeId
      
      if (nodeId && nodeStore.nodeList && nodeStore.nodeList[nodeId]?.PortRange) {
        const range = nodeStore.nodeList[nodeId].PortRange.split('-')
        const minPort = parseInt(range[0], 10) || 1
        state.value.formValue.remotePort = minPort
      }
    }
  }

  function generateRandomName() {
    state.value.formValue.proxyName = `tunnel_${Math.random().toString(36).substring(2, 8)}`
  }

  function generateRandomPort() {
    const nodeStore = useNodeStore()
    const nodeId = state.value.selectedNodeId
    
    if (!nodeId || !nodeStore.nodeList || !nodeStore.nodeList[nodeId]?.PortRange) {
      return
    }
    
    const range = nodeStore.nodeList[nodeId].PortRange.split('-')
    const min = parseInt(range[0], 10) || 1
    const max = parseInt(range[1], 10) || 65535
    
    state.value.formValue.remotePort = Math.floor(Math.random() * (max - min + 1)) + min
  }

  async function validateAndSubmit(): Promise<boolean> {
    state.value.formValue.nodeId = parseInt(state.value.selectedNodeId, 10)
    state.value.formValue.proxyType = state.value.formValue.proxyType.toLowerCase()
    try {
      return await tunnelStore.createTunnel(state.value.formValue)
    } catch (error) {
      return false
    }
  }

  function resetForm() {
    state.value = {
      selectedNodeId: '',
      selectedType: '',
      showAdvanced: false,
      formValue: {
        nodeId: 0,
        proxyName: '',
        localIp: '127.0.0.1',
        localPort: 0,
        remotePort: 0,
        domain: '',
        proxyType: '',
        accessKey: '',
        hostHeaderRewrite: '',
        headerXFromWhere: '',
        proxyProtocolVersion: '',
        useEncryption: false,
        useCompression: false
      }
    }
  }

  return {
    state,
    rules,
    availableTypes,
    isHttpOrHttps,

    selectType,
    generateRandomName,
    generateRandomPort,
    validateAndSubmit,
    resetForm
  }
} 
