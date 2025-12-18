<template>
  <section class="page" aria-labelledby="page-title">
    <header class="intro">
      <h1 id="page-title">Hier kannst du deine Postkarten einsehen</h1>
      <p class="tagline">{{ introText }}</p>
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
            :disabled="disabled"
            @click="
              () => {
                onClick()
                emit('cta')
              }
            "
          >
            {{ ctaLabel }}
          </Button>
        </template>
      </PostcardGallery>
    </main>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, } from 'vue'
import PostcardGallery, { type Postcard } from './components/PostCardGallery.vue'
import Button from './components/Button.vue'

const emit = defineEmits<{ (e: 'cta'): void }>()

const props = withDefaults(
  defineProps<{
    introText?: string
    ctaLabel?: string
    apiUrl?: string
  }>(),
  {
    introText: 'Wish you were here ✨',
    ctaLabel: 'Do Something',
    apiUrl: '/api/postcards',
  },
)

const PAGE_SIZE = 9
const allPostcards = ref<Postcard[]>([])
const visibleCount = ref(PAGE_SIZE)
const isLoading = ref(false)
const error = ref<string | null>(null)
const postcards = computed(() => allPostcards.value.slice(0, visibleCount.value))
const hasMore = computed(() => allPostcards.value.length > visibleCount.value)

async function fetchPostcards() {
  isLoading.value = true
  error.value = null
  try {
    const res = await fetch(props.apiUrl, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    const data = (await res.json()) as Postcard[]
    allPostcards.value = Array.isArray(data) ? data : []
    visibleCount.value = PAGE_SIZE
  } catch (e) {
    error.value = 'Could not load postcards. Showing samples.'
    if (allPostcards.value.length === 0) {
      allPostcards.value = [
        {
          id: 'sample-1',
          title: 'Sample Postcard',
          imageUrl: 'https://via.placeholder.com/640x420?text=Postcard+1',
        },
        {
          id: 'sample-2',
          title: 'Another Sample',
          imageUrl: 'https://via.placeholder.com/640x420?text=Postcard+2',
        },
        {
          id: 'sample-3',
          title: 'Greetings!',
          imageUrl: 'https://via.placeholder.com/640x420?text=Postcard+3',
        },
      ]
    }
    visibleCount.value = Math.min(PAGE_SIZE, allPostcards.value.length)
  } finally {
    isLoading.value = false
  }
}


function onLoadMore() {
  visibleCount.value = Math.min(visibleCount.value + PAGE_SIZE, allPostcards.value.length)
}

onMounted(fetchPostcards)
</script>
