/// <reference types="vite/client" />
import { DefineComponent } from 'vue'
import type { MessageApi } from 'naive-ui'

declare global {
  declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
  }
  interface Window {
    message: MessageApi
  }
}