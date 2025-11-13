<script setup lang="ts">
import { useRouter } from 'vue-router'
import FormInput from './components/FormInput.vue'
import Header from './components/Header.vue'
</script>

<template class="bg-[--color-bg] min-h-screen">
  <Header />

  <div class="p-6">
    <FormInput label="Email" type="email" placeholder="Enter your email" required />
    <router-view></router-view>
  </div>
</template>

<style scoped></style>
