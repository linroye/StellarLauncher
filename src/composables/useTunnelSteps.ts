import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useMessage } from 'naive-ui'
import type { TunnelFormState } from './useTunnelForm'

export interface StepsState {
  currentStep: number
  createSuccess: boolean
}

export function useTunnelSteps(formState: Ref<TunnelFormState>) {
  const message = useMessage()
  const state = ref<StepsState>({
    currentStep: 0,
    createSuccess: false
  })

  const stepOneStatus = computed(() => {
    if (state.value.currentStep === 0) return 'process'
    return state.value.currentStep > 0 ? 'finish' : 'wait'
  })

  const stepTwoStatus = computed(() => {
    if (state.value.currentStep === 1) return 'process'
    if (state.value.currentStep < 1) return 'wait'
    return state.value.currentStep > 1 ? 'finish' : 'wait'
  })

  const stepThreeStatus = computed(() => {
    if (state.value.currentStep === 2) return 'process'
    if (state.value.currentStep < 2) return 'wait'
    return state.value.currentStep > 2 ? 'finish' : 'wait'
  })

  const stepFourStatus = computed(() => {
    if (state.value.currentStep === 3) {
      return state.value.createSuccess ? 'finish' : 'error'
    }
    return 'wait'
  })

  function nextStep() {
    if (state.value.currentStep >= 3) return
    
    if (state.value.currentStep === 0 && !formState.value.selectedNodeId) {
      message.warning('请选择一个节点')
      return
    }
    
    if (state.value.currentStep === 1 && !formState.value.selectedType) {
      message.warning('请选择一个隧道类型')
      return
    }
    
    if (state.value.currentStep === 0) {
      formState.value.formValue.nodeId = parseInt(formState.value.selectedNodeId)
    }
    
    state.value.currentStep++
  }

  function prevStep() {
    if (state.value.currentStep > 0) {
      state.value.currentStep--
    }
  }

  function resetSteps() {
    state.value.currentStep = 0
    state.value.createSuccess = false
  }

  return {
    state,
    stepOneStatus,
    stepTwoStatus,
    stepThreeStatus,
    stepFourStatus,
    nextStep,
    prevStep,
    resetSteps
  }
} 