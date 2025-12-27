<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[60] flex items-center justify-center p-6"
    style="background-color: var(--color-modal-overlay)"
    @click.self="emit('dismiss')"
  >
    <div class="rounded-lg p-8 max-w-md text-center shadow-2xl bg-[var(--color-modal-bg)]">
      <div class="mb-4 text-4xl">✨</div>
      <h2 class="text-2xl font-bold mb-2 text-[var(--color-font)]">
        Willkommen im Postkarten-Editor!
      </h2>
      <p class="mb-6 text-[var(--color-text-muted)]">
        Hier kannst du deine persönliche Postkarte gestalten.<br />
        Klicke auf Elemente, um sie zu bearbeiten, und ziehe sie an die gewünschte Position.
      </p>
      <Button variant="primary" @click="emit('dismiss')">Los geht's!</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '../Button.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()
</script>
