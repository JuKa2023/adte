<template>
  <div class="">
    <div class="">
      <!-- Header -->
      <article class="px-6 pt-6 pb-3">
        <h1 class="text-lg font-semibold text-gray-900 truncate">
          Postkarte erstellen
          <span v-if="isFront"> Vorderseite</span>
          <span v-else> Rückseite</span>
        </h1>
      </article>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto px-6 pb-6">
        <p class="text-sm text-gray-800 leading-snug mb-4">
          Füge passende Elemente zu deiner Postkarte hinzu und platziere diese.
        </p>

        <!-- Orientation Toggle -->
        <div v-if="isFront" class="mb-4">
          <Button type="button" variant="primary" @click="toggleOrientation">
            <span v-if="isVertical">Querformat</span>
            <span v-else>Hochformat</span>
          </Button>
        </div>

        <!-- Postcard Preview with Flip Animation -->
        <section class="mb-5" style="perspective: 1000px">
          <div
            :class="['relative transition-all duration-500']"
            :style="{
              transformStyle: 'preserve-3d',
              transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }"
          >
            <div
              :class="[
                'bg-[var(--color-dropin-field)] rounded-s flex items-center justify-center relative mx-auto transition-all duration-300',
                isVertical ? 'w-64 h-96' : 'w-96 h-64'
              ]"
              style="backface-visibility: hidden"
            >
              <div class="text-center text-sm text-gray-500 px-4">
                <!-- Front Side -->
                <template v-if="isFront">
                  <p>Füge eine Mediendatei hinzu</p>
                </template>

                <!-- Back Side -->
                <template v-else>
                  <div class="space-y-2">
                    <div v-for="i in 4" :key="i" class="h-[2px] bg-[var(--color-dropin-field)] w-40 mx-auto"></div>
                    <p class="mt-2 text-xs text-gray-600">Füge eine Adresse oder Nachricht hinzu.</p>
                  </div>
                </template>
              </div>
              <button
                v-if="!isFront"
                type="button"
                class="absolute left-2 bottom-2 flex items-center gap-1 text-[11px] text-gray-700 border border-gray-400 rounded-full px-2 py-1 bg-white/90"
              >
                <span class="material-icons text-xs">audiotrack</span>
                <span>Füge eine Audiodatei hinzu</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Action Buttons -->
        <section class="grid grid-cols-3 gap-3 mb-5">
          <Button icon="PencilIcon" variant="primaryIconTop" @click="onAddText"> Text hinzufügen </Button>
          <Button icon="FontIcon" variant="primaryIconTop" @click="onChangeFont"> Schriftart ändern </Button>
          <Button icon="FlowerIcon" variant="primaryIconTop" @click="onAddSticker"> Sticker hinzufügen </Button>
        </section>

        <!-- Secondary Buttons -->
        <section class="flex flex-wrap justify-between gap-3 mb-10">
          <Button
            v-for="action in secondaryButtons"
            :key="action.label"
            type="button"
            :variant="action.variant"
            @click="action.onClick"
          >
            {{ action.label }}
          </Button>
        </section>
      </main>

      <!-- Footer -->
      <footer class="px-6 pb-6 flex justify-between">
        <Button type="button" variant="ghost" @click="toggleSide">
          <span v-if="isFront">Rückseite</span>
          <span v-else>Vorderseite</span>
        </Button>
        <Button type="button" variant="primary" @click="onFinish"> Fertig </Button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from './components/Button.vue'

type ButtonVariant = 'primary' | 'ghost'
type SecondaryButton = {
  label: string
  variant: ButtonVariant
  onClick: () => void
}

const isFront = ref(true)
const isVertical = ref(true)
const isFlipping = ref(false)

const toggleSide = () => {
  isFlipping.value = true
  setTimeout(() => {
    isFront.value = !isFront.value
    isFlipping.value = false
  }, 300)
}

const toggleOrientation = () => {
  isVertical.value = !isVertical.value
}

const onAddText = () => {
  console.log('Add text')
}

const onChangeFont = () => {
  console.log('Change font')
}

const onAddSticker = () => {
  console.log('Add sticker')
}

const onOpenMoodTemplates = () => {
  console.log('Open mood templates')
}

const onMorePhotos = () => {
  console.log('More photos')
}

const onFinish = () => {
  console.log('Finish postcard')
}

const secondaryButtons: SecondaryButton[] = [
  {
    label: 'Mood Vorlagen',
    variant: 'ghost',
    onClick: onOpenMoodTemplates,
  },
  {
    label: 'Weitere Fotos',
    variant: 'ghost',
    onClick: onMorePhotos,
  },
]
</script>

<style scoped>
.rotate-y-180 {
  transform: rotateY(180deg);
}
</style>
