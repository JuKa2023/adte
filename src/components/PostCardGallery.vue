<template>
  <div class="gallery-wrapper py-8">
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    <div
      v-else-if="error"
      class="text-center p-8 bg-red-50 text-red-600 rounded-lg max-w-2xl mx-auto"
      aria-live="polite"
    >
      {{ error }}
    </div>

    <ul v-else :aria-label="ariaLabel" class="grid-gallery">
      <li
        v-for="(card, index) in items"
        :key="card.id"
        class="h-full"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <PolaroidCard
          :image-url="card.imageUrl"
          :title="card.title"
          @click="emit('select', card)"
        />
      </li>
    </ul>

    <p v-if="!isLoading && !error && items.length === 0" class="text-center py-12 text-gray-500">
      {{ emptyMessage }}
    </p>

    <div v-if="hasMore" class="flex justify-center mt-12 pb-8">
      <slot name="cta" :disabled="isLoading" :onClick="() => emit('loadMore')">
        <MehrButton :disabled="isLoading" @click="emit('loadMore')">
          {{ moreLabel }}
        </MehrButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import MehrButton from './Button.vue'
import PolaroidCard from './PolaroidCard.vue'

export type Postcard = {
  id: string | number
  title: string
  imageUrl: string
}

const emit = defineEmits<{
  (e: 'select', card: Postcard): void
  (e: 'loadMore'): void
}>()

withDefaults(
  defineProps<{
    items: Postcard[]
    isLoading?: boolean
    error?: string | null
    ariaLabel?: string
    emptyMessage?: string
    hasMore?: boolean
    moreLabel?: string
  }>(),
  {
    items: () => [],
    isLoading: false,
    error: null,
    ariaLabel: 'Postcards',
    emptyMessage: 'No postcards yet — check back soon!',
    hasMore: false,
    moreLabel: 'Show more postcards',
  },
)
</script>

<style scoped>
/* Font is imported in index.html */

.font-handwriting {
  font-family: 'Architects Daughter', cursive;
}

.gallery-wrapper {
  width: 100%;
}

.grid-gallery {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 2.5rem;
  padding: 1rem;
  list-style: none;
  margin: 0;
}

@media (min-width: 640px) {
  .grid-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .grid-gallery {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 3rem;
  }
}

@media (min-width: 1280px) {
  .grid-gallery {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
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
