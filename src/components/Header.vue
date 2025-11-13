<template>
  <header class="sticky top-0 z-40 backdrop-blur">
    <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
      <nav class="flex flex-col gap-4">
        <RouterLink to="/"
          class="group flex items-center gap-2 text-[var(--color-highlight)]"
        >
          <span class="text-xl transition-transform duration-200 group-hover:scale-110" >
            ›
          </span>

          <!-- Text -->
          <span
            class="text-xl font-medium transition-transform duration-200 group-hover:scale-105"
          >
            Postkarte erstellen
          </span>
        </RouterLink>

        <!-- Anmelden -->
        <RouterLink
          to="/login"
          class="group flex items-center gap-2 text-[var(--color-highlight)]"
        >
          <span
            class="text-xl transition-transform duration-200 group-hover:scale-110"
          >
            ›
          </span>

          <span
            class="text-xl font-medium transition-transform duration-200 group-hover:scale-105"
          >
            Anmelden
          </span>
        </RouterLink>
      </nav>

      <button
        class="rounded-lg border border-[var(--color-highlight)] px-3 py-1.5 text-xs font-medium"
        type="button"
        @click="toggleTheme"
      >
        <span v-if="isDark">🌙</span>
        <span v-else>☀️</span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

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
