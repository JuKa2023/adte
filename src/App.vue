<script setup lang="ts">
import { useRouter } from 'vue-router'
import FormInput from './components/FormInput.vue'
import Header from './components/Header.vue'
</script>

<template>
  <div class="m-8">
    <Header />
    <div>
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped></style>
