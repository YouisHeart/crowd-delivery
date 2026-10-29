import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import HallView from '../views/HallView.vue'
import TaskCenterView from '../views/TaskCenterView.vue'
import RouteView from '../views/RouteView.vue'
import EarningsView from '../views/EarningsView.vue'
import ProfileView from '../views/ProfileView.vue'
import OrderDetailView from '../views/OrderDetailView.vue'
import OrderResultView from '../views/OrderResultView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: { bottomNav: true, navKey: 'home', statusTheme: 'dark' },
  },
  {
    path: '/hall',
    name: 'hall',
    component: HallView,
    meta: { bottomNav: true, navKey: 'hall', statusTheme: 'light' },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TaskCenterView,
    meta: { bottomNav: false, statusTheme: 'light' },
  },
  {
    path: '/route',
    name: 'route',
    component: RouteView,
    meta: { bottomNav: true, navKey: 'route', statusTheme: 'light' },
  },
  {
    path: '/earnings',
    name: 'earnings',
    component: EarningsView,
    meta: { bottomNav: true, navKey: 'earnings', statusTheme: 'light' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { bottomNav: true, navKey: 'profile', statusTheme: 'light' },
  },
  {
    path: '/orders/:id',
    name: 'order-detail',
    component: OrderDetailView,
    meta: { bottomNav: false, statusTheme: 'map' },
  },
  {
    path: '/orders/:id/result/:result?',
    name: 'order-result',
    component: OrderResultView,
    meta: { bottomNav: false, statusTheme: 'light' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { bottomNav: false, statusTheme: 'light' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const pageTitles = {
  home: '首页',
  hall: '订单大厅',
  tasks: '我的任务',
  route: '路线规划',
  earnings: '收益',
  profile: '个人中心',
  'order-detail': '订单详情',
  'order-result': '订单结果',
  settings: '设置',
}

router.afterEach((to) => {
  const title = pageTitles[to.name] || ''
  document.title = `${title} · 狗团众包`
})

export default router
