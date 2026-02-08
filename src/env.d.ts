/// <reference types="vite/client" />
import { DefineComponent } from 'vue'
import type { MessageApi, DialogApi } from 'naive-ui'

declare global {
  declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
  }
  interface Window {
    message: MessageApi
    dialog: DialogApi
  }
}