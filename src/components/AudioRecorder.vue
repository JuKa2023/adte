<template>
  <div class="flex flex-col items-center justify-center w-full h-80 relative">
    <canvas
      ref="canvasRef"
      class="w-full h-full cursor-pointer touch-none"
      @click="handleCanvasClick"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    ></canvas>

    <!-- Icon Overlay -->
    <div
      v-if="!(readonly && state === 'idle')"
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-300"
      :class="[
        isHovering ? 'scale-110' : 'scale-100',
        state === 'recording' ? 'text-white' : 'text-gray-500',
      ]"
    >
      <span
        class="material-icons text-4xl select-none"
        :class="{ 'text-white': state === 'recording' || state === 'playing' || isHovering }"
        style="text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)"
      >
        {{ currentIcon }}
      </span>
    </div>

    <!-- Instructions / Status Text -->
    <div
      v-if="!(readonly && state === 'idle')"
      class="absolute bottom-2 text-xs font-medium tracking-wider uppercase transition-opacity duration-300 pointer-events-none select-none"
      :class="statusTextClass"
    >
      {{ statusText }}
    </div>

    <!-- Hidden audio element for playback -->
    <audio ref="audioRef" class="hidden" @ended="onPlaybackEnded"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { toast } from 'vue-sonner'

const props = defineProps<{
  audioUrl: string | null
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:audioUrl', value: string | null): void
  (e: 'update:audioBlob', value: Blob | null): void
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const isHovering = ref(false)

// State
type RecState = 'idle' | 'recording' | 'recorded' | 'playing'
const state = ref<RecState>('idle')

// Audio Context & Nodes
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let microphoneStream: MediaStream | null = null
let mediaRecorder: MediaRecorder | null = null
let sourceNode: MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null = null

let audioChunks: Blob[] = []
let animationFrameId: number = 0

// Visualizer Parameters
let time = 0

// Logic

onMounted(() => {
  if (props.audioUrl) {
    state.value = 'recorded'
  }
  initVisualizer()
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId)
  cleanupAudio()
})

// Watch for external reset (if audioUrl becomes null from parent)
watch(
  () => props.audioUrl,
  (newVal) => {
    if (!newVal && state.value !== 'idle' && state.value !== 'recording') {
      state.value = 'idle'
      cleanupAudio() // Reset audio nodes if any
    }
  },
)

const statusText = ref('Antippen zum Aufnehmen')
const statusTextClass = ref('text-gray-400')

watch(state, (s) => {
  switch (s) {
    case 'idle':
      statusText.value = 'Antippen zum Aufnehmen'
      statusTextClass.value = 'text-[var(--color-text-muted)] opacity-70'
      break
    case 'recording':
      statusText.value = 'Aufnahme läuft...'
      statusTextClass.value = 'text-red-500 animate-pulse'
      break
    case 'recorded':
      statusText.value = 'Anhören / Neu Starten'
      statusTextClass.value = 'text-[var(--color-highlight)]'
      break
    case 'playing':
      statusText.value = 'Spielt ab...'
      statusTextClass.value = 'text-[var(--color-highlight)] font-bold'
      break
  }
})

const cleanupAudio = () => {
  if (microphoneStream) {
    microphoneStream.getTracks().forEach((t) => t.stop())
    microphoneStream = null
  }
  if (audioContext && state.value === 'idle') {
    audioContext.close()
    audioContext = null
  }
}

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
}

const handleCanvasClick = async () => {
  initAudioContext()

  if (state.value === 'idle') {
    if (props.readonly) return
    startRecording()
  } else if (state.value === 'recording') {
    stopRecording()
  } else if (state.value === 'recorded') {
    // If user clicks, play. If they hold longer (not implemented) or click a clear button...
    // For now, simplicity: Click toggle play/pause OR re-record?
    // User request: "hover gives impression you can click it and then when clicked it plays"
    // To re-record, we might need a separate small "clear" button or double click?
    // Let's make it: Click to play.
    // If playing, click to stop?
    // BUT user often wants to re-record.
    // Let's add a small "x" button overlay in the template if recorded?
    // Actually, asking the user to clear via parent "Delete" might be too complex.
    // Let's make it: Click to Play.
    // Long press to clear? No, keep it simple.
    // Play audio.
    playAudio()
  } else if (state.value === 'playing') {
    stopAudio()
  }
}

