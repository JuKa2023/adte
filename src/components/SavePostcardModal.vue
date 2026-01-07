<template>
  <BaseModal :is-open="isOpen" :z-index="70" :close-on-backdrop="false" @close="$emit('close')">
    <div
      class="rounded-lg p-6 max-w-lg w-full shadow-2xl"
      style="background-color: var(--color-modal-bg); color: var(--color-font)"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Postkarte senden</h2>
        <button
          @click="$emit('close')"
          class="hover:opacity-70 cursor-pointer"
          style="color: var(--color-text-muted)"
        >
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="flex flex-col gap-6">
        <!-- Recipient -->
        <div class="flex flex-col gap-2">
          <label class="font-medium">E-Mail des Empfängers</label>
          <FormInput type="email" v-model="recipientEmail" placeholder="E-Mail eingeben" />
        </div>

        <!-- Send Option -->
        <div class="flex flex-col gap-3">
          <label class="font-medium">Wann soll die Karte gesendet werden?</label>

          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="sendOption" value="now" class="w-4 h-4" />
              <span>Sofort senden</span>
            </label>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" v-model="sendOption" value="later" class="w-4 h-4" />
              <span>Später senden</span>
            </label>
          </div>
        </div>

        <!-- Date Picker (only if 'later') -->
        <div v-if="sendOption === 'later'" class="flex flex-col gap-2 animate-fade-in">
          <label class="font-medium" style="color: var(--color-text-muted)">
            Zeitpunkt wählen
          </label>
          <input
            type="datetime-local"
            v-model="scheduledTime"
            class="w-full px-3 py-2 rounded-full border-[1.5px] border-solid focus:outline-none focus:ring-2 focus:ring-[var(--color-highlight)]"
            style="
              background-color: var(--color-bg);
              border-color: var(--color-border);
              color: var(--color-font);
            "
            :min="minDate"
          />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-4">
          <Button variant="ghost" @click="$emit('close')"> Abbrechen </Button>
          <Button variant="primary" @click="handleSave" :disabled="isLoading">
            <span v-if="isLoading" class="flex items-center gap-2">
              <span class="animate-spin material-icons text-sm">refresh</span>
              Wird gesendet...
            </span>
            <span v-else>Absenden</span>
          </Button>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import BaseModal from './BaseModal.vue'
import FormInput from './FormInput.vue'
import Button from './Button.vue'

defineProps<{
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

const minDate = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const handleSave = () => {
  if (!recipientEmail.value) {
    toast.error('Bitte gib eine E-Mail ein.')
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(recipientEmail.value)) {
    toast.error('Bitte gib eine gültige E-Mail-Adresse ein.')
    return
  }

  if (sendOption.value === 'later' && !scheduledTime.value) {
    toast.error('Bitte wähle einen Zeitpunkt aus.')
    return
  }

  const scheduledTimeValue =
    sendOption.value === 'later'
      ? new Date(scheduledTime.value).toISOString().replace('T', ' ')
      : new Date().toISOString().replace('T', ' ')

  emit('save', {
    sent: false,
    scheduledTime: scheduledTimeValue,
    recipientEmail: recipientEmail.value,
  })
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom radio button styling */
input[type='radio'] {
  accent-color: var(--color-highlight);
  cursor: pointer;
}
</style>
