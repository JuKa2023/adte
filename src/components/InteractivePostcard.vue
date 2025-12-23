<template>
  <div
    class="relative w-full h-full preserve-3d transition-transform duration-700 cursor-pointer"
    :class="{ 'is-flipped': isFlipped }"
    :style="{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }"
    @click="toggleFlip"
  >
    <!-- Front Face -->
    <div
      class="absolute inset-0 backface-hidden"
      style="transform: rotateY(0deg)"
    >
      <div v-if="frontImageUrl" ref="frontContainer" class="w-full h-full relative overflow-hidden">
        <img
          :src="frontImageUrl"
          class="w-full h-full object-cover"
          alt="Postkarten Vorderseite"
        />
        <!-- Elements Overlay -->
        <div 
          class="absolute inset-0 pointer-events-none origin-top-left"
          :style="{ transform: `scale(${scale})` }"
        >
          <div
            v-for="el in frontElements"
            :key="el.id"
            class="absolute"
            :style="elementStyle(el)"
          >
            <span v-if="el.type === 'text'">{{ el.content }}</span>
            <span
              v-else-if="el.type === 'sticker'"
              :style="{ fontSize: (el.fontSize || 64) + 'px' }"
            >
              {{ el.content }}
            </span>
            <img
              v-else-if="el.type === 'image'"
              :src="el.content"
              class="w-full h-full object-cover rounded-md"
              draggable="false"
            />
          </div>
        </div>
      </div>
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-center text-white/80 px-6 bg-gray-900"
      >
        Keine Vorschau verfügbar
      </div>
    </div>

    <!-- Back Face -->
    <div
      class="absolute inset-0 backface-hidden p-8 flex flex-col gap-4"
      style="
        transform: rotateY(180deg);
        background-color: var(--color-card-bg);
        color: var(--color-font);
      "
    >
      <p class="text-xs uppercase tracking-wide" style="color: var(--color-text-muted)">
        Rückseite
      </p>
      <p class="text-lg leading-relaxed whitespace-pre-wrap flex-1">
        {{ postcard.message || 'Keine Nachricht' }}
      </p>
      <div class="text-xs" style="color: var(--color-text-muted)">
        Karte geteilt über PostcardCreator
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { PostcardRecord } from '../backend'
import { getFileUrl } from '../backend'

const props = defineProps<{
  postcard: PostcardRecord
}>()

const emit = defineEmits<{
  (e: 'flip', isFlipped: boolean): void
}>()

const isFlipped = ref(false)
const frontContainer = ref<HTMLElement | null>(null)
const scale = ref(1)

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
  emit('flip', isFlipped.value)
}

// Reset flip when postcard changes
watch(
  () => props.postcard.id,
  () => {
    isFlipped.value = false
  }
)

const frontImageUrl = computed(() => {
  return props.postcard.front_image
    ? getFileUrl(props.postcard, props.postcard.front_image)
    : null
})

const frontElements = computed(() =>
  (props.postcard.elements || []).filter((el: any) => el.side === 'front')
)

const elementStyle = (el: any) => {
  return {
    left: `${el.x || 0}px`,
    top: `${el.y || 0}px`,
    fontFamily: el.fontFamily,
    fontSize: el.fontSize ? `${el.fontSize}px` : undefined,
    color: el.color,
    fontWeight: el.fontWeight,
    fontStyle: el.fontStyle,
    width: el.width ? `${el.width}px` : undefined,
    height: el.height ? `${el.height}px` : undefined,
  }
}

let resizeObserver: ResizeObserver | null = null

const updateScale = () => {
  if (!frontContainer.value) {
    scale.value = 1
    return
  }
  
  let targetWidth = props.postcard.canvas_width
  
  // Fallback for cards created before the fix
  if (!targetWidth) {
    const isLandscape = props.postcard.is_landscape !== false // Default to true if undefined
    targetWidth = isLandscape ? 900 : 600
  }

  const currentWidth = frontContainer.value.clientWidth
  scale.value = currentWidth / targetWidth
}

onMounted(() => {
  if (frontContainer.value) {
    resizeObserver = new ResizeObserver(() => {
     updateScale()
    })
    resizeObserver.observe(frontContainer.value)
    updateScale() // Initial call
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

// Expose checks for parent components if needed (e.g. for aspect ratio calculations)
defineExpose({ isFlipped })
</script>

<style scoped>
.preserve-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}
</style>