const startRecording = async () => {
  try {
    microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Setup analysis
    if (!audioContext) initAudioContext()
    analyser = audioContext!.createAnalyser()
    analyser.fftSize = 256
    sourceNode = audioContext!.createMediaStreamSource(microphoneStream)
    sourceNode.connect(analyser)

    // Setup recording
    mediaRecorder = new MediaRecorder(microphoneStream)
    audioChunks = []
    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data)
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/mp3' })
      const url = URL.createObjectURL(blob)
      emit('update:audioBlob', blob)
      emit('update:audioUrl', url)
      state.value = 'recorded'
    }

    mediaRecorder.start()
    state.value = 'recording'
  } catch (err) {
    console.error(err)
    toast.error('Mikrofonzugriff fehlgeschlagen')
  }
}

const stopRecording = () => {
  if (mediaRecorder && state.value === 'recording') {
    mediaRecorder.stop()
    // Cleanup stream tracks immediately, but keep context for potential playback
    if (microphoneStream) {
      // Don't stop tracks here if we want to visualize the "tail"?
      // Actually good to stop mic immediately.
      microphoneStream.getTracks().forEach((t) => t.stop())
      microphoneStream = null
    }
  }
}

const playAudio = () => {
  if (!props.audioUrl || !audioRef.value) return

  audioRef.value.src = props.audioUrl
  audioRef.value.play()

  if (!audioContext) initAudioContext()

  // Create source from audio element if not exists
  // We need to be careful not to reconnect multiple times if we reuse the element
  // BUT: createMediaElementSource can only be called once per element.
  // We should do this only once or manage it carefully.
  // A safe way is to create a new Audio object or just handle the error.

  // Better: Create source node only once or store it.
  // Since we might switch between recording (mic source) and playing (element source),
  // we can use a fresh AudioContext or disconnect.
  // Let's try to reuse the audio object.

  // Re-connecting the same element is safer if we store the sourceNode
  if (!sourceNode || sourceNode instanceof MediaStreamAudioSourceNode) {
    // If previous source was mic, we need a new source or switching.
    // However, createMediaElementSource throws if called twice on same element.
    // Trick: Use new Image() equivalent for Audio, or just manage a single connection.
    // If we use `audioRef`, let's try to connect needed graph.
    // To avoid the "already connected" error, detailed management is needed.
    // For simplicity in this specialized component:
  }

  // Actually, for visualization during playback, we need the stream.
  // Browsers are tricky with MediaElementSource and CORS (if blob is local it is fine).

  // Let's set up the visualizer for playback
  try {
    // Connect audioRef to destination so we hear it
    // And to analyser
    // NOTE: Connecting an Audio Element to Web Audio API *mutes* the element output unless we connect it to destination!

    if (!sourceNode || sourceNode instanceof MediaStreamAudioSourceNode) {
      // This logic is fragile with hot module reload etc.
      // Let's assume we can create it once.
      // Or just don't use the DOM audio element for the node only, but use it for playback control.
      // We'll use a new Audio Context source for the buffer? No, simple element source.

      const src = audioContext!.createMediaElementSource(audioRef.value)
      src.connect(audioContext!.destination)
      analyser = audioContext!.createAnalyser()
      analyser.fftSize = 256
      src.connect(analyser)
      sourceNode = src // Cache it?
      // Note: caching `src` is needed because we can't create it again for `audioRef`.
    } else {
      // Already created for this audio element?
      // Reuse it.
      // Reconnect analyser if it was disconnected?
      if (analyser) sourceNode.connect(analyser)
    }
  } catch (e) {
    // Ignore "already connected" errors or similar
    console.warn(e)
  }

  state.value = 'playing'
}

const stopAudio = () => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
  state.value = 'recorded'
}

const onPlaybackEnded = () => {
  state.value = 'recorded'
}

// ---------------------------
// VISUALIZATION LOOP
// ---------------------------

const initVisualizer = () => {
  // Setup canvas
  const cvs = canvasRef.value
  if (!cvs) return

  // High DPI
  const dpr = window.devicePixelRatio || 1
  const rect = cvs.getBoundingClientRect()
  cvs.width = rect.width * dpr
  cvs.height = rect.height * dpr

  // Reset time
  time = 0
}

