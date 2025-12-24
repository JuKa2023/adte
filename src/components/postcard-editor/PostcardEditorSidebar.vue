<template>
  <aside
    class="flex flex-row md:flex-col items-center md:w-24 w-full md:pt-20 md:pb-8 px-4 py-2 md:px-0 shadow-sm z-20 overflow-x-auto md:overflow-y-auto md:overflow-x-visible order-2 md:order-1 bg-[var(--color-sidebar-bg)] border-t md:border-t-0 md:border-r border-[var(--color-border)]"
  >
    <div class="flex flex-row md:flex-col gap-4 md:gap-6 w-full md:px-4">
      <Button
        variant="ghost"
        iconOnly
        @click="emit('clear')"
        aria-label="Alles zurücksetzen"
        tooltip="Alles zurücksetzen"
        tooltip-class="hidden md:block"
        class="w-14 h-14 md:w-16 md:h-16 rounded-md flex-shrink-0 bg-transparent hover:bg-[var(--color-sidebar-hover)] transition-colors"
      >
        <template #icon>
          <span class="material-icons text-xl text-[var(--color-icon)]">refresh</span>
        </template>
      </Button>

      <div class="w-px h-8 md:h-px md:w-full bg-[var(--color-divider)]"></div>

      <Button
        variant="ghost"
        iconOnly
        @click="emit('toggle-orientation')"
        :aria-label="isLandscape ? 'Zu Hochformat wechseln' : 'Zu Querformat wechseln'"
        :tooltip="isLandscape ? 'Zu Hochformat wechseln' : 'Zu Querformat wechseln'"
        tooltip-class="hidden md:block"
        class="w-14 h-14 md:w-16 md:h-16 rounded-md flex-shrink-0 bg-transparent hover:bg-[var(--color-sidebar-hover)] transition-colors"
      >
        <template #icon>
          <span class="material-icons text-xl text-[var(--color-icon)]">{{
            isLandscape ? 'crop_landscape' : 'crop_portrait'
          }}</span>
        </template>
      </Button>

      <div class="w-px h-8 md:h-px md:w-full bg-[var(--color-divider)]"></div>

      <Button
        v-if="isFront"
        variant="ghost"
        iconOnly
        @click="emit('add-text')"
        aria-label="Text hinzufügen"
        tooltip="Text hinzufügen"
        tooltip-class="hidden md:block"
        class="w-14 h-14 md:w-16 md:h-16 rounded-md flex-shrink-0 bg-transparent hover:bg-[var(--color-sidebar-hover)] transition-colors"
      >
        <template #icon>
          <span class="material-icons text-xl text-[var(--color-icon)]">title</span>
        </template>
      </Button>

      <Button
        v-if="isFront"
        variant="ghost"
        iconOnly
        @click="emit('add-sticker')"
        aria-label="Sticker hinzufügen"
        tooltip="Sticker hinzufügen"
        tooltip-class="hidden md:block"
        class="w-14 h-14 md:w-16 md:h-16 rounded-md flex-shrink-0 bg-transparent hover:bg-[var(--color-sidebar-hover)] transition-colors"
      >
        <template #icon>
          <span class="material-icons text-3xl text-[var(--color-icon)]">emoji_emotions</span>
        </template>
      </Button>

      <Button
        v-if="isFront"
        variant="ghost"
        iconOnly
        @click="emit('open-mood-templates')"
        aria-label="Mood Vorlagen"
        tooltip="Mood Vorlagen"
        tooltip-class="hidden md:block"
        class="w-14 h-14 md:w-16 md:h-16 rounded-md flex-shrink-0 bg-transparent hover:bg-[var(--color-sidebar-hover)] transition-colors"
      >
        <template #icon>
          <span class="material-icons text-3xl text-[var(--color-icon)]">palette</span>
        </template>
      </Button>

      <Button
        v-if="isFront"
        variant="ghost"
        iconOnly
        @click="emit('add-photo')"
        aria-label="Foto hinzufügen"
        tooltip="Foto hinzufügen"
        tooltip-class="hidden md:block"
        class="w-14 h-14 md:w-16 md:h-16 rounded-md flex-shrink-0 bg-transparent hover:bg-[var(--color-sidebar-hover)] transition-colors"
      >
        <template #icon>
          <span class="material-icons text-3xl text-[var(--color-icon)]">add_photo_alternate</span>
        </template>
      </Button>
    </div>

    <div
      class="ml-auto md:ml-0 md:mt-auto flex flex-row md:flex-col gap-4 w-auto md:w-full md:px-4"
    >
      <Button
        variant="ghost"
        iconOnly
        @click="emit('toggle-side')"
        aria-label="Seite wechseln"
        tooltip="Seite wechseln"
        tooltip-class="hidden md:block left-full top-1/2 -translate-y-1/2 ml-3 bg-gray-900 text-white border border-gray-700 shadow-xl"
        class="w-14 h-14 md:w-16 md:h-16 rounded-md flex-shrink-0 bg-transparent hover:bg-[var(--color-sidebar-hover)] transition-colors"
      >
        <template #icon>
          <span
            class="material-icons text-3xl transform transition-transform duration-500 text-[var(--color-icon)]"
            :class="{ 'rotate-180': !isFront }"
          >
            flip_camera_android
          </span>
        </template>
      </Button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import Button from '../Button.vue'

defineProps<{
  isFront: boolean
  isLandscape: boolean
}>()

const emit = defineEmits<{
  (e: 'clear'): void
  (e: 'toggle-orientation'): void
  (e: 'add-text'): void
  (e: 'add-sticker'): void
  (e: 'open-mood-templates'): void
  (e: 'add-photo'): void
  (e: 'toggle-side'): void
}>()
</script>
