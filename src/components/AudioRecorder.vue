<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        :class="isRecording
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
        @click="toggleRecording"
      >
        <span class="material-icons">
          {{ isRecording ? 'stop' : (audioUrl ? 'mic_none' : 'mic') }}
        </span>
      </button>

      <button
        v-if="audioUrl && !isRecording"
        type="button"
        class="w-10 h-10 rounded-full bg-[var(--color-highlight)] text-white flex items-center justify-center hover:opacity-90"
        @click="playAudio"
      >
        <span class="material-icons">play_arrow</span>
      </button>
    </div>

    <span class="text-xs text-gray-500 ml-1">
      {{ isRecording ? 'Aufnahme läuft...' : (audioUrl ? 'Nachricht aufgenommen' : 'Nachricht aufnehmen') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { toast } from 'vue-sonner'

const props = defineProps<{
  audioUrl: string | null
}>()

const emit = defineEmits<{
  (e: 'update:audioUrl', value: string | null): void
  (e: 'update:audioBlob', value: Blob | null): void
}>()

const isRecording = ref(false)
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let audioPlayer: HTMLAudioElement | null = null

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      const url = URL.createObjectURL(audioBlob)

      emit('update:audioBlob', audioBlob)
      emit('update:audioUrl', url)
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch (err) {
    console.error('Error accessing microphone:', err)
    toast.error('Mikrofonzugriff verweigert oder nicht verfügbar.')
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
    mediaRecorder.stream.getTracks().forEach((track) => track.stop())
  }
}

const playAudio = () => {
  if (!props.audioUrl) return

  if (!audioPlayer) {
    audioPlayer = new Audio(props.audioUrl)
  } else {
    audioPlayer.src = props.audioUrl
  }
  audioPlayer.play()
}

onBeforeUnmount(() => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    mediaRecorder.stream.getTracks().forEach((track) => track.stop())
  }
})
</script>
