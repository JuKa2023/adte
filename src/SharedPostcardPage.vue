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
          class="card"
          :class="{ 'is-flipped': showBack }"
          @click="toggleSide"
        >
          <div class="card-face card-front">
            <img
              v-if="postcardImage"
              :src="postcardImage"
              class="w-full h-full object-cover"
              alt="Postkarten Vorderseite"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-center text-white/80 px-6">
              Keine Vorschau verfügbar
            </div>

            <div class="absolute inset-0 pointer-events-none">
              <div
                v-for="el in frontElements"
                :key="el.id"
                class="absolute"
                :style="elementStyle(el)"
              >
                <span v-if="el.type === 'text'">{{ el.content }}</span>
                <span v-else-if="el.type === 'sticker'" :style="{ fontSize: (el.fontSize || 64) + 'px' }">
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

          <div class="card-face card-back">
            <div class="h-full w-full p-8 flex flex-col gap-4" style="background-color: var(--color-card-bg); color: var(--color-font)">
              <p class="text-xs uppercase tracking-wide" style="color: var(--color-text-muted)">Rückseite</p>
              <p class="text-lg leading-relaxed whitespace-pre-wrap flex-1">{{ postcard?.message || 'Keine Nachricht' }}</p>
              <div class="text-xs" style="color: var(--color-text-muted)">Karte geteilt über PostcardCreator</div>
            </div>
          </div>
        </div>

        <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm" style="color: var(--color-text-muted)">
          {{ showBack ? 'Tippe/Klicke, um die Vorderseite zu sehen' : 'Tippe/Klicke, um die Rückseite zu sehen' }}
        </div>
      </div>

      <div v-if="audioUrl" class="mt-12 flex justify-center">
        <button
          class="px-4 py-2 rounded-full text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          style="background-color: var(--color-primary)"
          @click.stop="toggleAudio"
        >
          <span class="material-icons text-base">{{ isPlaying ? 'pause' : 'play_arrow' }}</span>
          {{ isPlaying ? 'Stopp' : 'Audio abspielen' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getSharedPostcard, getFileUrl, type PostcardRecord } from './backend'
import { toast } from 'vue-sonner'

const route = useRoute()
const postcard = ref<PostcardRecord | null>(null)
const postcardImage = ref<string | null>(null)
const showBack = ref(false)
const audioUrl = ref<string | null>(null)
const isPlaying = ref(false)
let audioEl: HTMLAudioElement | null = null

const toggleSide = () => {
  showBack.value = !showBack.value
}

const frontElements = computed(() =>
  (postcard.value?.elements || []).filter((el) => el.side === 'front'),
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
    postcardImage.value = getFileUrl(record, record.front_image)
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
  background: radial-gradient(circle at 20% 20%, rgba(161, 13, 116, 0.08), transparent 30%),
              radial-gradient(circle at 80% 30%, rgba(37, 99, 235, 0.08), transparent 28%),
              linear-gradient(135deg, #f7f7fb 0%, #eef1f8 100%);
}

.perspective {
  perspective: 1600px;
}

.card {
  position: relative;
  width: min(90vw, 900px);
  aspect-ratio: 3 / 2;
  margin: 0 auto;
  transform-style: preserve-3d;
  transition: transform 0.9s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
  box-shadow: 0 25px 60px -20px rgba(0,0,0,0.35);
  border-radius: 20px;
}

.card.is-flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 20px;
  overflow: hidden;
}

.card-front {
  transform: rotateY(0deg);
  background: #000;
}

.card-back {
  transform: rotateY(180deg);
}

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
