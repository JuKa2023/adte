<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[70] flex items-center justify-center p-4"
    style="background-color: var(--color-modal-overlay)"
    @click.self="$emit('close')"
  >
    <div
      class="rounded-lg p-6 max-w-md w-full shadow-2xl"
      style="background-color: var(--color-modal-bg); color: var(--color-font)"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Postkarte speichern</h2>
        <button
          @click="$emit('close')"
          class="hover:opacity-70"
          style="color: var(--color-text-muted)"
        >
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="flex flex-col gap-6">
        <!-- Recipient -->
        <div class="flex flex-col gap-2">
          <label class="font-medium">E-Mail des Empfängers</label>
          <input
            type="email"
            v-model="recipientEmail"
            class="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
            style="background-color: var(--color-bg); border-color: var(--color-border); color: var(--color-font)"
            placeholder="empfaenger@beispiel.de"
          />
          <p v-if="recipientError" class="text-sm text-red-500">{{ recipientError }}</p>
        </div>

        <!-- Send Option -->
        <div class="flex flex-col gap-3">
          <label class="font-medium">Wann soll die Karte gesendet werden?</label>
          
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="sendOption"
                value="now"
                class="w-4 h-4 text-[var(--color-highlight)] focus:ring-[var(--color-highlight)]"
              />
              <span>Sofort senden</span>
            </label>
            
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="sendOption"
                value="later"
                class="w-4 h-4 text-[var(--color-highlight)] focus:ring-[var(--color-highlight)]"
              />
              <span>Später senden</span>
            </label>
          </div>
        </div>

        <!-- Date Picker (only if 'later') -->
        <div v-if="sendOption === 'later'" class="flex flex-col gap-2 animate-fade-in">
          <label class="text-sm font-medium" style="color: var(--color-text-muted)">
            Zeitpunkt wählen
          </label>
          <input
            type="datetime-local"
            v-model="scheduledTime"
            class="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
            style="background-color: var(--color-bg); border-color: var(--color-border); color: var(--color-font)"
            :min="minDate"
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-4">
          <button
            @click="$emit('close')"
            class="px-4 py-2 rounded-md hover:bg-black/5 transition-colors"
            style="color: var(--color-text-muted)"
          >
            Abbrechen
          </button>
          <button
            @click="handleSave"
            class="px-6 py-2 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all transform active:scale-95"
            style="background-color: var(--color-primary)"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center gap-2">
              <span class="animate-spin material-icons text-sm">refresh</span>
              Speichern...
            </span>
            <span v-else>Speichern</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'

const props = defineProps<{
  isOpen: boolean
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: { sent: boolean; scheduledTime?: string; recipientEmail: string }): void
}>()

const sendOption = ref<'now' | 'later'>('now')
const scheduledTime = ref('')
const recipientEmail = ref('')
const recipientError = ref('')

const minDate = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const handleSave = () => {
  const isSent = sendOption.value === 'now'

  if (!recipientEmail.value) {
    recipientError.value = 'Bitte gib eine E-Mail ein.'
    toast.error(recipientError.value)
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(recipientEmail.value)) {
    recipientError.value = 'Bitte gib eine gültige E-Mail-Adresse ein.'
    toast.error(recipientError.value)
    return
  }

  recipientError.value = ''
  
  if (sendOption.value === 'later' && !scheduledTime.value) {
    toast.error('Bitte wähle einen Zeitpunkt aus.')
    return
  }

  const scheduledTimeValue =
    sendOption.value === 'later'
      ? new Date(scheduledTime.value).toISOString()
      : new Date().toISOString()

  emit('save', {
    sent: false,
    scheduledTime: scheduledTimeValue,
    recipientEmail: recipientEmail.value
  })
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
