<template>
    <section class="page" aria-labelledby="page-title">
      <header class="intro">
        <h1 id="page-title" class="sr-only">Hier kannst du deine Postkarten einsehen</h1>
        <p class="tagline">{{ introText }}</p>
      </header>
  
      <main class="content" role="main">
        <PostcardGallery
          :items="postcards"
          :isLoading="isLoading"
          :error="error"
          @select="onSelect"
        />
      </main>
  
      <div class="bottom-cta">
        <button type="button" class="btn" @click="emit('cta')">
          {{ ctaLabel }}
        </button>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { onMounted, ref, withDefaults, defineProps, defineEmits } from 'vue';
  import PostcardGallery, { type Postcard } from './components/PostCardGallery.vue';
  
  const emit = defineEmits<{ (e: 'cta'): void }>();
  
  const props = withDefaults(
    defineProps<{
      introText?: string;
      ctaLabel?: string;
      apiUrl?: string;
    }>(),
    {
      introText: 'Wish you were here ✨',
      ctaLabel: 'Do Something',
      apiUrl: '/api/postcards',
    }
  );
  
  const postcards = ref<Postcard[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  async function fetchPostcards() {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await fetch(props.apiUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as Postcard[];
      postcards.value = Array.isArray(data) ? data : [];
    } catch (e) {
      error.value = 'Could not load postcards. Showing samples.';
      if (postcards.value.length === 0) {
        postcards.value = [
          { id: 'sample-1', title: 'Sample Postcard', imageUrl: 'https://via.placeholder.com/640x420?text=Postcard+1' },
          { id: 'sample-2', title: 'Another Sample', imageUrl: 'https://via.placeholder.com/640x420?text=Postcard+2' },
          { id: 'sample-3', title: 'Greetings!', imageUrl: 'https://via.placeholder.com/640x420?text=Postcard+3' },
        ];
      }
    } finally {
      isLoading.value = false;
    }
  }
  
  function onSelect(card: Postcard) {
    // Handle card selection if needed
    // e.g., navigate to details or open a modal
    // console.log('Selected card:', card);
  }
  
  onMounted(fetchPostcards);
  </script>