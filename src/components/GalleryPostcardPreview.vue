<template>
  <div ref="containerRef" class="w-full h-full relative overflow-hidden bg-gray-100 flex items-center justify-center">
    <div
      v-if="scale > 0"
      :style="{
        width: `${referenceWidth}px`,
        height: `${referenceHeight}px`,
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }"
      class="flex-shrink-0"
    >
      <PostcardFrontFace
        :is-active="false"
        :elements="postcard.elements"
        :front-image="frontImageUrl"
        :active-element-id="null"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { PostcardRecord } from '../backend'
import { getFileUrl } from '../backend'
import PostcardFrontFace from './postcard-editor/PostcardFrontFace.vue'

const props = defineProps<{
  postcard: PostcardRecord
}>()

const containerRef = ref<HTMLElement | null>(null)
const scale = ref(0)
// Use a fixed reference size for consistency. 
// We assume landscape is 900x600 (3:2) and portrait is 600x900 (2:3).
const REFERENCE_LONG_SIDE = 900
const REFERENCE_SHORT_SIDE = 600

const isLandscape = computed(() => {
   if (typeof props.postcard.is_landscape === 'boolean') return props.postcard.is_landscape
   if (typeof props.postcard.is_vertical === 'boolean') return !props.postcard.is_vertical
   return true
})

const referenceWidth = computed(() => {
   if (props.postcard.canvas_width) return props.postcard.canvas_width
   return isLandscape.value ? REFERENCE_LONG_SIDE : REFERENCE_SHORT_SIDE
})

const referenceHeight = computed(() => {
   if (props.postcard.canvas_height) return props.postcard.canvas_height
   return isLandscape.value ? REFERENCE_SHORT_SIDE : REFERENCE_LONG_SIDE
})

const frontImageUrl = computed(() => {
  return props.postcard.front_image ? getFileUrl(props.postcard, props.postcard.front_image) : null
})

const updateScale = () => {
  if (!containerRef.value) return
  const { width: containerWidth, height: containerHeight } = containerRef.value.getBoundingClientRect()
  
  if (containerWidth === 0 || containerHeight === 0) return

  const scaleX = containerWidth / referenceWidth.value
  const scaleY = containerHeight / referenceHeight.value
  
  // Use 'cover' strategy to fill the container usually, but here we want to fit inside perfectly?
  // In gallery, the container has a fixed aspect ratio (from MyGalleryPage).
  // MyGalleryPage sets aspect ratio on the container: :style="{ aspectRatio: getCardAspectRatio(card) }"
  // So 'cover' and 'contain' should be roughly equivalent if ratios match.
  // We'll use Math.min to ensure it fits completely (contain).
  // Actually, since the container is forced to the correct aspect ratio by the parent,
  // we can just match width (or height). 
  // Let's take the max to ensure it covers if there are slight rounding errors,
  // or min to ensure no cropping. 'cover' is usually nicer for previews.
  
  scale.value = Math.max(scaleX, scaleY)
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => {
      // Wrap in requestAnimationFrame to avoid "ResizeObserver loop limit exceeded"
      requestAnimationFrame(updateScale)
    })
    resizeObserver.observe(containerRef.value)
    updateScale()
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

// Watch for prop changes that might affect dimensions
watch([() => props.postcard.id, isLandscape], () => {
  // Wait for DOM update
  setTimeout(updateScale, 0)
})

</script>
