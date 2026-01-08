<template>
  <div class="min-h-screen w-full flex items-center justify-center px-4 py-10 shared-bg">
    <div class="max-w-5xl w-full">
      <div class="text-center mb-6 animate-fade-in">
        <p class="uppercase text-xs tracking-[0.3em]" style="color: var(--color-text-muted)">
          Geteilte Postkarte
        </p>
        <h1 class="text-3xl font-bold" style="color: var(--color-font)">
          Jemand hat an dich gedacht ✨
        </h1>
        <p class="text-sm mt-2" style="color: var(--color-text-muted)">
          Klicke auf die Karte, um Vorder- und Rückseite zu betrachten.
        </p>
      </div>

      <div class="relative perspective animate-fade-in-slow">
        <div v-if="canvasSize && postcard" class="mx-auto" :style="cardStyle">
          <PostcardStage
            :canvas-width="canvasSize.width"
            :canvas-height="canvasSize.height"
            :max-scale="1"
            frame-class="card"
          >
            <InteractivePostcard
              ref="interactivePostcardRef"
              :postcard="postcard"
              disable-click-flip
              @flip="showBack = $event"
            />
          </PostcardStage>
        </div>

        <div
          class="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm whitespace-nowrap"
          style="color: var(--color-text-muted)"
        >
          {{ showBack ? 'Rückseite' : 'Vorderseite' }}
        </div>
      </div>

      <div class="mt-12 flex justify-center">
        <Button
          @click="toggleFlip"
          variant="outline"
          class="rounded-full w-14 h-14 !p-0 flex items-center justify-center transition-all hover:scale-105"
        >
          <span
            class="material-icons text-2xl transition-transform duration-500"
            :class="{ 'rotate-180': showBack }"
          >
            flip_camera_android
          </span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getSharedPostcard, getFileUrl, type PostcardRecord } from './backend'
import { getRecordCanvasSize } from './postcard/canvas'
import { toast } from 'vue-sonner'
import Button from './components/Button.vue'
import InteractivePostcard from './components/InteractivePostcard.vue'
import PostcardStage from './components/postcard/PostcardStage.vue'

const route = useRoute()
const postcard = ref<PostcardRecord | null>(null)
const showBack = ref(false)
const audioUrl = ref<string | null>(null)
const interactivePostcardRef = ref<InstanceType<typeof InteractivePostcard> | null>(null)

const toggleFlip = () => {
  interactivePostcardRef.value?.toggleFlip()
}

const canvasSize = computed(() => (postcard.value ? getRecordCanvasSize(postcard.value) : null))

const cardStyle = computed(() => {
  if (!canvasSize.value) return {}
  return {
    aspectRatio: `${canvasSize.value.width} / ${canvasSize.value.height}`,
    width: `min(90vw, ${canvasSize.value.width}px)`,
  }
})

onMounted(async () => {
  const id = route.params.id as string
  const token = route.query.token as string
  if (!id || !token) {
    toast.error('Ungültiger Share-Link.')
    return
  }

  try {
    const record = await getSharedPostcard(id, token)
    postcard.value = record
    if (record.audio) {
      audioUrl.value = getFileUrl(record, record.audio)
    }
  } catch {
    toast.error('Postkarte konnte nicht geladen werden.')
  }
})
</script>

<style scoped>
.shared-bg {
  background: var(--bg-shared-page);
}

.perspective {
  perspective: 1600px;
}

.card {
  position: relative;
  margin: 0 auto;
  box-shadow: 0 25px 60px -20px rgba(0, 0, 0, 0.35);
  border-radius: 20px;
}

.animate-fade-in {
  animation: fadeIn 0.6s ease both;
}

.animate-fade-in-slow {
  animation: fadeIn 1s ease both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
