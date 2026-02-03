import { defineStore } from 'pinia'
import { ref } from 'vue'

export default defineStore('layout', () => {
  const sidebarCollapsed = ref(false)

  return {
    sidebarCollapsed
  }
}) 