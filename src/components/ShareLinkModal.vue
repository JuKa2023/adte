<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[80] flex items-center justify-center p-4"
    style="background-color: var(--color-modal-overlay)"
    @click.self="$emit('close')"
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
        <button @click="$emit('close')" class="hover:opacity-70" style="color: var(--color-text-muted)">
          <span class="material-icons">close</span>
        </button>
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
          <button
            type="button"
            class="px-3 py-2 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all"
            style="background-color: var(--color-primary)"
            @click="copyLink"
          >
            {{ copied ? 'Kopiert' : 'Kopieren' }}
          </button>
        </div>
        <p class="text-xs" style="color: var(--color-text-muted)">
          Der Link kann weitergegeben werden, um die Postkarte anzusehen.
        </p>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          class="px-4 py-2 rounded-md hover:bg-black/5 transition-colors"
          style="color: var(--color-text-muted)"
          @click="$emit('close')"
        >
          Schließen
        </button>
        <button
          type="button"
          class="px-4 py-2 rounded-md text-white font-medium shadow-md hover:shadow-lg transition-all"
          style="background-color: var(--color-primary)"
          @click="$emit('goToGallery')"
        >
          Zur Galerie
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

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
