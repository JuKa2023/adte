<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[80] flex items-center justify-center p-4"
    style="background-color: var(--color-modal-overlay)"
  >
    <div
      class="rounded-lg p-6 max-w-lg w-full shadow-2xl space-y-4"
      style="background-color: var(--color-modal-bg); color: var(--color-font)"
    >
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm font-medium" style="color: var(--color-text-muted)">Teilen</p>
          <h3 class="text-xl font-semibold">Dein Share-Link</h3>
        </div>
      </div>

      <div class="space-y-2">
        <label class="text-sm" style="color: var(--color-text-muted)">Link</label>
        <div class="flex gap-2 items-center">
          <input
            readonly
            :value="link"
            class="flex-1 px-3 py-2 rounded-md border text-sm"
            style="background-color: var(--color-bg); border-color: var(--color-border); color: var(--color-font)"
          />
          <Button
            variant="primary"
            :icon-only="!copied"
            :aria-label="copied ? 'Kopiert' : 'Kopieren'"
            @click="copyLink"
          >
            <template #icon>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </template>
            <span v-if="copied">Kopiert</span>
          </Button>
        </div>
        <p class="text-xs" style="color: var(--color-text-muted)">
          Der Link kann weitergegeben werden, um die Postkarte anzusehen.
        </p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <Button
          variant="primary"
          @click="$emit('goToGallery')"
        >
          Zur Galerie
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import Button from './Button.vue'

const props = defineProps<{
  isOpen: boolean
  link: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'goToGallery'): void
}>()

const copied = ref(false)

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.link)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch (err) {
    toast.error('Konnte Link nicht kopieren.')
  }
}
</script>
