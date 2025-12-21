<template>
  <div class="min-h-screen w-full flex items-center justify-center px-4 py-10 shared-bg">
    <div class="max-w-5xl w-full">
      <div class="text-center mb-6 animate-fade-in">
        <p class="uppercase text-xs tracking-[0.3em]" style="color: var(--color-text-muted)">Geteilte Postkarte</p>
        <h1 class="text-3xl font-bold" style="color: var(--color-font)">Jemand hat an dich gedacht ✨</h1>
        <p class="text-sm mt-2" style="color: var(--color-text-muted)">Klicke auf die Karte, um Vorder- und Rückseite zu betrachten.</p>
      </div>

      <div class="relative perspective animate-fade-in-slow">
        <div
          v-if="postcard"
          class="card"
          :class="{ 'is-portrait': !isLandscape }"
        >
          <InteractivePostcard
            :postcard="postcard"
            @flip="showBack = $event"
          />
        </div>

        <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm" style="color: var(--color-text-muted)">
          {{ showBack ? 'Tippe/Klicke, um die Vorderseite zu sehen' : 'Tippe/Klicke, um die Rückseite zu sehen' }}
        </div>
      </div>

      <div v-if="audioUrl" class="mt-12 flex justify-center">
        <Button @click.stop="toggleAudio">
          <template #icon>
            <span class="material-icons text-base">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
          </template>
          {{ isPlaying ? 'Stopp' : 'Audio abspielen' }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getSharedPostcard, getFileUrl, type PostcardRecord } from './backend'
import { toast } from 'vue-sonner'
import Button from './components/Button.vue'
import InteractivePostcard from './components/InteractivePostcard.vue'

const route = useRoute()
const postcard = ref<PostcardRecord | null>(null)
// postcardImage ref removed
const showBack = ref(false)
const audioUrl = ref<string | null>(null)
const isPlaying = ref(false)
let audioEl: HTMLAudioElement | null = null

// toggleSide removed (handled by component)
// frontElements computed removed (handled by component)

const isLandscape = computed(() => {
  const record = postcard.value
  if (!record) return true
  if (typeof record.is_landscape === 'boolean') return record.is_landscape
  if (typeof record.is_vertical === 'boolean') return !record.is_vertical
  return true
})

// elementStyle removed (handled by component)

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
    // postcardImage assignment removed
    if (record.audio) {
      audioUrl.value = getFileUrl(record, record.audio)
    }
  } catch (err) {
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
  width: min(90vw, 900px);
  aspect-ratio: 3 / 2;
  margin: 0 auto;
  /* transform-style and transition removed as they might duplicate or conflict */
  /* keeping basic sizing */
  box-shadow: 0 25px 60px -20px rgba(0,0,0,0.35);
  border-radius: 20px;
}

.card.is-portrait {
  aspect-ratio: 2 / 3;
  width: min(90vw, 600px);
}

/* card-face, card-front, card-back styles removed */

.animate-fade-in {
  animation: fadeIn 0.6s ease both;
}

.animate-fade-in-slow {
  animation: fadeIn 1s ease both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
