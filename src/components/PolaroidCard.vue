<template>
  <div
    class="polaroid-card group relative"
    role="button"
    tabindex="0"
    @click="emit('click')"
    @keydown.enter="emit('click')"
    @keydown.space="emit('click')"
  >
    <div class="polaroid-inner group-hover:scale-[1.02] transition-transform duration-300">
      <div
        class="image-wrapper overflow-hidden bg-gray-100 relative"
        :class="aspectClass"
      >
        <slot name="image">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="title || 'Postcard'"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-contain"
          />
        </slot>

        <slot name="overlay"></slot>
      </div>

      <div class="polaroid-caption relative">
        <slot name="caption">
          <h3
            v-if="title"
            class="font-handwriting text-xl text-gray-900 text-center truncate px-2"
          >
            {{ title }}
          </h3>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    imageUrl?: string
    title?: string
    aspectClass?: string
  }>(),
  {
    aspectClass: 'aspect-[3/2]',
  },
)

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.font-handwriting {
  font-family: 'Architects Daughter', cursive;
}

.polaroid-card {
  perspective: 1000px;
  cursor: pointer;
  animation: fadeUp 0.6s ease-out backwards;
}

.polaroid-inner {
  background: var(--polaroid-bg, #ffffff);
  padding: 1rem 1rem 3.5rem 1rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  border-radius: 2px;
  transition:
    transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.3s ease,
    background-color 0.3s ease;
  transform-origin: center center;
  height: 100%;
  display: flex;
  flex-direction: column;
}

:global(.dark) .polaroid-inner {
  --polaroid-bg: #e5e5e5;
}

.polaroid-card:hover .polaroid-inner {
  transform: scale(1.03) rotate(-1deg);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 10;
}

.polaroid-caption {
  margin-top: 1rem;
  text-align: center;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
