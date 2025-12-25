<template>
  <div ref="wrapperRef" class="w-full h-full flex items-center justify-center">
    <div
      class="origin-center flex-shrink-0"
      :class="frameClass"
      :style="{
        width: `${canvasWidth}px`,
        height: `${canvasHeight}px`,
        transform: `scale(${scale})`,
        ...frameStyle,
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useCanvasScaling } from '../../composables/useCanvasScaling'

const props = defineProps<{
  canvasWidth: number
  canvasHeight: number
  maxScale?: number
  frameClass?: string
  frameStyle?: Record<string, string>
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const { scale } = useCanvasScaling(
  wrapperRef,
  toRef(props, 'canvasWidth'),
  toRef(props, 'canvasHeight'),
  { maxScale: props.maxScale },
)
</script>
