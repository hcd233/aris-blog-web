import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import AuthCallback from '../views/AuthCallback.vue'
import TagList from '../tag/TagList.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/posts',
      name: 'posts',
      component: () => import('../views/Posts.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallback
    },
    {
      path: '/tag',
      name: 'tag',
      component: TagList
    },
    {
      path: '/user/:userName/posts',
      name: 'user-posts',
      component: () => import('../views/UserPosts.vue')
    },
    {
      path: '/user/:userName/article/create',
      name: 'create-post',
      component: () => import('../views/CreatePost.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/:userName/article/:slug',
      name: 'post-detail',
      component: () => import('../views/PostDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/:userName/article/:slug/edit',
      name: 'edit-post',
      component: () => import('../views/EditPost.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 保存用户想要访问的页面
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router 