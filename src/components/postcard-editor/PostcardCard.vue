<template>
  <div ref="wrapperRef" class="w-full h-full flex items-center justify-center relative">
    <div
      class="origin-center flex-shrink-0 transition-transform duration-100 ease-out shadow-xl overflow-hidden"
      :style="{
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`,
        transform: `scale(${scale})`,
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
            :canvas-width="canvasSize.width"
            :canvas-height="canvasSize.height"
            :active-element-id="activeElementId"
            @update:front-image="emit('update:frontImage', $event)"
            @update:active-element-id="emit('update:activeElementId', $event)"
            @delete-element="emit('delete-element', $event)"
          />

          <PostcardBackFace
            :is-active="!isFront"
            :is-landscape="isLandscape"
            :message="message"
            :audio-url="audioUrl"
            :theme-id="themeId"
            :location="location"
            @update:message="emit('update:message', $event)"
            @update:audio-url="emit('update:audioUrl', $event)"
            @update:audio-blob="emit('update:audioBlob', $event)"
            @update:theme-id="emit('update:themeId', $event)"
            @update:location="emit('update:location', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PostcardElement } from '../../backend'
import { getCanvasSize } from '../../postcard/canvas'
import { useCanvasScaling } from '../../composables/useCanvasScaling'
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
  themeId?: string
  location?: { city: string; weather: string }
}>()

const emit = defineEmits<{
  (e: 'update:frontImage', value: string | null): void
  (e: 'update:activeElementId', value: string | null): void
  (e: 'update:message', value: string): void
  (e: 'update:audioUrl', value: string | null): void
  (e: 'update:audioBlob', value: Blob | null): void
  (e: 'update:themeId', value: string): void
  (e: 'update:location', value: { city: string; weather: string }): void
  (e: 'delete-element', id: string): void
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const canvasSize = computed(() => getCanvasSize(props.isLandscape))

const { scale } = useCanvasScaling(
  wrapperRef,
  computed(() => canvasSize.value.width),
  computed(() => canvasSize.value.height),
  { padding: 40 },
)
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}
</style>
