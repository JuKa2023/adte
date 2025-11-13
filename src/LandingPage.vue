<template>
  <section class="page" aria-labelledby="page-title">
    <header class="intro">
      <h1 id="page-title">Postcard Gallery</h1>
      <p class="tagline font-[--font-sans]">{{ introText }}</p>
    </header>

    <main class="content" role="main">
      <PostcardGallery
        :items="postcards"
        :isLoading="isLoading"
        :error="error"
        :has-more="hasMore"
        :more-label="ctaLabel"
        @load-more="onLoadMore"
      >
        <template #cta="{ disabled, onClick }">
          <Button
            icon-only
            :aria-label="ctaLabel"
            :disabled="disabled"
            @click="
              () => {
                onClick()
                emit('cta')
              }
            "
          >
            <template #icon>
              <img :src="arrowIcon" alt="" width="20" height="20" aria-hidden="true" />
            </template>
          </Button>
        </template>
      </PostcardGallery>
    </main>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, withDefaults, defineProps, defineEmits } from 'vue'
import PostcardGallery, { type Postcard } from './components/PostCardGallery.vue'
import Button from './components/Button.vue'
import postcardExample1 from './assets/postcard_example_1.jpeg'
import postcardExample2 from './assets/postcard_example_2.png'
import arrowIcon from './assets/icons/arrow_icon.svg'

const emit = defineEmits<{ (e: 'cta'): void }>()

const props = withDefaults(
  defineProps<{
    introText?: string
    ctaLabel?: string
    apiUrl?: string
  }>(),
  {
    introText: 'Gestalte deine digitale Postkarte ganz easy und sende sie sofort los. Ein paar Klicks und deine Grüsse sind da',
    ctaLabel: 'Do Something',
    apiUrl: '/api/postcards',
  },
)

const isLoading = ref(false)
const error = ref<string | null>(null)
const allPostcards = ref<Postcard[]>([
  { id: 'sample-1', title: 'Sunset Boulevard', imageUrl: postcardExample1 },
  { id: 'sample-2', title: 'Palm Trees', imageUrl: postcardExample2 },
  { id: 'sample-3', title: 'Sunny Shores', imageUrl: postcardExample1 },
])
const visibleCount = ref(9)

const postcards = computed(() => allPostcards.value.slice(0, visibleCount.value))
const hasMore = computed(() => allPostcards.value.length > visibleCount.value)

function onSelect(card: Postcard) {

}

function onLoadMore() {
  visibleCount.value = Math.min(visibleCount.value + 1, allPostcards.value.length)
}

</script>
