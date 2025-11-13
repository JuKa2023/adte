import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router';

import GalleryPage from './GalleryPage.vue';
import LandingPage from './LandingPage.vue';
import RegisterPage from './RegisterPage.vue';
import PostcardCreationPage from './PostcardEditorPage.vue'

const router = createRouter(
  {
    history: createWebHistory(),
    routes: [
      {
      path: "/",
      component: LandingPage,
      name: "landing",
      },
      {
        path: "/register",
        component: RegisterPage,
        name: "register",
      },
      {
        path: "/gallery",
        component: GalleryPage,
        name: "gallery",
      },
      {
        path: "/create",
        component: PostcardCreationPage,
        name: "postcard creation page"
      },
    ],
  }
);

createApp(App).use(router).mount('#app')
