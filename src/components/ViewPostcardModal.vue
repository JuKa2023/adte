<template>
  <div
    v-if="isOpen && postcard"
    class="fixed inset-0 z-[80] flex items-center justify-center p-4"
    style="background-color: var(--color-modal-overlay)"
    @click.self="$emit('close')"
  >
    <div
      class="relative w-[85vw] h-[70vh] max-w-6xl max-h-[90vh] flex flex-col items-center justify-center pointer-events-none"
    >
      <!-- Card Container with scaling -->
      <div class="relative w-full h-full flex items-center justify-center pointer-events-auto">
        <PostcardStage
          :canvas-width="canvasSize.width"
          :canvas-height="canvasSize.height"
          :max-scale="1"
          frame-class="transition-transform duration-500"
        >
          <!-- 3D CardFlip Wrapper via Component -->
          <InteractivePostcard
            ref="interactivePostcardRef"
            :postcard="postcard"
            disable-click-flip
            @flip="showBack = $event"
          />
        </PostcardStage>
      </div>

      <!-- Flip Button -->
      <div class="absolute bottom-4 z-50 pointer-events-auto animate-fade-in">
        <Button
          @click="toggleFlip"
          variant="outline"
          class="rounded-full w-14 h-14 !p-0 flex items-center justify-center bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all hover:scale-105"
        >
          <span
            class="material-icons text-2xl transition-transform duration-500"
            :class="{ 'rotate-180': showBack }"
          >
            flip_camera_android
          </span>
        </Button>
      </div>

      <!-- Hint text -->
      <div
        class="absolute bottom-24 text-white/80 text-sm font-medium pointer-events-none animate-pulse"
      >
        {{ showBack ? 'Rückseite' : 'Vorderseite' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PostcardRecord } from '../backend'
import { getCanvasSize, getRecordCanvasSize } from '../postcard/canvas'
import InteractivePostcard from './InteractivePostcard.vue'
import PostcardStage from './postcard/PostcardStage.vue'
import Button from './Button.vue'

const props = defineProps<{
  isOpen: boolean
  postcard: PostcardRecord | null
}>()

defineEmits<{
  (e: 'close'): void
}>()

const interactivePostcardRef = ref<InstanceType<typeof InteractivePostcard> | null>(null)
const showBack = ref(false)

const canvasSize = computed(() =>
  props.postcard ? getRecordCanvasSize(props.postcard) : getCanvasSize(true),
)

const toggleFlip = () => {
  interactivePostcardRef.value?.toggleFlip()
}

// Reset flipped state when modal opens
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      showBack.value = false
    }
  },
)
</script>
