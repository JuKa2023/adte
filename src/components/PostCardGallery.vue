<!-- components/PostcardGallery.vue -->
<template>
    <div class="gallery-wrap">
      <div v-if="isLoading" class="status">Loading postcards…</div>
      <div v-else-if="error" class="status error" aria-live="polite">{{ error }}</div>
  
      <ul v-else class="grid" :aria-label="ariaLabel">
        <li
          v-for="card in items"
          :key="card.id"
          class="card"
          @click="() => emit('select', card)"
          role="button"
          tabindex="0"
          @keydown.enter="() => emit('select', card)"
        >
          <article class="card-inner">
            <figure class="image-wrap">
              <img
                class="image"
                :src="card.imageUrl"
                :alt="card.title || 'Postcard image'"
                loading="lazy"
              />
            </figure>
            <h3 class="title">{{ card.title }}</h3>
          </article>
        </li>
      </ul>
  
      <p v-if="!isLoading && !error && items.length === 0" class="empty">
        {{ emptyMessage }}
      </p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { withDefaults, defineProps, defineEmits } from 'vue';
  
  export type Postcard = {
    id: string | number;
    title: string;
    imageUrl: string;
  };
  
  const emit = defineEmits<{
    (e: 'select', card: Postcard): void;
  }>();
  
  const props = withDefaults(
    defineProps<{
      items: Postcard[];
      isLoading?: boolean;
      error?: string | null;
      ariaLabel?: string;
      emptyMessage?: string;
    }>(),
    {
      items: () => [],
      isLoading: false,
      error: null,
      ariaLabel: 'Postcards',
      emptyMessage: 'No postcards yet — check back soon!',
    }
  );
  </script>
  
  <style scoped>
  .gallery-wrap { }
  .status { padding: 1rem; opacity: 0.9; }
  .status.error { color: #ffd6d6; }
  
  .grid {
    list-style: none;
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1rem;
    margin: 0;
    padding: 0;
  }
  
  @media (min-width: 640px) {
    .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.25rem; }
  }
  @media (min-width: 1024px) {
    .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; }
  }
  
  .card {
    background: #111318;
    border: 1px solid #1f232b;
    border-radius: 1rem;
    overflow: hidden;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
    outline: none;
  }
  .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.35); }
  .card:focus { box-shadow: 0 0 0 3px rgba(79,70,229,.55); }
  
  .card-inner { display: grid; grid-template-rows: auto auto; }
  .image-wrap { aspect-ratio: 16 / 10; overflow: hidden; margin: 0; background: #0f1115; }
  .image { width: 100%; height: 100%; object-fit: cover; display: block; }
  .title { margin: 0; padding: 0.75rem 0.875rem 1rem; font-size: 1rem; font-weight: 600; }
  
  .empty { padding: 2rem 0; opacity: 0.8; text-align: center; }
  </style>