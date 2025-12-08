<script lang="ts" setup>
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { loginUser, registerUser } from './backend'

import FormInput from './components/FormInput.vue'
import Button from './components/Button.vue'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)

const router = useRouter()
const route = useRoute()

const emailError = computed(() => {
  if (!email.value) return ''
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(email.value) ? '' : 'Bitte gib eine gültige E-Mail-Adresse ein.'
})

const register = async () => {
  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    toast.error('Bitte fülle alle Felder aus.')
    return
  }
  if (emailError.value) {
    toast.error(emailError.value)
    return
  }
  if (password.value.length < 8) {
    toast.error('Passwort muss mindestens 8 Zeichen lang sein.')
    return
  }
  if (password.value !== confirmPassword.value) {
    toast.error('Passwörter stimmen nicht überein.')
    return
  }

  isSubmitting.value = true
  try {
    await registerUser({
      name: name.value,
      email: email.value,
      password: password.value,
      passwordConfirm: confirmPassword.value,
    })

    await loginUser({ email: email.value, password: password.value })
    toast.success('Registrierung erfolgreich. Willkommen!')
    const redirect = (route.query.redirect as string) || '/gallery'
    router.push(redirect)
  } catch (err: any) {
    // Check if the error is related to duplicate email
    const errorMessage = err?.message || ''
    const errorData = err?.data?.data || {}
    
    // PocketBase returns error with field 'email' when email is already in use
    if (errorData.email || errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('already')) {
      toast.error('Diese E-Mail-Adresse wird bereits verwendet.')
    } else {
      toast.error(errorMessage || 'Fehler bei der Registrierung.')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page-default flex items-center justify-center pt-20 px-8">
    <div class="w-full max-w-lg rounded-xl shadow-xl p-8" style="background-color: var(--color-card-bg)">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold mb-2" style="color: var(--color-font)">Account erstellen</h1>
        <p class="text-sm" style="color: var(--color-text-muted)">Registriere dich, um deine Postkarten zu speichern und zu versenden.</p>
      </div>

      <form id="registerForm" class="space-y-4" @submit.prevent="register">
        <FormInput
          id="name"
          v-model="name"
          label="Name"
          placeholder="Gib deinen Namen ein"
          type="text"
          required
        />

        <FormInput
          id="email"
          v-model="email"
          label="E-Mail"
          placeholder="Gib deine E-Mail ein"
          type="email"
          required
          :error="emailError"
        />

        <FormInput
          id="password"
          v-model="password"
          label="Passwort wählen"
          placeholder="Gib dein Passwort ein"
          type="password"
          required
          :show-clear="false"
        />

        <FormInput
          id="confirm-password"
          v-model="confirmPassword"
          label="Passwort erneut eingeben"
          placeholder="Gib dein Passwort erneut ein"
          type="password"
          required
          :show-clear="false"
        />

        <div class="flex justify-end">
          <Button class="btn btn-lg btn-primary mt-8" :disabled="isSubmitting" type="submit">
            {{ isSubmitting ? 'Registrieren...' : 'Registrieren' }}
          </Button>
        </div>

        <p class="text-sm text-center" style="color: var(--color-text-muted)">
          Hast du schon ein Login?
          <RouterLink to="/login" class="text-[var(--color-highlight)] hover:underline underline-offset-4">Zum Login</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>
