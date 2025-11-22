<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="iconOnly ? ariaLabel : undefined"
    class="inline-flex items-center px-4 py-2 justify-center gap-2 text-base select-none transition-transform duration-200"
    :class="[
      disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:scale-105 cursor-pointer',
      iconOnly ? 'p-3 aspect-square' : 'px-4 py-2',
      variantClasses,
    ]"
    @click="emit('click', $event)"
  >
    <span v-if="$slots.icon" class="leading-none transition-transform duration-200">
      <slot name="icon" />
    </span>

    <span v-if="!iconOnly" class="transition-transform duration-200 text-base">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BtnVariant = 'primary' | 'ghost' | 'primaryIconTop'

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
      return ['bg-[var(--color-button-light)]', 'text-[var(--color-highlight)]']

    case 'primaryIconTop':
      return [
        'text-[var(--color-font)]',
        'text-sm',
        'bg-transparent',
        'border',
        'border-[var(--color-highlight)]',

        'flex-col',
        'gap-1',
        'py-3',
      ]

    default: // 'primary'
      return ['bg-[var(--color-highlight)]', 'text-[var(--color-bg)]']
  }
})
</script>
