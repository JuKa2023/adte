<template>
  <PostcardFaceShell side="front" :is-active="isActive" overflow-visible>
    <div
      class="flex items-center justify-center h-full w-full overflow-hidden relative bg-[var(--color-card-bg)]"
      @drop.prevent="onDropFile"
      @dragover.prevent
      @click="onBackgroundClick"
    >
      <PostcardFrontMedia :image-url="frontImage">
        <div
          class="w-full h-full flex flex-col items-center justify-center gap-2 z-10 pointer-events-none"
        >
          <span class="material-icons text-6xl text-[var(--color-icon-light)]"
            >add_photo_alternate</span
          >
          <p class="font-light text-[var(--color-placeholder)]">Füge eine Mediadatei hinzu</p>
        </div>
      </PostcardFrontMedia>

      <PostcardElementsLayer
        class="z-20"
        :elements="elements"
        :canvas-width="canvasWidth"
        :canvas-height="canvasHeight"
        side="front"
        :active-element-id="activeElementId"
        :interactive="isActive"
        @update:active-element-id="emit('update:activeElementId', $event)"
        @delete-element="emit('delete-element', $event)"
      />

      <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="onFileSelected" />
    </div>
  </PostcardFaceShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PostcardElement } from '../../backend'
import PostcardElementsLayer from './PostcardElementsLayer.vue'
import PostcardFaceShell from '../postcard/PostcardFaceShell.vue'
import PostcardFrontMedia from '../postcard/PostcardFrontMedia.vue'

const props = defineProps<{
  elements: PostcardElement[]
  frontImage: string | null
  activeElementId: string | null
  isActive: boolean
  canvasWidth: number
  canvasHeight: number
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
