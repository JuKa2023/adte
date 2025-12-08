<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import { loginUser } from './backend'
import FormInput from './components/FormInput.vue'
import Button from './components/Button.vue'

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)

const router = useRouter()
const route = useRoute()

const emailError = computed(() => {
  if (!email.value) return ''
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email.value) ? '' : 'Bitte gib eine gültige E-Mail-Adresse ein.'
})

const handleLogin = async () => {
  if (!email.value || !password.value) {
    toast.error('Bitte fülle alle Felder aus.')
    return
  }

  if (emailError.value) {
    toast.error(emailError.value)
    return
  }

  isSubmitting.value = true
  try {
    await loginUser({ email: email.value, password: password.value })
    toast.success('Erfolgreich angemeldet.')
    const redirect = (route.query.redirect as string) || '/gallery'
    router.push(redirect)
  } catch (error: any) {
    toast.error(error?.message || 'Anmeldung fehlgeschlagen.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page-default flex items-center justify-center pt-20 px-8">
    <div class="w-full max-w-lg rounded-xl shadow-xl p-8" style="background-color: var(--color-card-bg)">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold mb-2" style="color: var(--color-font)">Willkommen zurück</h1>
        <p class="text-sm" style="color: var(--color-text-muted)">Melde dich an, um deine Postkarten zu sehen und neue zu erstellen.</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <FormInput
          id="email"
          v-model="email"
          label="E-Mail"
          placeholder="deine@email.de"
          type="email"
          required
          :error="emailError"
        />

        <FormInput
          id="password"
          v-model="password"
          label="Passwort"
          placeholder="••••••••"
          type="password"
          required
          :show-clear="false"
        />

        <div class="flex justify-end">
          <Button class="btn btn-lg btn-primary mt-4" :disabled="isSubmitting" type="submit">
            {{ isSubmitting ? 'Anmelden...' : 'Anmelden' }}
          </Button>
        </div>

        <p class="text-sm text-center" style="color: var(--color-text-muted)">
          Noch keinen Account?
          <RouterLink to="/register" class="text-[var(--color-highlight)] hover:underline">Registrieren</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
