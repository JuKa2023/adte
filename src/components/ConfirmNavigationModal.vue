<template>
  <BaseModal :is-open="isOpen" @close="close">
    <div
      class="bg-[var(--color-sidebar-bg)] p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-[var(--color-border)]"
    >
      <h2 class="text-xl font-bold text-[var(--color-font)] mb-4">Postkarte verlassen?</h2>

      <p class="text-[var(--color-text-muted)] mb-6">
        Wenn du jetzt zur Galerie wechselst, geht dein aktueller Fortschritt an der Postkarte verloren.
      </p>

      <div class="flex justify-end gap-3">
        <Button variant="ghost" @click="close">
          Abbrechen
        </Button>
        <Button variant="primary" @click="confirm">
          Trotzdem verlassen
        </Button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue'
import Button from './Button.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const close = () => {
  emit('close')
}

const confirm = () => {
  emit('confirm')
  close()
}
</script>
