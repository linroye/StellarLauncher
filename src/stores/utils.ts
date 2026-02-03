import { defineStore } from 'pinia'

export default defineStore('utils', () => {
  /**
   * 格式化流量单位
   * @param bytes 字节数
   * @returns 格式化后的流量字符串
   */
  const formatTraffic = (bytes: number | undefined): string => {
    if (bytes === undefined) return '0 B'
    
    if (bytes === 0) return '0 B'
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    
    // 如果值太小或负值，返回B
    if (i < 0) return `${bytes} B`
    
    // 最大显示到TB
    const unitIndex = Math.min(i, units.length - 1)
    
    // 计算对应单位的值并保留2位小数
    return `${(bytes / Math.pow(1024, unitIndex)).toFixed(2)} ${units[unitIndex]}`
  }

  /**
   * 格式化带宽
   * @param bandwidth 带宽值（单位：MB，需要转换为 Mbps）
   * @returns 格式化后的带宽字符串
   */
  const formatBandwidth = (bandwidth: number | undefined): string => {
    if (bandwidth === undefined) return '不限制'
    
    if (bandwidth === 0) return '不限制'
    
    // 将 MB 转换为 Mbps（1 MB = 8 Mbps）
    const mbps = bandwidth * 8
    
    return `${mbps.toFixed(2)} Mbps`
  }

  /**
   * 格式化日期
   * @param dateStr 日期字符串
   * @returns 格式化后的日期字符串，如果为空则返回'-'
   */
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return '-'
    
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    } catch (error) {
      return '-'
    }
  }

  /**
   * 计算剩余流量
   * @param used 已使用流量
   * @param total 总流量
   * @returns 剩余流量
   */
  const calculateRemainingTraffic = (used: number, total: number): number => {
    if (total === 0) return 0 // 无限流量
    return Math.max(0, total - used)
  }

  /**
   * 计算流量使用百分比
   * @param used 已使用流量
   * @param total 总流量
   * @returns 使用百分比
   */
  const calculateTrafficPercentage = (used: number, total: number): number => {
    if (total === 0) return 0 // 避免除以零
    return Math.min(Math.round((used / total) * 100), 100)
  }

  /**
   * 根据百分比获取对应的颜色
   * @param percentage 百分比值
   * @returns 颜色代码
   */
  const getColorByPercentage = (percentage: number): string => {
    if (percentage < 70) return '#18a058' // 绿色
    if (percentage < 90) return '#f0a020' // 黄色
    return '#d03050' // 红色
  }

  /**
   * 计算资源使用百分比
   * @param used 已使用资源
   * @param total 总资源
   * @returns 使用百分比
   */
  const calculateResourcePercentage = (used: number, total: number): number => {
    if (total === 0) return 0
    return Number(((used / total) * 100).toFixed(2))
  }

  return {
    formatTraffic,
    formatBandwidth,
    formatDate,
    calculateRemainingTraffic,
    calculateTrafficPercentage,
    getColorByPercentage,
    calculateResourcePercentage
  }
}) 