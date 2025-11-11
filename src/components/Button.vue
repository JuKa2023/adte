<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="iconOnly ? ariaLabel : undefined"
    class="inline-flex items-center justify-center gap-2 rounded font-medium select-none px-4 h-10 text-sm transition-transform duration-200"
    :class="[
      disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:scale-105 cursor-pointer',
      variantClasses,
    ]"
    @click="emit('click', $event)"
  >
    <span v-if="$slots.icon" class="leading-none transition-transform duration-200">
      <slot name="icon" />
    </span>

    <span v-if="!iconOnly" class="transition-transform duration-200">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BtnVariant = 'primary' | 'ghost'

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()


const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: BtnVariant
    disabled?: boolean
    iconOnly?: boolean
    ariaLabel?: string
  }>(),
  {
    type: 'button',
    variant: 'primary',
    disabled: false,
    iconOnly: false,
    ariaLabel: 'Button',
  },
)

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'ghost':
      return [
        'bg-[var(--color-button-light)]',
        'text-[var(--color-highlight)]',
      ]
    default:
      return [
        'bg-[var(--color-highlight)]',
        'text-[var(--color-bg)]',
      ]
  }
})
</script>
