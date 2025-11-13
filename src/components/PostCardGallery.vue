<template>
  <div class="gallery-wrap">
    <div v-if="isLoading" class="status">Loading postcards…</div>
    <div v-else-if="error" class="status error" aria-live="polite">{{ error }}</div>

    <ul :aria-label="ariaLabel" class="gallery items-start">
      <li v-for="card in items" :key="card.id" class="card" role="button" tabindex="0">
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
        <MehrButton :disabled="isLoading" @click="emit('loadMore')" >
          {{ moreLabel }}
        </MehrButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import MehrButton from './Button.vue'

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

/* FLEX instead of CSS grid */
.gallery {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

/* 1 per row on phones (default) */
.card {
  flex: 0 1 100%;
  border-radius: 0.1rem;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  outline: none;
  background: transparent;
}

@media (min-width: 640px) {
  .gallery {
    gap: 1.25rem;
  }

  /* 2 per row on tablet */
  .card {
    flex: 0 1 calc(50% - 0.625rem); /* 2 * (50% - 0.625rem) + 1.25rem gap = 100% */
  }
}

@media (min-width: 1024px) {
  .gallery {
    gap: 1.5rem;
  }

  /* 3 per row on desktop */
  .card {
    flex: 0 1 calc(33.333% - 1rem); /* 3 * (33.333% - 1rem) + 2 * 1.5rem gap ≈ 100% */
  }
}

.card-inner {
  display: block;
}
.image-wrap {
  margin: 0;
}
.image {
  display: block;
  width: 100%;
  height: auto; /* keeps the native aspect ratio */
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
