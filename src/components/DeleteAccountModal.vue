<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" @click.self="close">
      <div class="bg-[var(--color-sidebar-bg)] border border-gray-700 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 class="text-xl font-bold text-[var(--color-font)] mb-4">Account löschen</h2>
        
        <p class="text-[var(--color-text-muted)] mb-6">
          Möchtest du deinen Account wirklich unwiderruflich löschen? Alle deine Daten und Postkarten gehen damit verloren.
        </p>

        <div class="flex justify-end gap-3">
          <Button variant="ghost" @click="close">
            Abbrechen
          </Button>
          <Button variant="danger" :disabled="isLoading" @click="confirmDelete">
            {{ isLoading ? 'Löscht...' : 'Account löschen' }}
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from './Button.vue'

const props = defineProps<{
  isOpen: boolean
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const close = () => {
  if (!props.isLoading) {
    emit('close')
  }
}

const confirmDelete = () => {
  emit('confirm')
}
</script>
