<template>
  <div
    class="relative w-full h-full preserve-3d transition-transform duration-700 cursor-pointer"
    :class="{ 'is-flipped': isFlipped }"
    :style="{
      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      cursor: disableClickFlip ? 'default' : 'pointer',
    }"
    @click="!disableClickFlip && toggleFlip()"
  >
    <PostcardFaceView
      :postcard="postcard"
      side="front"
      empty-state-text="Keine Vorschau verfügbar"
    />

    <PostcardBackFace
      :message="postcard.message"
      :audio-url="audioUrl"
      :theme-id="postcard.theme_id"
      :location="parsedLocation"
      :is-landscape="!!postcard.is_landscape"
      :is-active="isFlipped"
      readonly
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PostcardRecord } from '../backend'
import { getFileUrl } from '../backend'
import PostcardFaceView from './postcard/PostcardFaceView.vue'
import PostcardBackFace from './postcard-editor/PostcardBackFace.vue'

const props = defineProps<{
  postcard: PostcardRecord
  disableClickFlip?: boolean
}>()

const emit = defineEmits<{
  (e: 'flip', isFlipped: boolean): void
}>()

const isFlipped = ref(false)
const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
  emit('flip', isFlipped.value)
}

// Reset flip when postcard changes
watch(
  () => props.postcard.id,
  () => {
    isFlipped.value = false
  },
)

const parsedLocation = computed(() => {
  if (!props.postcard.location) return undefined
  try {
    return JSON.parse(props.postcard.location)
  } catch {
    return undefined
  }
})

const audioUrl = computed(() => {
  return props.postcard.audio ? getFileUrl(props.postcard, props.postcard.audio) : null
})

defineExpose({ isFlipped, toggleFlip })
</script>

<style scoped>
.preserve-3d {
  transform-style: preserve-3d;
}
</style>
