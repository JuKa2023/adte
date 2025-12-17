<template>
  <header class="fixed top-0 left-0 right-0 z-50 bg-[var(--color-sidebar-bg)] backdrop-blur-md border-b border-gray-100 h-14">
    <div class="flex h-full items-center justify-between px-6">
      <div class="flex items-center gap-6">
        <RouterLink
          to="/"
          class="text-lg font-semibold tracking-tight text-[var(--color-font)] hover:text-[var(--color-highlight)] transition-colors"
        >
          ADTE
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-6">
        <RouterLink
          v-if="isAuthed"
          to="/create"
          class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity hover:underline underline-offset-3"
        >
          <span class="text-md">
            Postkarte erstellen
          </span>
        </RouterLink>

        <RouterLink
          v-if="isAuthed"
          to="/gallery"
          class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity hover:underline underline-offset-3"
        >
          <span class="text-md">
            Meine Galerie
          </span>
        </RouterLink>

        <RouterLink
          v-if="!isAuthed"
          to="/login"
          class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity hover:underline underline-offset-3"
        >
          <span class="text-md">
            Anmelden
          </span>
        </RouterLink>


        </nav>
      </div>

      <div class="flex items-center gap-4">
        <!-- Desktop User Info and Logout -->
        <div v-if="isAuthed" class="hidden md:block text-sm" style="color: var(--color-text-muted)">
          Eingeloggt als <span class="font-medium" style="color: var(--color-font)">{{ userLabel }}</span>
        </div>

        <div v-if="isAuthed" class="hidden md:flex">
          <Button
            class="rounded-full px-4 py-2"
            type="button"
            variant="ghost"
            @click="handleLogout"
          >
            Logout
          </Button>
        </div>

        <!-- Theme Toggle (visible on all screens) -->
        <Button class="w-8 h-8 flex items-center justify-center" type="button" @click="toggleTheme" variant="ghost" iconOnly>
          <template #icon>
            <span v-if="isDark" class="text-lg">🌙</span>
            <span v-else class="text-lg">☀️</span>
          </template>
        </Button>

        <!-- Burger Menu Button (mobile only) -->
        <Button
          class="md:hidden w-8 h-8 flex items-center justify-center"
          type="button"
          variant="ghost"
          iconOnly
          @click="toggleMobileMenu"
        >
          <template #icon>
            <span class="text-2xl">☰</span>
          </template>
        </Button>
      </div>
    </div>

    <!-- Mobile Menu Overlay -->
    <Teleport to="body">
      <Transition name="mobile-menu">
        <div
          v-if="isMobileMenuOpen"
          class="fixed top-14 left-0 right-0 bottom-0 z-40 md:hidden bg-white dark:bg-[#151a26]"
          @click="closeMobileMenu"
        >
          <nav class="flex flex-col items-end gap-6 pt-12 px-6">
            <RouterLink
              v-if="isAuthed"
              to="/create"
              class="text-xl font-medium text-[var(--color-highlight)] hover:opacity-80 transition-opacity"
              @click="closeMobileMenu"
            >
              Postkarte erstellen
            </RouterLink>

            <RouterLink
              v-if="isAuthed"
              to="/gallery"
              class="text-xl font-medium text-[var(--color-highlight)] hover:opacity-80 transition-opacity"
              @click="closeMobileMenu"
            >
              Meine Galerie
            </RouterLink>

            <RouterLink
              v-if="!isAuthed"
              to="/login"
              class="text-xl font-medium text-[var(--color-highlight)] hover:opacity-80 transition-opacity"
              @click="closeMobileMenu"
            >
              Anmelden
            </RouterLink>



            <Button
              v-if="isAuthed"
              class="rounded-full px-6 py-2 text-lg"
              type="button"
              variant="ghost"
              @click="handleLogout"
            >
              Logout
            </Button>
          </nav>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { currentUser, logoutUser } from '../backend'
import Button from './Button.vue'

const isDark = ref(false)
const isMobileMenuOpen = ref(false)
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

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = () => {
  closeMobileMenu()
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

<style scoped>
/* Mobile menu transition */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: transform 0.3s ease;
}

.mobile-menu-enter-from {
  transform: translateY(-10px);
}

.mobile-menu-leave-to {
  transform: translateY(-10px);
}

.mobile-menu-enter-to,
.mobile-menu-leave-from {
  transform: translateY(0);
}
</style>
