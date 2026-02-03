import { nodeApi } from '@/api'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { NodeListResponse, NodeInfoResponse } from '@/api/types/node'

export default defineStore('node', () => {
  // 节点列表
  const nodeList = ref<NodeListResponse['data'] | null>(null)
  
  // 节点信息
  const nodeInfo = ref<NodeInfoResponse['data'] | null>(null)
  
  // 节点流量统计
  const trafficSummary = ref<NodeInfoResponse['summary'] | null>(null)
  
  // 当前选中的节点ID
  const currentNodeId = ref<string | null>(null)
  
  // 加载状态
  const loading = ref(false)
  
  // 计算属性
  const nodesArray = computed(() => {
    if (!nodeList.value) return []
    return Object.values(nodeList.value).sort((a, b) => {
      // 按节点ID排序
      return parseInt(a.ID) - parseInt(b.ID)
    })
  })
  
  const onlineNodes = computed(() => {
    if (!nodeInfo.value) return []
    return Object.entries(nodeInfo.value)
      .filter(([_, info]) => info.Status === 'online')
      .map(([id, info]) => ({
        id,
        ...info
      }))
  })
  
  const offlineNodes = computed(() => {
    if (!nodeInfo.value) return []
    return Object.entries(nodeInfo.value)
      .filter(([_, info]) => info.Status !== 'online')
      .map(([id, info]) => ({
        id,
        ...info
      }))
  })
  
  const currentNode = computed(() => {
    if (!currentNodeId.value || !nodeList.value) return null
    return nodeList.value[currentNodeId.value] || null
  })
  
  const currentNodeInfo = computed(() => {
    if (!currentNodeId.value || !nodeInfo.value) return null
    return nodeInfo.value[currentNodeId.value] || null
  })
  
  // 获取节点类型映射表
  const nodeTypeMap = computed(() => {
    if (!nodeList.value) return {}
    
    const typeMap: Record<string, string[]> = {}
    
    Object.values(nodeList.value).forEach(node => {
      typeMap[node.ID] = node.AllowedTypes
    })
    
    return typeMap
  })
  
  // 根据节点类型筛选节点
  const getNodesByType = (type: string) => {
    if (!nodeList.value) return []
    
    return Object.values(nodeList.value).filter(node => 
      node.AllowedTypes.includes(type)
    )
  }

  // 获取节点列表
  const getNodeList = async () => {
    loading.value = true
    try {
      const res = await nodeApi.getNodeList()
      if (res.code === 200) {
        nodeList.value = res.data
      } else {
        window.message.error('获取节点列表失败 ' + res.msg)
      }
    } catch (error) {
      window.message.error('获取节点列表失败 ' + error)
    } finally {
      loading.value = false
    }
  }

  // 获取节点信息
  const getNodeInfo = async () => {
    loading.value = true
    try {
      const res = await nodeApi.getNodeInfo()
      if (res.code === 200) {
        nodeInfo.value = res.data
        trafficSummary.value = res.summary
      } else {
        window.message.error('获取节点信息失败 ' + res.msg)
      }
    } catch (error) {
      window.message.error('获取节点信息失败 ' + error)
    } finally {
      loading.value = false
    }
  }

  // 设置当前节点
  const setCurrentNode = (id: string | null) => {
    currentNodeId.value = id
  }
  
  // 刷新所有节点数据
  const refreshAllNodeData = async () => {
    await Promise.all([
      getNodeList(),
      getNodeInfo()
    ])
  }

  // 初始化时获取节点数据
  refreshAllNodeData()

  return {
    // 状态
    nodeList,
    nodeInfo,
    trafficSummary,
    currentNodeId,
    loading,
    
    // 计算属性
    nodesArray,
    onlineNodes,
    offlineNodes,
    currentNode,
    currentNodeInfo,
    nodeTypeMap,
    
    // 方法
    getNodeList,
    getNodeInfo,
    getNodesByType,
    setCurrentNode,
    refreshAllNodeData
  }
})