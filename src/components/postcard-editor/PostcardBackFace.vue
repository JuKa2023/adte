<template>
  <PostcardFaceShell
    side="back"
    :is-active="isActive"
    overflow-visible
    :style="currentThemeStyle"
    class="transition-colors duration-700"
  >
    <!-- Main Container -->
    <div
      class="absolute inset-0 z-20 pointer-events-auto flex"
      :class="isLandscape ? 'flex-row' : 'flex-col'"
    >
      <!-- Left Side: Message Area -->
      <div
        class="relative flex-1 p-8 md:p-10 flex flex-col transition-colors duration-700"
        :class="{
          'border-r border-dashed border-gray-300/50': isLandscape,
          'border-b border-dashed border-gray-300/50': !isLandscape,
        }"
      >
        <!-- Header / Label -->
        <div
          class="mb-4 opacity-40 hover:opacity-100 transition-opacity flex justify-between items-center"
        >
          <span class="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
            Nachricht
          </span>

          <!-- Ambience Picker (Subtle dot menu) -->
          <div v-if="!readonly" class="flex gap-2">
            <button
              v-for="theme in themes"
              :key="theme.id"
              @click="currentThemeId = theme.id"
              class="w-3 h-3 rounded-full border border-gray-300 hover:scale-125 transition-transform"
              :class="{ 'ring-1 ring-offset-1 ring-gray-400': currentThemeId === theme.id }"
              :style="{ background: theme.dotColor }"
              :title="theme.name"
            ></button>
          </div>
        </div>

        <!-- Text Area -->
        <textarea
          v-model="messageModel"
          class="w-full flex-1 bg-transparent resize-none border-none focus:ring-0 p-0 text-lg leading-relaxed text-gray-800 placeholder-gray-300"
          :placeholder="readonly ? '' : 'Hallo du,...'"
          :readonly="readonly"
        ></textarea>

        <!-- Signature Pad -->
        <!-- Signature removed -->

        <!-- Postcard Metadata / Footer (Optional aesthetic touch) -->
        <div class="mt-4 flex justify-between items-end opacity-20 select-none pointer-events-none">
          <span class="text-[9px] tracking-widest uppercase font-serif">Postcard © 2025</span>
        </div>
      </div>

      <!-- Right Side: Address/Audio Area -->
      <div
        class="relative p-8 md:p-10 flex flex-col items-center justify-center transition-colors duration-700"
        :class="[isLandscape ? 'w-[40%]' : 'h-[40%] w-full', currentTheme.rightPanelBg]"
      >
        <!-- Location Stamp (Absolute Top Right) -->
        <div class="absolute top-6 right-6 z-10">
          <LocationStamp
            :location-data="location"
            :readonly="readonly"
            @update:location="emit('update:location', $event)"
          />
        </div>

        <!-- Audio Stamp Container -->
        <div class="flex flex-col items-center justify-center w-full h-full mt-8">
          <!-- "Stamp" Area -->
          <div class="relative group">
            <!-- Decorative Stamp Border (Subtle) -->
            <div
              class="absolute -inset-4 border border-dashed border-gray-300/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            ></div>

            <AudioRecorder
              v-model:audioUrl="audioUrlModel"
              :readonly="readonly"
              @update:audioBlob="emit('update:audioBlob', $event)"
            />
          </div>

          <!-- Minimal Instruction -->
          <p
            v-if="!readonly"
            class="mt-6 text-xs text-center text-gray-400 font-light tracking-wide"
          >
            {{ audioUrl ? 'Aufnahme bereit' : 'Audio Gruss hinzufügen' }}
          </p>
        </div>
      </div>
    </div>
  </PostcardFaceShell>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AudioRecorder from '../AudioRecorder.vue'
import PostcardFaceShell from '../postcard/PostcardFaceShell.vue'
import LocationStamp from './LocationStamp.vue'

const props = defineProps<{
  message: string
  audioUrl: string | null
  isLandscape: boolean
  isActive: boolean
  readonly?: boolean
  themeId?: string
  location?: { city: string; weather: string }
}>()

const emit = defineEmits<{
  (e: 'update:message', value: string): void
  (e: 'update:audioUrl', value: string | null): void
  (e: 'update:audioBlob', value: Blob | null): void
  (e: 'update:themeId', value: string): void
  (e: 'update:location', value: { city: string; weather: string }): void
}>()

const messageModel = computed({
  get: () => props.message,
  set: (value: string) => !props.readonly && emit('update:message', value),
})

const audioUrlModel = computed({
  get: () => props.audioUrl,
  set: (value: string | null) => emit('update:audioUrl', value),
})

// Ambience / Themes
interface Theme {
  id: string
  name: string
  dotColor: string
  bgStyle: Record<string, string>
  rightPanelBg: string
}

const themes: Theme[] = [
  {
    id: 'classic',
    name: 'Classic',
    dotColor: '#e5e7eb',
    bgStyle: { backgroundColor: '#ffffff' },
    rightPanelBg: 'bg-gray-50/50',
  },
  {
    id: 'paper',
    name: 'Paper',
    dotColor: '#fef3c7',
    bgStyle: { backgroundColor: '#fffbeb' }, // amber-50
    rightPanelBg: 'bg-amber-100/30',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    dotColor: '#fdba74',
    bgStyle: { background: 'linear-gradient(to bottom right, #fff1f2, #fff7ed)' }, // rose-50 to orange-50
    rightPanelBg: 'bg-orange-100/20',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    dotColor: '#93c5fd',
    bgStyle: { background: 'linear-gradient(to bottom right, #f0f9ff, #e0f2fe)' }, // sky-50 to sky-100
    rightPanelBg: 'bg-sky-100/30',
  },
]

const currentThemeId = ref(props.themeId || 'classic')

watch(
  () => props.themeId,
  (val: string | undefined) => {
    if (val) currentThemeId.value = val
  },
)

watch(currentThemeId, (val: string) => {
  emit('update:themeId', val)
})

const currentTheme = computed(() => {
  return themes.find((t) => t.id === currentThemeId.value) || themes[0]!
})

const currentThemeStyle = computed(() => currentTheme.value?.bgStyle || themes[0]!.bgStyle)
</script>

<style scoped>
/* No extra styles needed */
</style>
