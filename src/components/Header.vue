<template>
  <header
    class="fixed top-0 left-0 right-0 z-[100] bg-[var(--color-sidebar-bg)] backdrop-blur-md border-b border-gray-100 h-14"
  >
    <div class="flex h-full items-center justify-between px-6">
      <div class="flex items-center gap-6">
        <RouterLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
          <AdteLogo class="h-8 w-auto" />
        </RouterLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-6">
          <RouterLink
            v-if="isAuthed"
            to="/create"
            class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity hover:underline underline-offset-3"
          >
            <span class="text-lg font-medium"> Postkarte erstellen </span>
          </RouterLink>

          <RouterLink
            v-if="isAuthed"
            to="/gallery"
            class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity hover:underline underline-offset-3"
          >
            <span class="text-lg font-medium"> Meine Galerie </span>
          </RouterLink>

          <RouterLink
            v-if="!isAuthed && !isLoginPage"
            to="/login"
            class="group flex items-center gap-2 text-[var(--color-highlight)] hover:opacity-80 transition-opacity hover:underline underline-offset-3"
          >
            <span class="text-lg font-medium"> Anmelden </span>
          </RouterLink>
        </nav>
      </div>

      <div class="flex items-center gap-4">
        <!-- Desktop User Info and Logout -->
        <div v-if="isAuthed" class="hidden lg:block text-sm" style="color: var(--color-text-muted)">
          Eingeloggt als
          <span class="font-medium" style="color: var(--color-font)">{{ userLabel }}</span>
        </div>

        <div v-if="isAuthed" class="hidden lg:flex items-center gap-2">
          <Button
            class="rounded-full px-4 py-2"
            type="button"
            variant="ghost"
            @click="isDeleteModalOpen = true"
          >
            Account löschen
          </Button>

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
        <Button
          class="w-8 h-8 flex items-center justify-center"
          type="button"
          @click="toggleTheme"
          variant="ghost"
          iconOnly
        >
          <template #icon>
            <span v-if="isDark" class="text-lg">🌙</span>
            <span v-else class="text-lg">☀️</span>
          </template>
        </Button>

        <!-- Burger Menu Button (mobile only) -->
        <Button
          class="lg:hidden w-8 h-8 flex items-center justify-center"
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
          class="fixed top-14 left-0 right-0 bottom-0 z-40 lg:hidden bg-white dark:bg-[#151a26]"
          @click="closeMobileMenu"
        >
          <nav class="flex flex-col items-end gap-6 pt-12 px-6">
            <RouterLink
              v-if="isAuthed"
              to="/create"
              class="text-sm md:text-base font-medium text-[var(--color-highlight)] hover:opacity-80 transition-opacity"
              @click="closeMobileMenu"
            >
              Postkarte erstellen
            </RouterLink>

            <RouterLink
              v-if="isAuthed"
              to="/gallery"
              class="text-sm md:text-base font-medium text-[var(--color-highlight)] hover:opacity-80 transition-opacity"
              @click="closeMobileMenu"
            >
              Meine Galerie
            </RouterLink>

            <RouterLink
              v-if="!isAuthed && !isLoginPage"
              to="/login"
              class="text-sm md:text-base font-medium text-[var(--color-highlight)] hover:opacity-80 transition-opacity"
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

            <Button
              v-if="isAuthed"
              class="rounded-full px-6 py-2 text-lg text-red-500 hover:text-red-700"
              type="button"
              variant="ghost"
              @click="
                () => {
                  closeMobileMenu()
                  isDeleteModalOpen = true
                }
              "
            >
              Account löschen
            </Button>
          </nav>
        </div>
      </Transition>
    </Teleport>

    <DeleteAccountModal
      :is-open="isDeleteModalOpen"
      :is-loading="isDeleting"
      @close="isDeleteModalOpen = false"
      @confirm="handleDeleteAccount"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { currentUser, logoutUser, deleteUser } from '../backend'
import Button from './Button.vue'
import DeleteAccountModal from './DeleteAccountModal.vue'
import AdteLogo from './AdteLogo.vue'

const isDark = ref(false)
const isMobileMenuOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isDeleting = ref(false)
const router = useRouter()
const route = useRoute()

const isLoginPage = computed(() => route.path === '/login')

const isAuthed = computed(() => !!currentUser.value)
const userLabel = computed(
  () =>
    currentUser.value?.name || currentUser.value?.username || currentUser.value?.email || 'Nutzer',
)

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
  router.push('/')
}

const handleDeleteAccount = async () => {
  if (!currentUser.value?.id) return

  isDeleting.value = true
  try {
    await deleteUser(currentUser.value.id)
    isDeleteModalOpen.value = false
    
    closeMobileMenu()
    logoutUser()
    router.push('/goodbye')
  } catch (error) {
    console.error('Failed to delete account:', error)
    alert('Fehler beim Löschen des Accounts.')
  } finally {
    isDeleting.value = false
  }
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
