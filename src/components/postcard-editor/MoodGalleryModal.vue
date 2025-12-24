<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    style="background-color: var(--color-modal-overlay)"
    @click.self="emit('close')"
  >
    <div
      class="rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-[var(--color-modal-bg)] text-[var(--color-font)]"
    >
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Wähle eine Stimmung</h2>
        <button
          @click="emit('close')"
          class="hover:opacity-70 text-[var(--color-text-muted)]"
          aria-label="Schliessen"
        >
          ✕
        </button>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          v-for="(img, idx) in moodImages"
          :key="idx"
          class="aspect-video rounded-md overflow-hidden hover:ring-2 ring-[var(--color-highlight)] transition-all"
          @click="emit('select', img)"
        >
          <img :src="img" class="w-full h-full object-cover" loading="lazy" alt="" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean
  moodImages: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', img: string): void
}>()
</script>
