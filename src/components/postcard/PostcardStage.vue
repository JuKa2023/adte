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
import { ref, onMounted, onUnmounted, watch } from 'vue'

/*
  Postcard scaling philosophy:
  - The canvas has a canonical size (e.g. 900x600 or 600x900) and elements use those coordinates.
  - We never resize elements; we only apply a uniform scale to the whole canvas.
  - The scale is computed from the wrapper to preserve aspect ratio and avoid drift across screens.
*/
const props = defineProps<{
  canvasWidth: number
  canvasHeight: number
  maxScale?: number
  frameClass?: string
  frameStyle?: Record<string, string>
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const scale = ref(1)

const updateScale = () => {
  if (!wrapperRef.value) return
  const { clientWidth, clientHeight } = wrapperRef.value
  if (!clientWidth || !clientHeight) return

  const scaleX = clientWidth / props.canvasWidth
  const scaleY = clientHeight / props.canvasHeight
  const nextScale = Math.min(scaleX, scaleY, props.maxScale ?? 1)
  scale.value = Number.isFinite(nextScale) ? nextScale : 1
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!wrapperRef.value) return
  resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(updateScale)
  })
  resizeObserver.observe(wrapperRef.value)
  updateScale()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

watch(
  () => [props.canvasWidth, props.canvasHeight, props.maxScale],
  () => {
    updateScale()
  },
)
</script>
