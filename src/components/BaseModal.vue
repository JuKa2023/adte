<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      v-bind="$attrs"
      class="fixed inset-0 flex items-center justify-center"
      :class="[padding ? 'p-4' : '', centerContent ? '' : 'items-start pt-20']"
      :style="{ zIndex, backgroundColor: 'var(--color-modal-overlay)' }"
      @click.self="closeOnBackdrop && emit('close')"
    >
      <slot />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    isOpen: boolean
    zIndex?: number
    padding?: boolean
    centerContent?: boolean
    closeOnBackdrop?: boolean
  }>(),
  {
    zIndex: 50,
    padding: true,
    centerContent: true,
    closeOnBackdrop: true,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>
