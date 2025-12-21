<template>
  <div
    v-if="isOpen && postcard"
    class="fixed inset-0 z-[80] flex items-center justify-center p-4"
    style="background-color: var(--color-modal-overlay)"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-full max-w-6xl h-full max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
    >
      <!-- Close button removed as per request -->

      <!-- Card Container with scaling -->
      <div 
        ref="containerRef"
        class="relative flex items-center justify-center pointer-events-auto transition-transform duration-500"
        :style="{
          width: `${referenceWidth}px`,
          height: `${referenceHeight}px`,
          transform: `scale(${scale})`,
        }"
      >
         <!-- 3D CardFlip Wrapper -->
         <div 
            class="w-full h-full relative preserve-3d transition-transform duration-700 cursor-pointer"
            :style="{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }"
            @click="isFlipped = !isFlipped"
         >
            <!-- Front Face -->
            <PostcardFrontFace
              :is-active="false"
              :elements="postcard.elements"
              :front-image="frontImageUrl"
              :active-element-id="null"
            />

            <!-- Back Face -->
            <PostcardBackFace
              :is-active="false"
              :is-landscape="!!isLandscape"
              :elements="postcard.elements"
              :active-element-id="null"
              :message="postcard.message"
              :audio-url="null"
            />
         </div>
      </div>

      <!-- Hint text -->
      <div class="absolute bottom-8 text-white/80 text-sm font-medium pointer-events-none animate-pulse">
        Klicke auf die Karte zum Umdrehen
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { PostcardRecord } from '../backend'
import { getFileUrl } from '../backend'
import PostcardFrontFace from './postcard-editor/PostcardFrontFace.vue'
import PostcardBackFace from './postcard-editor/PostcardBackFace.vue'

const props = defineProps<{
  isOpen: boolean
  postcard: PostcardRecord | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isFlipped = ref(false)
const containerRef = ref<HTMLElement | null>(null)
const scale = ref(1)

const REFERENCE_LONG_SIDE = 900
const REFERENCE_SHORT_SIDE = 600

const isLandscape = computed(() => {
   if (!props.postcard) return true
   if (typeof props.postcard.is_landscape === 'boolean') return props.postcard.is_landscape
   if (typeof props.postcard.is_vertical === 'boolean') return !props.postcard.is_vertical
   return true
})

const referenceWidth = computed(() => {
   if (props.postcard?.canvas_width) return props.postcard.canvas_width
   return isLandscape.value ? REFERENCE_LONG_SIDE : REFERENCE_SHORT_SIDE
})

const referenceHeight = computed(() => {
   if (props.postcard?.canvas_height) return props.postcard.canvas_height
   return isLandscape.value ? REFERENCE_SHORT_SIDE : REFERENCE_LONG_SIDE
})

const frontImageUrl = computed(() => {
  return props.postcard && props.postcard.front_image 
    ? getFileUrl(props.postcard, props.postcard.front_image) 
    : null
})

// Reset flipped state when postcard changes or modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isFlipped.value = false
    setTimeout(updateScale, 50)
  }
})

const updateScale = () => {
    if (!containerRef.value || !props.isOpen) return
    
    // Parent container is the modal wrapper (max-w-6xl etc)
    // We want to fit within say 80vw and 80vh to leave room for close button and hints
    const maxWidth = window.innerWidth * 0.85
    const maxHeight = window.innerHeight * 0.8

    const scaleX = maxWidth / referenceWidth.value
    const scaleY = maxHeight / referenceHeight.value
    
    scale.value = Math.min(scaleX, scaleY, 1) // limit to 1 (don't scale up)
}

onMounted(() => {
  window.addEventListener('resize', updateScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
})

</script>

<style scoped>
.preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
