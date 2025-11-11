<script setup lang="ts">
import {useRouter} from "vue-router";
import AppButton from './components/Button.vue'
import FormInput from './components/FormInput.vue';
</script>

<template>
  <FormInput label="Email" type="email" placeholder="Enter your email" required />
  <router-view></router-view>
</template>

<style scoped></style>
