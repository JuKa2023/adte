<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: var(--color-modal-overlay)"
    @click.self="emit('close')"
  >
    <div class="rounded-lg shadow-xl bg-[var(--color-modal-bg)]">
      <EmojiPicker :native="true" @select="emit('select', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', emoji: { i: string }): void
}>()
</script>
