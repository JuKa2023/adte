import { createApp } from 'vue'
import './style.css'
import 'vue-sonner/style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { pb } from './backend'

import MyGalleryPage from './MyGalleryPage.vue'
import LandingPage from './LandingPage.vue'

import PostcardCreationPage from './PostcardEditorPage.vue'
import LoginPage from './LoginPage.vue'
import SharedPostcardPage from './SharedPostcardPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: LandingPage,
      name: 'landing',
    },

    {
      path: '/login',
      component: LoginPage,
      name: 'login',
    },
    {
      path: '/gallery',
      component: MyGalleryPage,
      name: 'gallery',
      meta: { requiresAuth: true },
    },
    {
      path: '/create',
      component: PostcardCreationPage,
      name: 'postcard creation page',
      meta: { requiresAuth: true, hideFooter: true },
    },
    {
      path: '/share/:id',
      component: SharedPostcardPage,
      name: 'shared postcard view',
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !pb.authStore.model) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }
  next()
})

createApp(App).use(router).mount('#app')
