<template>
  <PostcardFaceShell :side="side">
    <div v-if="side === 'front'" class="absolute inset-0">
      <PostcardFrontMedia :image-url="frontImageUrl">
        <div
          class="w-full h-full flex items-center justify-center text-center text-white/80 px-6 bg-gray-900"
        >
          <span v-if="emptyStateText">{{ emptyStateText }}</span>
        </div>
      </PostcardFrontMedia>
    </div>

    <PostcardElementsLayer
      class="absolute inset-0 z-30 pointer-events-none"
      :elements="elements"
      :canvas-width="canvasWidth"
      :canvas-height="canvasHeight"
      :active-element-id="null"
      :interactive="false"
      :side="side"
    />

    <div v-if="side === 'back'" class="absolute inset-0 p-8 flex flex-col gap-4 z-20">
      <p
        v-if="backLabel"
        class="text-xs uppercase tracking-wide"
        style="color: var(--color-text-muted)"
      >
        {{ backLabel }}
      </p>
      <p class="text-lg leading-relaxed whitespace-pre-wrap flex-1">
        {{ message || 'Keine Nachricht' }}
      </p>
      <div v-if="backFooter" class="text-xs" style="color: var(--color-text-muted)">
        {{ backFooter }}
      </div>
    </div>
  </PostcardFaceShell>
</template>

<script setup lang="ts">
import type { PostcardElement } from '../../backend'
import PostcardElementsLayer from '../postcard-editor/PostcardElementsLayer.vue'
import PostcardFaceShell from './PostcardFaceShell.vue'
import PostcardFrontMedia from './PostcardFrontMedia.vue'

defineProps<{
  side: 'front' | 'back'
  elements: PostcardElement[]
  frontImageUrl?: string | null
  message?: string
  emptyStateText?: string
  backLabel?: string
  backFooter?: string
  canvasWidth: number
  canvasHeight: number
}>()
</script>
