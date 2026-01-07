<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 text-center" style="background: var(--bg-shared-page)">
    <div class="max-w-md w-full bg-[var(--color-card-bg)] rounded-lg shadow-xl p-8 border border-[var(--color-border)]">
      <div class="mb-6 text-6xl animate-bounce">👋</div>
      <h1 class="text-3xl font-bold mb-4 bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-primary)] bg-clip-text text-transparent">
        Schade, dass du gehst!
      </h1>
      <p class="text-[var(--color-text-muted)] text-lg mb-8 leading-relaxed">
        Dein Account wurde erfolgreich gelöscht. Wir hoffen, dich bald wieder bei uns begrüssen zu dürfen!
      </p>
      
      <Button 
        @click="router.push('/')"
        class="rounded-full !px-8 !py-3 shadow-lg hover:shadow-xl"
      >
        zur Startseite
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import Button from './components/Button.vue'

const router = useRouter()

onMounted(() => {
  // Ensure we are truly logged out cleanly
  localStorage.removeItem('pocketbase_auth')
})
</script>
