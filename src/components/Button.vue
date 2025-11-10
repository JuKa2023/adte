<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-pressed="toggle ? pressed : undefined"
    :aria-label="iconOnly ? ariaLabel : undefined"
    :data-pressed="toggle && pressed ? 'true' : 'false'"
    class="inline-flex items-center justify-center gap-2 rounded-s font-medium select-none focus:outline-none focus-visible:ring-2 ring-offset-2"
    :class="[
      sizeClasses,
      iconOnly ? 'px-3' : 'px-4',
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:opacity-100',
      variantClasses,
    ]"
    @click="onClick"
  >
    <!-- Leading icon -->
    <span v-if="$slots.icon && iconPosition === 'left'" class="leading-none">
      <slot name="icon" />
    </span>

    <!-- Label -->
    <span v-if="!iconOnly">
      <slot />
    </span>

    <!-- Trailing icon -->
    <span v-if="$slots.icon && iconPosition === 'right'" class="leading-none">
      <slot name="icon" />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type BtnVariant = 'primary' | 'outline' | 'ghost'
type BtnSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: BtnVariant
    size?: BtnSize
    toggle?: boolean // enables aria-pressed + v-model:pressed
    pressed?: boolean // model value for toggle state
    disabled?: boolean
    iconOnly?: boolean // for icon-only buttons
    iconPosition?: 'left' | 'right'
    ariaLabel?: string // required if iconOnly
  }>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
    toggle: false,
    pressed: false,
    disabled: false,
    iconOnly: false,
    iconPosition: 'left',
    ariaLabel: 'Button',
  },
)

const emit = defineEmits<{
  (e: 'update:pressed', v: boolean): void
  (e: 'click', ev: MouseEvent): void
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-8 text-sm'
    case 'lg':
      return 'h-12 text-base'
    default:
      return 'h-10 text-sm'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'outline':
      return [
        'bg-transparent',
        'text-[var(--color-surface)]',
        'border border-[var(--color-highlight)]',
        'focus-visible:ring-[var(--color-highlight)]/40',
        'hover:bg-[var(--color-highlight)]/10',
        'data-[pressed=true]:bg-[var(--color-highlight)]/20',
      ]
    case 'ghost':
      return [
        'bg-transparent',
        'text-[var(--color-surface)]',
        'focus-visible:ring-[var(--color-highlight)]/40',
        'hover:bg-[var(--color-highlight)]/10',
        'data-[pressed=true]:bg-[var(--color-highlight)]/20',
      ]
    default: // 'primary'
      return [
        'bg-[var(--color-highlight)]',
        'text-[var(--color-font)]',
        'focus-visible:ring-[var(--color-highlight)]/40',
        'data-[pressed=true]:bg-[var(--color-surface)]',
        'data-[pressed=true]:text-[var(--color-font)]',
      ]
  }
})

function onClick(e: MouseEvent) {
  if (props.toggle) emit('update:pressed', !props.pressed)
  emit('click', e)
}
</script>
