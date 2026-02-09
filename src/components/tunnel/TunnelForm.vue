<template>
  <div>
    <!-- 返回按钮，仅在非编辑模式显示 -->
    <div class="step-header" v-if="!isEdit">
      <n-button size="small" @click="$emit('prev')" class="back-button" quaternary round>
        <template #icon>
          <n-icon><ArrowBackOutline /></n-icon>
        </template>
        返回选择类型
      </n-button>
    </div>
    
    <n-card class="form-card glass" size="small" embedded>
      <template #header>
        <n-flex align="center" :size="8">
          <n-el class="form-icon">
            <n-icon><SettingsOutline /></n-icon>
          </n-el>
          <n-text strong>隧道配置详情</n-text>
        </n-flex>
      </template>
      
      <n-form
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="100"
        size="small"
        require-mark-placement="right-hanging"
      >
        <n-grid :cols="2" :x-gap="24" :y-gap="12" responsive="screen">
          <n-grid-item span="2">
            <n-form-item label="隧道名称" path="proxyName">
              <n-input-group>
                <n-input v-model:value="formValue.proxyName" placeholder="请输入隧道名称" round/>
                <n-button @click="generateRandomName" type="primary" ghost round>
                  <template #icon>
                    <n-icon><RefreshOutline /></n-icon>
                  </template>
                  随机
                </n-button>
              </n-input-group>
            </n-form-item>
          </n-grid-item>
          
          <n-grid-item span="1 xs:2">
            <n-form-item label="本地IP" path="localIp">
              <n-input v-model:value="formValue.localIp" placeholder="请输入本地IP" round/>
            </n-form-item>
          </n-grid-item>
          
          <n-grid-item span="1 xs:2">
            <n-form-item label="本地端口" path="localPort">
              <n-input-group>
                <n-input-number v-model:value="formValue.localPort" :min="1" :max="65535" round/>
                <n-button type="primary" ghost round @click="openProcessPicker">
                  选择进程
                </n-button>
              </n-input-group>
            </n-form-item>
          </n-grid-item>
          
          <n-grid-item span="1 xs:2" v-if="selectedType.toLowerCase() !== 'https'">
            <n-form-item label="远程端口" path="remotePort">
              <n-input-group>
                <n-input-number 
                  v-model:value="formValue.remotePort" 
                  :min="portRange.min" 
                  :max="portRange.max" 
                  :disabled="isHttpOrHttps"
                  round
                />
                <n-button 
                  @click="generateRandomPort" 
                  type="primary" 
                  ghost 
                  round
                  v-if="!isHttpOrHttps && nodeId && nodeStore.nodeList?.[nodeId]?.PortRange"
                >
                  <template #icon>
                    <n-icon><RefreshOutline /></n-icon>
                  </template>
                  随机
                </n-button>
                <n-tooltip v-if="isHttpOrHttps" trigger="hover">
                  <template #trigger>
                    <n-button type="info" ghost round>
                      <template #icon>
                        <n-icon><InformationCircleOutline /></n-icon>
                      </template>
                      默认
                    </n-button>
                  </template>
                  {{ selectedType.toLowerCase() === 'http' ? 'HTTP默认使用80端口' : 'HTTPS默认使用443端口' }}
                </n-tooltip>
              </n-input-group>
              <template #feedback v-if="!isHttpOrHttps && nodeId && nodeStore.nodeList && nodeStore.nodeList[nodeId]?.PortRange">
                <span>节点端口范围限制: {{ nodeStore.nodeList[nodeId].PortRange }}</span>
              </template>
            </n-form-item>
          </n-grid-item>
          
          <n-grid-item span="1 xs:2" v-else>
            <n-form-item label="SSL证书配置" path="autoTls">
              <n-flex align="center" style="width: 100%">
                <n-switch v-model:value="formValue.autoTls" />
                <n-select
                  v-if="formValue.autoTls"
                  v-model:value="selectedSslId"
                  :options="sslOptions"
                  placeholder="请选择证书"
                  :loading="loadingSSL"
                  :disabled="!formValue.domain"
                  clearable
                  style="flex: 1"
                  size="small"
                >
                  <template #empty>
                    <n-flex vertical align="center" :size="4" style="padding: 8px 0;">
                      <n-text depth="3">{{ !formValue.domain ? '请先选择域名' : '该域名下无可用证书' }}</n-text>
                      <n-button 
                        text 
                        type="primary" 
                        size="small"
                        tag="a"
                        href="https://console.stellarfrp.top/dns"
                        target="_blank"
                      >
                        去控制台配置
                      </n-button>
                    </n-flex>
                  </template>
                </n-select>
              </n-flex>
            </n-form-item>
          </n-grid-item>
          
          <n-grid-item span="1 xs:2" v-if="selectedType.toLowerCase() === 'https'">
            <n-form-item label="域名" path="domain">
              <n-select
                v-model:value="formValue.domain"
                :options="domainOptions"
                :loading="loadingDomains"
                placeholder="请选择域名"
                clearable
              >
                <template #empty>
                  <n-flex vertical align="center" :size="4" style="padding: 8px 0;">
                    <n-text depth="3">暂无可用域名</n-text>
                    <n-button 
                      text 
                      type="primary" 
                      size="small"
                      tag="a"
                      href="https://console.stellarfrp.top/dns"
                      target="_blank"
                    >
                      去控制台绑定
                    </n-button>
                  </n-flex>
                </template>
              </n-select>
            </n-form-item>
          </n-grid-item>
          <n-grid-item span="1 xs:2" v-else-if="isHttpOrHttps">
            <n-form-item label="域名" path="domain">
              <n-input v-model:value="formValue.domain" placeholder="请输入域名" round/>
            </n-form-item>
          </n-grid-item>
        </n-grid>
        
        <n-divider style="margin: 16px 0" />
        
        <!-- 高级选项区域，非编辑模式显示 -->
        <template v-if="!isEdit">
          <n-collapse-transition :show="showAdvanced">
            <div class="advanced-options">
              <n-card size="small" class="advanced-options-card" embedded>
                <!-- 访问密钥 -->
                <n-form-item label="访问密钥" path="accessKey">
                  <n-input 
                    v-model:value="formValue.accessKey" 
                    placeholder="可选，用于访问验证" 
                    round
                  />
                </n-form-item>

                <!-- HTTP/HTTPS特有选项 -->
                <template v-if="isHttpOrHttps">
                  <n-form-item label="Host重写" path="hostHeaderRewrite">
                    <n-input 
                      v-model:value="formValue.hostHeaderRewrite" 
                      placeholder="可选，重写Host头" 
                      round
                    />
                  </n-form-item>

                  <n-form-item label="X-From-Where" path="headerXFromWhere">
                    <n-input 
                      v-model:value="formValue.headerXFromWhere" 
                      placeholder="可选，添加X-From-Where头" 
                      round
                    />
                  </n-form-item>
                </template>

                <!-- HTTPS特有选项 -->
                <template v-if="selectedType && selectedType.toLowerCase() === 'https'">
                  <n-divider style="margin: 8px 0 16px 0; font-size: 12px; color: var(--n-text-color-3);">HTTPS 高级选项</n-divider>
                  <!-- 此处已移除之前的证书手动输入部分，改为在主表单中通过 autoTls 配置 -->
                </template>

                <!-- 功能开关 -->
                <div class="feature-switches">
                  <n-form-item label="功能开关" label-placement="left" label-width="auto">
                    <div class="switches-container">
                      <n-space vertical :size="12">
                        <n-checkbox v-model:checked="formValue.useEncryption">
                          <n-space align="center" :size="4">
                            <n-icon color="#18a058" class="feature-icon">
                              <ShieldCheckmarkOutline />
                            </n-icon>
                            <span>使用加密</span>
                          </n-space>
                        </n-checkbox>

                        <n-checkbox v-model:checked="formValue.useCompression">
                          <n-space align="center" :size="4">
                            <n-icon color="#2080f0" class="feature-icon">
                              <ArchiveOutline />
                            </n-icon>
                            <span>使用压缩</span>
                          </n-space>
                        </n-checkbox>
                      </n-space>
                    </div>
                  </n-form-item>
                </div>

                <!-- 代理协议版本 -->
                <n-form-item label="代理协议版本" label-placement="left" label-width="auto">
                  <n-radio-group v-model:value="formValue.proxyProtocolVersion" size="small">
                    <n-space>
                      <n-radio value="">不使用</n-radio>
                      <n-radio value="v1">v1</n-radio>
                      <n-radio value="v2">v2</n-radio>
                    </n-space>
                  </n-radio-group>
                </n-form-item>
              </n-card>
            </div>
          </n-collapse-transition>

          <!-- 高级选项切换按钮 -->
          <n-button 
            text
            size="small" 
            @click="$emit('update:showAdvanced', !showAdvanced)" 
            class="advanced-toggle-btn"
          >
            <template #icon>
              <n-icon>
                <component :is="showAdvanced ? 'ChevronUpOutline' : 'ChevronDownOutline'" />
              </n-icon>
            </template>
            {{ showAdvanced ? '收起高级选项' : '显示高级选项' }}
          </n-button>
        </template>

        <!-- 提交按钮 -->
        <n-form-item style="margin-top: 16px;">
          <n-button type="primary" @click="handleSubmit" :loading="tunnelStore.creating" class="submit-button">
            <template #icon>
              <n-icon><RocketOutline /></n-icon>
            </template>
            <slot name="submit-text">创建隧道</slot>
          </n-button>
        </n-form-item>
      </n-form>
    </n-card>

    <n-modal v-model:show="showProcessPicker" preset="card" title="选择本地进程" style="width: 720px;" size="small" :bordered="false" class="process-modal">
      <div class="process-picker-content">
        <n-input-group style="margin-bottom: 12px;">
          <n-input v-model:value="processSearch" placeholder="搜索进程名、PID或端口..." round clearable>
            <template #prefix>
              <n-icon><SearchOutline /></n-icon>
            </template>
          </n-input>
          <n-button type="primary" secondary @click="refreshProcesses" :loading="loadingProcesses" round>
            <template #icon>
              <n-icon><RefreshOutline /></n-icon>
            </template>
            刷新列表
          </n-button>
        </n-input-group>
        
        <div class="table-wrapper">
          <n-data-table 
            :columns="processColumns" 
            :data="filteredProcesses" 
            :loading="loadingProcesses" 
            size="small"
            :max-height="400"
            :virtual-scroll="true"
            :single-line="false"
            striped
          />
        </div>
        
        <div class="process-footer">
          <n-text depth="3" style="font-size: 12px;">
            共找到 {{ filteredProcesses.length }} 个可用进程
          </n-text>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, h } from 'vue'
