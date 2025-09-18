import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Client/HomeView.vue'

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
      component: () => import('@/views/Client/AboutView.vue'),
    },
    {
      path: '/admin/edit-product/:id',
      name: 'admin-edit-product',
      component: () => import('@/views/Admin/EditProductView.vue')
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/Client/ProductsView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/Client/ContactView.vue')
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/Client/CartView.vue')
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: () => import('@/views/Client/CheckoutView.vue'),
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
      component: () => import('@/views/Client/ProductPageView.vue')
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
      component: () => import('@/views/Client/OrdersView.vue'),
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
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/Admin/DashboardView.vue')
    },
    {
      path: '/admin/analytics',
      name: 'admin-analytics',
      component: () => import('@/views/Admin/AnalyticsView.vue')
    },
    {
      path: '/admin/stock',
      name: 'admin-stock',
      component: () => import('@/views/Admin/StockView.vue')
    },
    {
      path: '/admin/add-product',
      name: 'admin-add-product',
      component: () => import('@/views/Admin/AddProductView.vue')
    }
  ],
})

export default router
