<template>
  <div class="w-full h-full relative overflow-hidden bg-gray-100 flex items-center justify-center">
    <PostcardStage
      :canvas-width="canvasSize.width"
      :canvas-height="canvasSize.height"
      :max-scale="1"
      frame-class="flex-shrink-0"
    >
      <PostcardFaceView :postcard="postcard" side="front" />
    </PostcardStage>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PostcardRecord } from '../backend'
import { getRecordCanvasSize } from '../postcard/canvas'
import PostcardFaceView from './postcard/PostcardFaceView.vue'
import PostcardStage from './postcard/PostcardStage.vue'

const props = defineProps<{
  postcard: PostcardRecord
}>()

const canvasSize = computed(() => getRecordCanvasSize(props.postcard))
</script>
