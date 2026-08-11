import { createRouter, createWebHistory } from 'vue-router'
import DynamicPageView from '@/views/DynamicPageView.vue'
import HomeView from '@/views/HomeView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/productos/:slug',
      name: 'product-detail',
      component: ProductDetailView,
    },
    {
      path: '/:slug',
      name: 'dynamic-page',
      component: DynamicPageView,
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
