import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/ContactView.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/CheckoutView.vue'),
      beforeEnter: (to, from, next) => {
        // Check if user is logged in using localStorage
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
        if (!isLoggedIn) {
          // Redirect to login page with return URL
          next({ path: '/login', query: { returnTo: to.fullPath } })
        } else {
          next()
        }
      }
    },
    {
      path: '/product/page',
      name: 'product-page',
      component: () => import('@/views/ProductPageView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/components/Register.vue')
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/OrdersView.vue'),
      beforeEnter: (to, from, next) => {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
        if (!isLoggedIn) {
          // Redirect to login page with return URL
          next({ path: '/login', query: { returnTo: to.fullPath } })
        } else {
          next()
        }
      }
    }
  ],
})

export default router