const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  const cvs = canvasRef.value
  if (!cvs || !cvs.getContext) return

  const ctx = cvs.getContext('2d')!
  const w = cvs.width
  const h = cvs.height
  const cx = w / 2
  const cy = h / 2

  // Clear
  ctx.clearRect(0, 0, w, h)

  time += 0.05

  // Get Audio Data
  let dataArray = new Uint8Array(0)
  if (analyser) {
    const bufferLength = analyser.frequencyBinCount
    dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)
  }

  // Compute average volume / energy for reactivity
  let energy = 0
  if (dataArray.length > 0) {
    const sum = dataArray.reduce((src, a) => src + a, 0)
    energy = sum / dataArray.length
  }

  // Norm energy 0..1
  const normEnergy = Math.min(1, energy / 128)

  // -- STATE BASED DRAWING --

  if (state.value === 'idle') {
    // IDLE: Slow breathing circle ("Lava Lamp"ish)
    if (!props.readonly) {
      drawBlob(ctx, cx, cy, 45 + Math.sin(time * 0.5) * 5, 0.1, 'idle', false)
    }

    // Icon
  } else if (state.value === 'recording') {
    // RECORDING: Active, energetic blob, reacting to voice
    const radius = 55 + normEnergy * 40

    // Outer glow/ripple
    if (normEnergy > 0.1) {
      ctx.beginPath()
      ctx.arc(cx, cy, radius + 20, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(239, 68, 68, ${0.2 * normEnergy})` // Red glow
      ctx.fill() // Keep simple fill for glow
    }

    drawBlob(ctx, cx, cy, radius, 0.5 + normEnergy, 'record', true)
  } else if (state.value === 'recorded' || state.value === 'playing') {
    // RECORDED / PLAYING

    const isPlaying = state.value === 'playing'

    let radius = 60
    let deformity = 0.2

    if (isPlaying) {
      radius = 60 + normEnergy * 30
      deformity = 0.4 + normEnergy * 0.5
    } else {
      // Gentle hover effect
      if (isHovering.value) {
        radius = 65
        deformity = 0.3
      } else {
        radius = 60 + Math.sin(time * 0.8) * 3
      }
    }

    drawBlob(ctx, cx, cy, radius, deformity, 'play', isPlaying)
  }
}

const currentIcon = computed(() => {
  switch (state.value) {
    case 'idle':
      return 'mic'
    case 'recording':
      return 'stop'
    case 'recorded':
      return 'play_arrow'
    case 'playing':
      return 'pause'
    default:
      return 'mic'
  }
})

// Helper to draw an organic blob
// Uses a set of sine waves to perturb the radius of a circle
const drawBlob = (
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  deformity: number,
  color: string,
  fast: boolean,
) => {
  ctx.beginPath()
  const points = 100
  const speed = fast ? 0.2 : 0.05
  const seed = time * speed

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2

    // Perlin-ish noise using sin sum
    // We create a smooth random-like offset based on angle and time
    const offset =
      Math.sin(angle * 3 + seed) * 1 +
      Math.sin(angle * 5 - seed * 2) * 0.5 +
      Math.sin(angle * 2 + seed * 1.5) * 0.8

    const r = radius + offset * (radius * deformity * 0.3)

    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.closePath()

  // Create gradient
  const gradient = ctx.createRadialGradient(
    cx - radius * 0.3,
    cy - radius * 0.3,
    radius * 0.1,
    cx,
    cy,
    radius * 1.5,
  )

  if (color === 'record') {
    // Red/Orange gradient for recording
    gradient.addColorStop(0, '#ff7070')
    gradient.addColorStop(1, '#ef4444')
  } else if (color === 'play') {
    // Purple/Blue accent gradient for playback
    // Using approximate values for var(--color-highlight) (#a10d74) and var(--color-primary) (#2563eb)
    gradient.addColorStop(0, '#a10d74')
    gradient.addColorStop(1, '#2563eb')
  } else {
    // Idle state - muted
    gradient.addColorStop(0, '#f3f4f6') // light gray
    gradient.addColorStop(1, '#d1d5db') // slightly darker
  }

  ctx.fillStyle = gradient
  ctx.fill()
}
</script>

<style scoped>
/* Ensure Material Icons font is available or fallbacks */
</style>