import type { FormInst } from 'naive-ui'
import { useNodeStore, useTunnelStore } from '@/stores'
import type { CreateTunnelRequest } from '@/api/types/tunnel'
import { domainApi } from '@/api'
import type { SSLInfo } from '@/api/domain'
import { NButton, NTag, NFlex, NText, NSelect, NSwitch } from 'naive-ui'
import {
  ArrowBackOutline,
  RefreshOutline,
  SettingsOutline,
  ShieldCheckmarkOutline,
  ArchiveOutline,
  RocketOutline,
  InformationCircleOutline,
  SearchOutline,
  AppsOutline,
  GlobeOutline,
  ServerOutline
} from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'
import { invoke } from '@tauri-apps/api/core'

const message = useMessage()
const props = defineProps<{
  formValue: CreateTunnelRequest
  rules: any
  isHttpOrHttps: boolean
  showAdvanced: boolean
  selectedType: string
  nodeId: string
  generateRandomName: () => void
  generateRandomPort: () => void
  isEdit?: boolean // 添加编辑模式属性
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'submit'): void
  (e: 'update:showAdvanced', value: boolean): void
}>()

type ProcessPortEntry = {
  port: number
  pid?: number | null
  process?: string | null
  localIp?: string | null
}

type ProcessResponse = {
  tcp: ProcessPortEntry[]
  udp: ProcessPortEntry[]
}

