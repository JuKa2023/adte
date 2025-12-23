<template>
  <div ref="wrapperRef" class="w-full h-full flex items-center justify-center overflow-hidden relative">
    <div
      class="origin-center transition-transform duration-100 ease-out shadow-2xl"
      :style="{
        width: isLandscape ? '900px' : '600px',
        height: isLandscape ? '600px' : '900px',
        transform: `scale(${scale})`
      }"
    >
      <div class="relative w-full h-full perspective-1000">
        <div
          class="relative w-full h-full transform-style-3d transition-all duration-700"
          :style="{ transform: isFront ? 'rotateY(0deg)' : 'rotateY(180deg)' }"
        >
          <PostcardFrontFace
            :is-active="isFront"
            :elements="elements"
            :front-image="frontImage"
            :active-element-id="activeElementId"
            @update:front-image="emit('update:frontImage', $event)"
            @update:active-element-id="emit('update:activeElementId', $event)"
            @delete-element="emit('delete-element', $event)"
          />

          <PostcardBackFace
            :is-active="!isFront"
            :is-landscape="isLandscape"
            :elements="elements"
            :active-element-id="activeElementId"
            :message="message"
            :audio-url="audioUrl"
            @update:active-element-id="emit('update:activeElementId', $event)"
            @update:message="emit('update:message', $event)"
            @update:audio-url="emit('update:audioUrl', $event)"
            @update:audio-blob="emit('update:audioBlob', $event)"
            @delete-element="emit('delete-element', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { PostcardElement } from '../../backend'
import PostcardBackFace from './PostcardBackFace.vue'
import PostcardFrontFace from './PostcardFrontFace.vue'

const props = defineProps<{
  isFront: boolean
  isLandscape: boolean
  elements: PostcardElement[]
  frontImage: string | null
  activeElementId: string | null
  message: string
  audioUrl: string | null
}>()

const emit = defineEmits<{
  (e: 'update:frontImage', value: string | null): void
  (e: 'update:activeElementId', value: string | null): void
  (e: 'update:message', value: string): void
  (e: 'update:audioUrl', value: string | null): void
  (e: 'update:audioBlob', value: Blob | null): void
  (e: 'delete-element', id: string): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const scale = ref(1)

const updateScale = () => {
  if (!wrapperRef.value) return
  
  const { clientWidth, clientHeight } = wrapperRef.value
  // Leave some padding
  const padding = 40
  const availableW = Math.max(0, clientWidth - padding)
  const availableH = Math.max(0, clientHeight - padding)

  const targetW = props.isLandscape ? 900 : 600
  const targetH = props.isLandscape ? 600 : 900

  const scaleW = availableW / targetW
  const scaleH = availableH / targetH

  // Scale to fit, but allow slight upscale if screen is large, but mostly fit
  scale.value = Math.min(scaleW, scaleH)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(() => updateScale())
    resizeObserver.observe(wrapperRef.value)
    updateScale()
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(() => props.isLandscape, () => {
  // Update scale immediately when orientation changes
  setTimeout(updateScale, 0)
})
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}
</style>
