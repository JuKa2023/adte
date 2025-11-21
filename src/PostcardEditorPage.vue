<template>
  <div class="">
    <div class="">
      <!-- Header -->
      <!-- Header -->
      <article class="px-6 pt-6 pb-3">
        <div class="flex items-center gap-1 text-[var(--color-highlight)] mb-4 cursor-pointer">
            <span class="material-icons text-sm">chevron_right</span>
            <span class="text-sm font-medium">Startseite</span>
        </div>
        <h1 class="text-lg font-normal text-gray-900 truncate">
          Füge passende Elemente zu deiner<br>
          Postkarte hinzu und platziere diese.
        </h1>
      </article>

      <main class="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center">
        <!-- Orientation Toggle -->
        <div v-if="isFront" class="mb-6">
          <Button type="button" variant="ghost" @click="toggleOrientation">
            <span v-if="isVertical">Querformat</span>
            <span v-else>Hochformat</span>
          </Button>
        </div>

        <!-- Postcard Preview with Flip Animation -->
        <section class="mb-8 perspective-1000 w-full flex justify-center">
          <div
            :class="['relative transition-all duration-500 transform-style-3d']"
            :style="{
              transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }"
          >
            <div
              :class="[
                'bg-[var(--color-dropin-field)] shadow-sm flex items-center justify-center relative mx-auto transition-all duration-300',
                isVertical ? 'w-64 h-96' : 'w-96 h-64'
              ]"
              style="backface-visibility: hidden"
            >
              <div class="text-center text-sm text-gray-500 w-full h-full relative">
                <!-- Front Side -->
                <template v-if="isFront">
                    <div class="flex items-center justify-center h-full w-full">
                        <p class="text-gray-800">Füge eine Mediadatei hinzu</p>
                    </div>
                </template>

                <!-- Back Side -->
                <template v-else>
                  <div class="absolute right-4 bottom-20 flex flex-col gap-4 items-end">
                    <div v-for="i in 4" :key="i" class="h-[1px] bg-gray-400 w-40"></div>
                  </div>
                  
                  <div class="absolute left-4 bottom-4 flex items-center gap-2">
                      <span class="material-icons text-xl">music_note</span>
                      <span class="text-xs text-gray-800">Record personal Message</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- Action Buttons -->
        <section class="grid grid-cols-3 gap-4 mb-8 w-full max-w-md">
          <Button variant="primaryIconTop" @click="onAddText">
            <template #icon><span class="material-icons">edit</span></template>
            Text
          </Button>
          <Button variant="primaryIconTop" @click="onChangeFont">
            <template #icon><span class="text-lg font-serif">Aa</span></template>
            Schriftart
          </Button>
          <Button variant="primaryIconTop" @click="onAddSticker">
            <template #icon><span class="material-icons">local_florist</span></template>
            Sticker
          </Button>
        </section>

        <!-- Secondary Buttons -->
        <section v-if="isFront" class="flex justify-between gap-4 w-full max-w-md mb-8">
          <Button
            v-for="action in secondaryButtons"
            :key="action.label"
            type="button"
            :variant="action.variant"
            class="flex-1"
            @click="action.onClick"
          >
            {{ action.label }}
          </Button>
        </section>
      </main>

      <!-- Footer -->
      <footer class="px-6 pb-10 flex justify-between items-center mt-auto">
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
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
</style>
