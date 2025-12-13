<template>
  <div
    class="absolute inset-0 shadow-2xl overflow-visible"
    :style="{
      backfaceVisibility: 'hidden',
      transform: 'rotateY(180deg)',
      pointerEvents: isActive ? 'auto' : 'none',
      backgroundColor: 'var(--color-card-bg)',
      zIndex: isActive ? 2 : 1,
    }"
  >
    <div class="absolute inset-0 z-10 pointer-events-auto" @click="emit('update:activeElementId', null)"></div>

    <PostcardElementsLayer
      class="z-30 pointer-events-none"
      :elements="elements"
      side="back"
      :active-element-id="activeElementId"
      @update:active-element-id="emit('update:activeElementId', $event)"
      @delete-element="emit('delete-element', $event)"
    />

    <div
      v-if="!isLandscape"
      class="absolute left-8 right-8 top-8 bottom-32 z-20 pointer-events-auto flex flex-col"
    >
      <label class="text-xs mb-2 font-medium text-[var(--color-text-muted)]">Deine Nachricht</label>
      <textarea
        v-model="messageModel"
        class="flex-1 backdrop-blur-sm text-base px-3 py-2 rounded-md focus:outline-none focus:border-[var(--color-highlight)] focus:ring-1 focus:ring-[var(--color-highlight)] resize-none"
        style="border: 1px solid var(--color-border-light); background-color: color-mix(in srgb, var(--color-card-bg) 80%, transparent); color: var(--color-font)"
        placeholder="Schreibe deine Nachricht hier..."
      ></textarea>
    </div>

    <div v-else class="absolute left-8 top-8 bottom-24 w-[45%] z-20 pointer-events-auto flex flex-col">
      <label class="text-xs mb-2 font-medium text-[var(--color-text-muted)]">Deine Nachricht</label>
      <textarea
        v-model="messageModel"
        class="flex-1 backdrop-blur-sm text-base px-3 py-2 rounded-md focus:outline-none focus:border-[var(--color-highlight)] focus:ring-1 focus:ring-[var(--color-highlight)] resize-none"
        style="border: 1px solid var(--color-border-light); background-color: color-mix(in srgb, var(--color-card-bg) 80%, transparent); color: var(--color-font)"
        placeholder="Schreibe deine Nachricht hier..."
      ></textarea>
    </div>

    <div class="absolute left-8 bottom-8 z-20 pointer-events-auto">
      <AudioRecorder v-model:audioUrl="audioUrlModel" @update:audioBlob="emit('update:audioBlob', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PostcardElement } from '../../backend'
import AudioRecorder from '../AudioRecorder.vue'
import PostcardElementsLayer from './PostcardElementsLayer.vue'

const props = defineProps<{
  elements: PostcardElement[]
  activeElementId: string | null
  message: string
  audioUrl: string | null
  isLandscape: boolean
  isActive: boolean
}>()

const emit = defineEmits<{
  (e: 'update:activeElementId', value: string | null): void
  (e: 'update:message', value: string): void
  (e: 'update:audioUrl', value: string | null): void
  (e: 'update:audioBlob', value: Blob | null): void
  (e: 'delete-element', id: string): void
}>()

const messageModel = computed({
  get: () => props.message,
  set: (value: string) => emit('update:message', value),
})

const audioUrlModel = computed({
  get: () => props.audioUrl,
  set: (value: string | null) => emit('update:audioUrl', value),
})
</script>
