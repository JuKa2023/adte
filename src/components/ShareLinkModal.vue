<template>
  <BaseModal :is-open="isOpen" :z-index="80" @close="$emit('close')">
    <div
      class="rounded-lg p-6 max-w-md w-full shadow-2xl space-y-5 text-center relative overflow-hidden"
      style="background-color: var(--color-modal-bg); color: var(--color-font)"
    >
      <div
        class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 opacity-50"
      ></div>

      <div class="space-y-1 mt-2">
        <h3 class="text-xl font-semibold tracking-tight">Fertig!</h3>
        <p class="text-sm" style="color: var(--color-text-muted)">Hier ist dein Link zum Teilen.</p>
      </div>

      <div class="relative group">
        <div
          class="flex items-center gap-2 p-1.5 rounded-sm border transition-colors duration-200"
          :class="
            copied
              ? 'border-green-400 bg-green-50/50'
              : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/50'
          "
        >
          <div class="flex-1 min-w-0 px-2 font-mono text-sm truncate opacity-80 select-all">
            {{ link }}
          </div>
          <button
            @click="copyLink"
            class="flex-shrink-0 p-2 rounded-sm transition-all duration-200"
            :class="
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-white shadow-sm hover:shadow text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            "
            :aria-label="copied ? 'Kopiert' : 'Link kopieren'"
          >
            <span v-if="copied" class="material-icons text-sm font-bold">check</span>
            <span v-else class="material-icons text-sm">content_copy</span>
          </button>
        </div>
      </div>

      <div class="text-xs text-center opacity-40">Link kopieren und mit der Welt teilen.</div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import BaseModal from './BaseModal.vue'

const props = defineProps<{
  isOpen: boolean
  link: string
}>()

defineEmits<{
  (e: 'close'): void
}>()

const copied = ref(false)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.link)
    copied.value = true
    toast.success('Link kopiert!')
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    toast.error('Konnte Link nicht kopieren.')
  }
}
</script>
