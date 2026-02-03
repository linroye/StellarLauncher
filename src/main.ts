import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { isRegistered, register } from '@tauri-apps/plugin-deep-link'

if (!(await isRegistered('srlr'))) {
    register('srlr')
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

// 阻止右键菜单
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});
