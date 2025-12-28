<template>
  <BaseModal :is-open="isOpen && !!postcard" :z-index="80" @close="$emit('close')">
    <div
      class="relative w-[90vw] h-[85vh] max-w-7xl max-h-[92vh] flex flex-col items-center justify-center pointer-events-none"
    >
      <div class="relative w-full h-full flex items-center justify-center pointer-events-auto">
        <PostcardStage
          :canvas-width="canvasSize.width"
          :canvas-height="canvasSize.height"
          :max-scale="1.5"
          frame-class="transition-transform duration-500"
        >
          <InteractivePostcard
            v-if="postcard"
            ref="interactivePostcardRef"
            :postcard="postcard"
            disable-click-flip
            @flip="showBack = $event"
          />
        </PostcardStage>
      </div>

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

      <div
        class="absolute bottom-24 text-white/80 text-sm font-medium pointer-events-none animate-pulse"
      >
        {{ showBack ? 'Rückseite' : 'Vorderseite' }}
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PostcardRecord } from '../backend'
import { getCanvasSize, getRecordCanvasSize } from '../postcard/canvas'
import BaseModal from './BaseModal.vue'
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

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      showBack.value = false
    }
  },
)
</script>
