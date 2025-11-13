<template>
  <div class="gallery-wrap">
    <div v-if="isLoading" class="status">Loading postcards…</div>
    <div v-else-if="error" class="status error" aria-live="polite">{{ error }}</div>

    <ul :aria-label="ariaLabel" class="grid">
      <li
        v-for="card in items"
        :key="card.id"
        class="card"
        @click="() => emit('select', card)"
        @keydown.enter="() => emit('select', card)"
        role="button"
        tabindex="0"
      >
        <img
          :src="card.imageUrl"
          :alt="'Postcard image'"
          loading="lazy"
          decoding="async"
          class="image"
        />
      </li>
    </ul>

    <p v-if="!isLoading && !error && items.length === 0" class="empty">
      {{ emptyMessage }}
    </p>

    <div v-if="hasMore" class="cta">
      <slot name="cta" :disabled="isLoading" :onClick="() => emit('loadMore')">
        <Button :disabled="isLoading" @click="emit('loadMore')">
          {{ moreLabel }}
        </Button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { withDefaults, defineProps, defineEmits } from 'vue'
import Button from './Button.vue'

export type Postcard = {
  id: string | number
  title: string
  imageUrl: string
}

const emit = defineEmits<{
  (e: 'select', card: Postcard): void
  (e: 'loadMore'): void
}>()

const props = withDefaults(
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
.status {
  padding: 1rem;
  opacity: 0.9;
}
.status.error {
  color: #ffd6d6;
}

.grid {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }
}
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
  }
}

.card {
  border-radius: 0.2rem;
  overflow: hidden;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
  cursor: pointer;
  outline: none;
  background: transparent;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}
.card:focus {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.55);
}

.card-inner {
  display: block;
}
.image-wrap {
  margin: 0;
  /* REMOVE the forced aspect ratio and clipping */
  /* aspect-ratio: 16 / 10; */
  /* overflow: hidden; */
}
.image {
  display: block;
  width: 100%;
  height: auto; /* keeps the native aspect ratio */
  /* object-fit: cover; */ /* <-- remove to avoid cropping */
}
.title {
  margin: 0;
  padding: 0.75rem 0.875rem 1rem;
  font-size: 1rem;
  font-weight: 600;
}

.empty {
  padding: 2rem 0;
  opacity: 0.8;
  text-align: center;
}
.cta {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}
</style>
