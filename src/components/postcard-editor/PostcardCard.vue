<template>
  <div class="perspective-1000 relative flex items-center gap-8">
    <div
      :class="[
        'relative transition-all duration-700 transform-style-3d postcard-container',
        { 'is-landscape': isLandscape },
      ]"
      :style="{
        transform: isFront ? 'rotateY(0deg)' : 'rotateY(180deg)',
        aspectRatio: isLandscape ? '3/2' : '2/3',
      }"
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
</template>

<script setup lang="ts">
import type { PostcardElement } from '../../backend'
import PostcardBackFace from './PostcardBackFace.vue'
import PostcardFrontFace from './PostcardFrontFace.vue'

defineProps<{
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
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.postcard-container {
  --card-max-w: min(95vw, calc(100vw - 3rem));
  --card-max-h: calc(100vh - 20rem);
  max-width: var(--card-max-w);
  max-height: var(--card-max-h);
  width: min(var(--card-max-w), calc(var(--card-max-h) * 2 / 3));
  height: auto;
}

.postcard-container.is-landscape {
  width: min(var(--card-max-w), calc(var(--card-max-h) * 3 / 2));
}

@media (min-width: 768px) {
  .postcard-container {
    --card-max-w: min(calc(100vw - 14rem), 900px);
    --card-max-h: calc(100vh - 14rem);
  }

  .postcard-container.is-landscape {
    --card-max-w: min(calc(100vw - 14rem), 1200px);
  }
}

@media (min-width: 1024px) {
  .postcard-container {
    --card-max-w: min(calc(100vw - 16rem), 1000px);
    --card-max-h: calc(100vh - 12rem);
  }

  .postcard-container.is-landscape {
    --card-max-w: min(calc(100vw - 16rem), 1400px);
  }
}

@media (min-width: 1440px) {
  .postcard-container {
    --card-max-w: min(calc(100vw - 20rem), 1100px);
  }

  .postcard-container.is-landscape {
    --card-max-w: min(calc(100vw - 20rem), 1600px);
  }
}
</style>
