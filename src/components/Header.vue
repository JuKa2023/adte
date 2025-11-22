<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--color-sidebar-bg)] backdrop-blur-md border-b border-gray-100 h-14">
    <div class="flex h-full items-center justify-between px-6">
      <nav class="flex items-center gap-6">
        <!-- Postkarte erstellen -->
        <RouterLink to="/create" class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity">
          <span class="text-md">
            Postkarte erstellen
          </span>
        </RouterLink>

        <RouterLink
          to="/login"
          class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity"
        >
          <span class="text-md">
            Anmelden
          </span>
        </RouterLink>
      </nav>

      <Button class="w-8 h-8 flex items-center justify-center rounded-full" type="button" @click="toggleTheme" variant="ghost" iconOnly>
        <template #icon>
          <span v-if="isDark" class="text-lg">🌙</span>
          <span v-else class="text-lg">☀️</span>
        </template>
      </Button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Button from './Button.vue'

const isDark = ref(false)

const applyTheme = (dark: boolean) => {
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  isDark.value = dark
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
  applyTheme(!isDark.value)
}

onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved === 'dark')
    return
  }

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(systemDark)
})
</script>
