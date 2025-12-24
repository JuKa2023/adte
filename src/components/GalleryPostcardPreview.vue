<template>
  <div class="w-full h-full relative overflow-hidden bg-gray-100 flex items-center justify-center">
    <PostcardStage
      :canvas-width="canvasSize.width"
      :canvas-height="canvasSize.height"
      :max-scale="1"
      frame-class="flex-shrink-0"
    >
      <PostcardFaceView
        side="front"
        :elements="postcard.elements"
        :front-image-url="frontImageUrl"
        :canvas-width="canvasSize.width"
        :canvas-height="canvasSize.height"
      />
    </PostcardStage>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PostcardRecord } from '../backend'
import { getFileUrl } from '../backend'
import { getRecordCanvasSize } from '../postcard/canvas'
import PostcardFaceView from './postcard/PostcardFaceView.vue'
import PostcardStage from './postcard/PostcardStage.vue'

const props = defineProps<{
  postcard: PostcardRecord
}>()

const canvasSize = computed(() => getRecordCanvasSize(props.postcard))

const frontImageUrl = computed(() => {
  return props.postcard.front_image ? getFileUrl(props.postcard, props.postcard.front_image) : null
})
</script>
