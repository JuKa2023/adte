<template>
  <div
    class="absolute inset-0 shadow-2xl overflow-visible"
    :style="{
      backfaceVisibility: 'hidden',
      pointerEvents: isActive ? 'auto' : 'none',
      backgroundColor: 'var(--color-card-bg)',
      zIndex: isActive ? 2 : 1,
    }"
  >
    <div
      class="flex items-center justify-center h-full w-full overflow-hidden relative bg-[var(--color-card-bg)]"
      @drop.prevent="onDropFile"
      @dragover.prevent
      @click="onBackgroundClick"
    >
      <img
        v-if="frontImage"
        :src="frontImage"
        class="w-full h-full object-cover absolute inset-0 pointer-events-none"
        alt="Postcard Front"
      />

      <div v-else class="flex flex-col items-center gap-2 z-10 pointer-events-none">
        <span class="material-icons text-6xl text-[var(--color-icon-light)]">add_photo_alternate</span>
        <p class="font-light text-[var(--color-placeholder)]">Füge eine Mediadatei hinzu</p>
      </div>

      <PostcardElementsLayer
        class="z-20"
        :elements="elements"
        side="front"
        :active-element-id="activeElementId"
        @update:active-element-id="emit('update:activeElementId', $event)"
        @delete-element="emit('delete-element', $event)"
      />

      <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="onFileSelected" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PostcardElement } from '../../backend'
import PostcardElementsLayer from './PostcardElementsLayer.vue'

const props = defineProps<{
  elements: PostcardElement[]
  frontImage: string | null
  activeElementId: string | null
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: 'update:frontImage', value: string | null): void
  (e: 'update:activeElementId', value: string | null): void
  (e: 'delete-element', id: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const openFileDialog = () => {
  fileInput.value?.click()
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })

const onFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !file.type.startsWith('image/')) {
    target.value = ''
    return
  }

  try {
    emit('update:frontImage', await readFileAsDataUrl(file))
  } finally {
    target.value = ''
  }
}

const onDropFile = async (event: DragEvent) => {
  const file = event.dataTransfer?.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  emit('update:frontImage', await readFileAsDataUrl(file))
}

const onBackgroundClick = () => {
  emit('update:activeElementId', null)
  if (!props.frontImage) {
    openFileDialog()
  }
}
</script>

