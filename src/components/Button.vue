<template>
  <button
    ref="buttonRef"
    :type="type"
    :disabled="disabled"
    :aria-label="iconOnly ? ariaLabel : undefined"
    class="group inline-flex items-center px-3 py-2 justify-center gap-2 text-xs sm:text-sm lg:text-base select-none transition-transform duration-200 rounded-xs"
    :class="[
      disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:scale-105 cursor-pointer',
      iconOnly ? 'p-2 aspect-square' : 'px-3 py-2',
      variantClasses,
    ]"
    @click="emit('click', $event)"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <Teleport to="body">
      <div
        v-if="tooltip && isHovered"
        class="fixed z-[9999] bg-[var(--color-font)] text-[var(--color-bg)] text-sm px-2 py-1 rounded whitespace-nowrap shadow-sm pointer-events-none transition-opacity duration-200"
        :class="tooltipClass"
        :style="tooltipStyle"
      >
        {{ tooltip }}
      </div>
    </Teleport>

    <span v-if="$slots.icon" class="leading-none transition-transform duration-200 icon-wrapper">
      <slot name="icon" />
    </span>

    <span v-if="!iconOnly" class="transition-transform duration-200">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'

type BtnVariant = 'primary' | 'ghost' | 'primaryIconTop' | 'danger' | 'outline'

const emit = defineEmits<{
  (e: 'click', ev: MouseEvent): void
}>()

const buttonRef = ref<HTMLButtonElement | null>(null)
const isHovered = ref(false)
const tooltipPosition = ref({ top: 0, left: 0 })

const showTooltip = () => {
    isHovered.value = true
    updatePosition()
}

const hideTooltip = () => {
    isHovered.value = false
}

const updatePosition = () => {
    if (!buttonRef.value) return
    const rect = buttonRef.value.getBoundingClientRect()
    
    // Default to "right" position for this sidebar use-case, but strictly speaking we could make it smarter.
    // For now, based on user request "sidebar buttons", right placement is key.
    // Let's vertically center it and place it to the right.
    
    tooltipPosition.value = {
        top: rect.top + rect.height / 2,
        left: rect.right
    }
}

const tooltipStyle = computed(() => ({
    top: `${tooltipPosition.value.top}px`,
    left: `${tooltipPosition.value.left + 6}px`, // Added margin here directly
    transform: 'translateY(-50%)'
}))

const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: BtnVariant
    disabled?: boolean
    iconOnly?: boolean
    ariaLabel?: string
    tooltip?: string
    tooltipClass?: string
  }>(),
  {
    type: 'button',
    variant: 'primary',
    disabled: false,
    iconOnly: false,
    ariaLabel: 'Button',
    tooltip: '',
    tooltipClass: '',
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
    
    case 'danger':
      return ['bg-red-500', 'text-white', 'hover:bg-red-600']

    case 'outline':
      return [
        'bg-transparent',
        'border',
        'border-[var(--color-border)]',
        'text-[var(--color-font)]',
        'hover:border-[var(--color-border-dark)]',
      ]

    default:
      return ['bg-[var(--color-highlight)]', 'text-[var(--color-bg)]']
  }
})
</script>

<style scoped>
.icon-wrapper :deep(svg) {
  width: 1.25em;
  height: 1.25em;
}
</style>
