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
         <!-- 3D CardFlip Wrapper via Component -->
         <InteractivePostcard
           :postcard="postcard"
           @flip="isFlipped = $event"
         />
      </div>

      <!-- Audio Player -->
      <div v-if="audioUrl" class="absolute bottom-4 z-50 pointer-events-auto animate-fade-in">
        <Button @click.stop="toggleAudio" class="shadow-lg">
          <template #icon>
            <span class="material-icons text-base">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
          </template>
          {{ isPlaying ? 'Stopp' : 'Audio abspielen' }}
        </Button>
      </div>

      <!-- Hint text -->
      <div class="absolute bottom-20 text-white/80 text-sm font-medium pointer-events-none animate-pulse">
        Klicke auf die Karte zum Umdrehen
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { PostcardRecord } from '../backend'
import { getFileUrl } from '../backend'
import InteractivePostcard from './InteractivePostcard.vue'
import Button from './Button.vue'

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

const audioUrl = ref<string | null>(null)
const isPlaying = ref(false)
let audioEl: HTMLAudioElement | null = null

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


// frontImageUrl logic moved to InteractivePostcard


// Reset flipped state and audio when postcard changes or modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isFlipped.value = false
    
    // Reset audio
    if (audioEl) {
      audioEl.pause()
      audioEl.currentTime = 0
    }
    isPlaying.value = false
    
    // Load new audio if available
    if (props.postcard?.audio) {
      audioUrl.value = getFileUrl(props.postcard, props.postcard.audio)
    } else {
      audioUrl.value = null
    }

    setTimeout(updateScale, 50)
  } else {
    // Stop audio when closing
    if (audioEl) {
       audioEl.pause()
       isPlaying.value = false
    }
  }
})

const toggleAudio = () => {
  if (!audioUrl.value) return
  if (!audioEl) {
    audioEl = new Audio(audioUrl.value)
    audioEl.onended = () => {
      isPlaying.value = false
    }
  }

  if (isPlaying.value) {
    audioEl.pause()
    isPlaying.value = false
  } else {
    audioEl.currentTime = 0
    audioEl.play()
    isPlaying.value = true
  }
}

const updateScale = () => {
    if (!containerRef.value || !props.isOpen) return
    
    // Parent container is the modal wrapper (max-w-6xl etc)
    // We want to fit within say 80vw and 80vh to leave room for close button and hints
    const maxWidth = window.innerWidth * 0.85
    const maxHeight = window.innerHeight * 0.7 // Reduced slightly to make room for audio button

    const scaleX = maxWidth / referenceWidth.value
    const scaleY = maxHeight / referenceHeight.value
    
    scale.value = Math.min(scaleX, scaleY, 1) // limit to 1 (don't scale up)
}

onMounted(() => {
  window.addEventListener('resize', updateScale)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
  if (audioEl) {
    audioEl.pause()
    audioEl = null
  }
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
