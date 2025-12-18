<script setup lang="ts">
import { useRouter } from 'vue-router'
import FormInput from './components/FormInput.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <Toaster position="top-right" rich-colors />
    <div class="flex-grow">
      <router-view></router-view>
    </div>
    <Footer v-if="!$route.meta.hideFooter" />
  </div>
</template>

<style scoped></style>
