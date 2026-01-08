<template>
  <BaseModal :is-open="isOpen" @close="close">
    <div
      class="bg-[var(--color-sidebar-bg)] p-6 rounded-lg shadow-xl max-w-md w-full mx-4 border border-[var(--color-border)] animate-in fade-in zoom-in duration-200"
    >
      <h2 class="text-xl font-bold text-[var(--color-font)] mb-4">Postkarte zurücksetzen?</h2>

      <p class="text-[var(--color-text-muted)] mb-8 leading-relaxed">
        Möchtest du wirklich ganz von vorne anfangen? Alle bisherigen Änderungen an deiner Postkarte gehen dabei verloren.
      </p>

      <div class="flex justify-end gap-3">
        <Button variant="ghost" @click="close">
          Abbrechen
        </Button>
        <Button variant="danger" @click="confirm" class="shadow-md hover:shadow-lg transition-shadow">
          <template #icon>
            <span class="material-icons text-lg">delete_sweep</span>
          </template>
          Alles zurücksetzen
        </Button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '../BaseModal.vue'
import Button from '../Button.vue'

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
