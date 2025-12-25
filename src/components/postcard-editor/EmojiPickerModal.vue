<template>
  <BaseModal :is-open="isOpen" :padding="false" @close="emit('close')">
    <div class="rounded-lg shadow-xl bg-[var(--color-modal-bg)]">
      <EmojiPicker :native="true" @select="emit('select', $event)" />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'
import BaseModal from '../BaseModal.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', emoji: { i: string }): void
}>()
</script>
