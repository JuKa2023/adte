<template>
  <div
    class="absolute inset-0"
    :class="[overflowVisible ? 'overflow-visible' : 'overflow-hidden', shadow ? 'shadow-xl' : '']"
    :style="shellStyle"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    side: 'front' | 'back'
    isActive?: boolean
    overflowVisible?: boolean
    shadow?: boolean
  }>(),
  {
    overflowVisible: false,
    shadow: false,
  },
)

const shellStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {
    backfaceVisibility: 'hidden',
    transform: props.side === 'back' ? 'rotateY(180deg)' : 'rotateY(0deg)',
    backgroundColor: 'var(--color-card-bg)',
    color: 'var(--color-font)',
  }

  if (props.isActive !== undefined) {
    style.pointerEvents = props.isActive ? 'auto' : 'none'
    style.zIndex = props.isActive ? '2' : '1'
  }

  return style
})
</script>