type ProcessRow = {
  pid?: number | null
  name?: string
  protocol?: string
  localIp?: string
  localPort?: number
}

const formRef = ref<FormInst | null>(null)
const nodeStore = useNodeStore()
const tunnelStore = useTunnelStore()

const loadingDomains = ref(false)
const domainOptions = ref<{ label: string, value: string }[]>([])
const sslList = ref<SSLInfo[]>([])
const loadingSSL = ref(false)
const selectedSslId = ref<number | null>(null)

const showProcessPicker = ref(false)
const loadingProcesses = ref(false)
const processes = ref<ProcessRow[]>([])
const processSearch = ref('')

const processColumns = [
  { 
    title: '进程名称', 
    key: 'name',
    render(row: any) {
      return h(
        NFlex,
        { align: 'center', size: 8 },
        { default: () => [
          h(NText, { strong: true }, { default: () => row.name })
        ]}
      )
    }
  },
  { 
    title: 'PID', 
    key: 'pid', 
    width: 80,
    render(row: any) {
      return h(NText, { depth: 3, style: { fontFamily: 'monospace' } }, { default: () => row.pid })
    }
  },
  { 
    title: '协议', 
    key: 'protocol', 
    width: 80,
    render(row: any) {
      const isTcp = row.protocol?.toUpperCase().includes('TCP')
      return h(
        NTag,
        { 
          type: isTcp ? 'info' : 'warning', 
          size: 'small', 
          bordered: false,
          round: true
        },
        { default: () => row.protocol }
      )
    }
  },
  { 
    title: '本地端口', 
    key: 'localPort', 
    width: 100,
    render(row: any) {
      return h(
        NTag,
        { type: 'default', size: 'small', style: { fontFamily: 'monospace' } },
        { default: () => row.localPort }
      )
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    render(row: any) {
      return h(
        NButton,
        { 
          size: 'tiny', 
          type: 'primary', 
          secondary: true,
          round: true,
          onClick: () => selectProcess(row) 
        },
        { default: () => '选择' }
      )
    }
  }
]

const filteredProcesses = computed(() => {
  let list = processes.value
  
  // 根据选中的隧道类型过滤协议
  if (props.selectedType) {
    const currentType = props.selectedType.toLowerCase()
    const targetProtocol = currentType === 'udp' ? 'UDP' : 'TCP'
    list = list.filter(p => p.protocol === targetProtocol)
  }

  const q = processSearch.value.trim().toLowerCase()
  if (!q) return list
  
  return list.filter(p =>
    (p.name || '').toLowerCase().includes(q) ||
    String(p.pid || '').includes(q) ||
    String(p.localPort || '').includes(q)
  )
})

function openProcessPicker() {
  showProcessPicker.value = true
  if (processes.value.length === 0) {
    refreshProcesses()
  }
}

async function refreshProcesses() {
  loadingProcesses.value = true
  try {
    const res = await invoke<ProcessResponse>('get_local_ports')
    const list: ProcessRow[] = []
    if (res) {
      if (Array.isArray((res as any).tcp)) {
        for (const it of (res as any).tcp) {
          list.push({
            pid: it.pid ?? null,
            name: it.process ?? '',
            protocol: 'TCP',
            localIp: it.localIp ?? '0.0.0.0',
            localPort: it.port
          })
        }
      }
      if (Array.isArray((res as any).udp)) {
        for (const it of (res as any).udp) {
          list.push({
            pid: it.pid ?? null,
            name: it.process ?? '',
            protocol: 'UDP',
            localIp: it.localIp ?? '0.0.0.0',
            localPort: it.port
          })
        }
      }
    }
    processes.value = list
  } catch (e) {
    console.error(e)
    processes.value = []
  } finally {
    loadingProcesses.value = false
  }
}

function selectProcess(row: any) {
  if (row?.localPort) {
    props.formValue.localPort = row.localPort
  }
  if (row?.localIp && row.localIp !== '0.0.0.0') {
    props.formValue.localIp = row.localIp
  }
  showProcessPicker.value = false
}

async function fetchDomains() {
  loadingDomains.value = true
  try {
    const res = await domainApi.getMyDomains()
    if (res.code === 200 && res.domains) {
      const list = Object.values(res.domains)
      domainOptions.value = list.map(d => ({ label: d.domain, value: d.domain }))
    } else {
      domainOptions.value = []
    }
  } catch (e) {
    domainOptions.value = []
  } finally {
    loadingDomains.value = false
  }
}

async function fetchSSLList() {
  loadingSSL.value = true
  try {
    const res = await domainApi.getSSLList()
    if (res.code === 200 && res.data) {
      sslList.value = res.data
      // 加载完成后，如果有域名且开启了autoTls，尝试自动匹配证书
      if (props.formValue.domain && props.formValue.autoTls) {
        const matchingCert = sslList.value.find(item => item.domain === props.formValue.domain)
        if (matchingCert) {
          selectedSslId.value = matchingCert.id
        }
      }
    } else {
      sslList.value = []
    }
  } catch (e) {
    sslList.value = []
    console.error('获取SSL证书列表失败:', e)
  } finally {
    loadingSSL.value = false
  }
}

watch(() => props.selectedType, (val) => {
  if (val && val.toLowerCase() === 'https') {
    fetchDomains()
    fetchSSLList()
    // 切换到HTTPS时，默认开启autoTls
    props.formValue.autoTls = true
    // 切换到HTTPS时，默认设置remotePort为443，如果未设置
    if (!props.formValue.remotePort) {
      props.formValue.remotePort = 443
    }
  }
})

onMounted(() => {
  if (props.selectedType && props.selectedType.toLowerCase() === 'https') {
    fetchDomains()
    fetchSSLList()
    // 如果是新建隧道（非编辑模式），默认开启autoTls
    if (!props.isEdit) {
      props.formValue.autoTls = true
    }
  }
})

const sslOptions = computed(() => {
  if (!props.formValue.domain) return []
  return sslList.value
    .filter(item => item.domain === props.formValue.domain)
    .map(item => ({
      label: item.domain,
      value: item.id
    }))
})

// 监听域名变化，自动选择匹配的证书
watch(() => props.formValue.domain, (newDomain) => {
  if (props.formValue.autoTls && newDomain) {
    const matchingCert = sslList.value.find(item => item.domain === newDomain)
    if (matchingCert) {
      selectedSslId.value = matchingCert.id
      return
    }
  }
  selectedSslId.value = null
})

// 监听选中的证书ID变化，填充证书内容
watch(selectedSslId, (newId) => {
  if (newId) {
    const cert = sslList.value.find(item => item.id === newId)
    if (cert) {
      props.formValue.crtBase64 = cert.certificate
      props.formValue.keyBase64 = cert.private_key
    }
  } else {
    props.formValue.crtBase64 = ''
    props.formValue.keyBase64 = ''
  }
})

// 监听 autoTls 开关
watch(() => props.formValue.autoTls, (val) => {
  if (val) {
    if (props.formValue.domain) {
      const matchingCert = sslList.value.find(item => item.domain === props.formValue.domain)
      if (matchingCert) {
        selectedSslId.value = matchingCert.id
      }
    }
  } else {
    selectedSslId.value = null
  }
})


// 计算端口范围
const portRange = computed(() => {
  // HTTP/HTTPS 类型不受节点端口范围限制
  if (props.isHttpOrHttps) {
    return { min: 1, max: 65535 }
  }
  
  if (!props.nodeId || !nodeStore.nodeList || !nodeStore.nodeList[props.nodeId]?.PortRange) {
    return { min: 1, max: 65535 }
  }
  
  const range = nodeStore.nodeList[props.nodeId].PortRange.split('-')
  return {
    min: parseInt(range[0], 10) || 1,
    max: parseInt(range[1], 10) || 65535
  }
})

async function handleSubmit() {
  try {
    await formRef.value?.validate()
    emit('submit')
  } catch (err) {
    message.error('请检查表单填写是否正确')
    return
  }
}

defineExpose({
  formRef
})
</script>

<style scoped>
.step-header {
  display: flex;
  margin-bottom: 8px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.form-card {
  padding: 10px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--n-card-color);
  border: 1px solid var(--n-border-color);
}

.form-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(24, 160, 88, 0.1);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

:deep(.n-form-item) {
  margin-bottom: 8px;
}

:deep(.n-form-item-label) {
  padding-right: 8px;
  font-size: 13px;
}

:deep(.n-form-item-blank) {
  min-height: auto;
}

:deep(.n-input__input),
:deep(.n-input-number-input),
:deep(.n-button) {
  height: 30px;
}

:deep(.n-input-group__addon) {
  padding: 0;
}

.advanced-toggle-btn {
  margin-bottom: 16px;
  font-size: 13px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.advanced-toggle-btn:hover {
  transform: translateY(-1px);
}

.advanced-toggle-btn:active {
  transform: translateY(0);
}

.advanced-toggle-text {
  margin-left: 4px;
}

.advanced-options-wrapper {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.feature-checkbox {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.feature-checkbox:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: all 0.3s ease;
}

.protocol-form-item {
  margin-top: 8px;
}

.protocol-form-item :deep(.n-form-item-label) {
  font-size: 13px;
  color: var(--n-text-color-2);
}

.protocol-radio-group {
  display: flex;
  justify-content: flex-start;
}

.protocol-radio {
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.protocol-radio:hover {
  background: rgba(255, 255, 255, 0.04);
}

:deep(.n-radio.n-radio--checked) {
  background: rgba(24, 160, 88, 0.1);
}

.advanced-options-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  padding: 16px;
  border-radius: 12px;
}

.advanced-options-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

.submit-button {
  width: 100%;
  height: 38px;
  font-size: 15px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-2px);
}

.advanced-options {
  margin-bottom: 16px;
}

.advanced-options-card {
  background: var(--n-card-color);
  border: 1px solid var(--n-border-color);
  transition: all 0.3s ease;
}

.advanced-options-card :deep(.n-card__content) {
  padding: 16px;
}

.feature-switches {
  margin: 8px 0;
}

.switches-container {
  padding: 4px 0;
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
}

:deep(.n-form-item) {
  margin-bottom: 16px;
}

:deep(.n-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.n-radio-group) {
  display: flex;
  justify-content: flex-start;
}

:deep(.n-radio) {
  margin-right: 24px;
}

.advanced-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px;
  margin: 8px 0;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: var(--n-text-color-2);
}

.advanced-toggle-btn:hover {
  color: var(--n-text-color);
  background: var(--n-hover-color);
}

.submit-button {
  width: 100%;
  height: 38px;
  font-size: 15px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.submit-button:hover {
  transform: translateY(-1px);
}

.process-picker-content {
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.process-footer {
  margin-top: 8px;
  text-align: right;
  padding: 0 4px;
}

/* 隐藏表格外边框 */
:deep(.n-data-table .n-data-table-wrapper) {
  border: none;
}
</style> 
