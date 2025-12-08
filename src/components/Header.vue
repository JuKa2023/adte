<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--color-sidebar-bg)] backdrop-blur-md border-b border-gray-100 h-14">
    <div class="flex h-full items-center justify-between px-6">
      <div class="flex items-center gap-6">
        <RouterLink
          to="/"
          class="text-lg font-semibold tracking-tight text-[var(--color-font)] hover:text-[var(--color-highlight)] transition-colors"
        >
          PostcardCreator
        </RouterLink>

        <nav class="flex items-center gap-6">
        <RouterLink
          v-if="isAuthed"
          to="/create"
          class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity underline underline-offset-3"
        >
          <span class="text-md">
            Postkarte erstellen
          </span>
        </RouterLink>

        <RouterLink
          v-if="isAuthed"
          to="/gallery"
          class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity underline underline-offset-3"
        >
          <span class="text-md">
            Meine Galerie
          </span>
        </RouterLink>

        <RouterLink
          v-if="!isAuthed"
          to="/login"
          class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity underline underline-offset-3"
        >
          <span class="text-md">
            Anmelden
          </span>
        </RouterLink>

        <RouterLink
          v-if="!isAuthed"
          to="/register"
          class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity underline underline-offset-3"
        >
          <span class="text-md">
            Registrieren
          </span>
        </RouterLink>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <div v-if="isAuthed" class="text-sm" style="color: var(--color-text-muted)">
          Eingeloggt als <span class="font-medium" style="color: var(--color-font)">{{ userLabel }}</span>
        </div>

        <Button
          v-if="isAuthed"
          class="rounded-full px-4 py-2"
          type="button"
          variant="ghost"
          @click="handleLogout"
        >
          Logout
        </Button>

        <Button class="w-8 h-8 flex items-center justify-center" type="button" @click="toggleTheme" variant="ghost" iconOnly>
          <template #icon>
            <span v-if="isDark" class="text-lg">🌙</span>
            <span v-else class="text-lg">☀️</span>
          </template>
        </Button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { currentUser, logoutUser } from '../backend'
import Button from './Button.vue'

const isDark = ref(false)
const router = useRouter()

const isAuthed = computed(() => !!currentUser.value)
const userLabel = computed(() => currentUser.value?.username || currentUser.value?.email || 'Nutzer')

const applyTheme = (dark: boolean) => {
  const root = document.documentElement
  root.classList.toggle('dark', dark)
  isDark.value = dark
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const toggleTheme = () => {
  applyTheme(!isDark.value)
}

const handleLogout = () => {
  logoutUser()
  router.push('/login')
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
