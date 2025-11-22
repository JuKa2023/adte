<template>
  <header class="sticky top-0 z-40 backdrop-blur ml-4 mr-4">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <nav class="flex flex-col space-y-4">
        <!-- Postkarte erstellen -->
        <RouterLink to="/create" class="group flex items-center space-x-2 text-[var(--color-highlight)]">
          <span class="text-lg transition-transform duration-200 group-hover:scale-120"> › </span>
          <span class="text-lg font-medium transition-transform duration-200 group-hover:scale-110">
            Postkarte erstellen
          </span>
        </RouterLink>

        <RouterLink
          to="/login"
          class="group flex items-center space-x-2 text-[var(--color-highlight)]"
        >
          <span class="text-lg transition-transform duration-200 group-hover:scale-120"> › </span>
          <span class="text-lg font-medium transition-transform duration-200 group-hover:scale-110">
            Anmelden
          </span>
        </RouterLink>
      </nav>

      <Button class="px-3 py-1.5 text-xs font-medium" type="button" @click="toggleTheme" variant="ghost">
        <span v-if="isDark">🌙</span>
        <span v-else>☀️</span>
      </Button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Button from './Button.vue'

const isDark = ref(false)

const applyTheme = (dark) => {
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
