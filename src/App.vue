<script setup lang="ts">
import { useRouter } from 'vue-router'
import FormInput from './components/FormInput.vue'
import Header from './components/Header.vue'
import { Toaster } from 'vue-sonner'
</script>

<template>
  <div>
    <Header />
    <Toaster position="top-right" rich-colors />
    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped></style>
