import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue')
    },
    {
      path: '/create-tunnel',
      name: 'create-tunnel',
      component: () => import('@/views/CreateTunnel.vue')
    },
    {
      path: '/manage-tunnels',
      name: 'manage-tunnels',
      component: () => import('@/views/ManageTunnels.vue')
    },
    {
      path: '/tunnel-logs',
      name: 'tunnel-logs',
      component: () => import('@/views/TunnelLogs.vue')
    },
    {
      path: '/premium-services',
      name: 'premium-services',
      component: () => import('@/views/PremiumServices.vue')
    },
    {
      path: '/user-info',
      name: 'user-info',
      component: () => import('@/views/UserInfo.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/Settings.vue')
    }
  ],
})

export default router
