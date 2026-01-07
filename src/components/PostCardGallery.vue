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
        v-for="(card, index) in displayItems"
        :key="card.id"
        class="h-full"
        :style="{ animationDelay: `${index * 50}ms` }"
      >
        <PolaroidCard
          :image-url="card.imageUrl"
          :title="card.title"
          :aspect-class="card.aspectClass"
          @click="emit('select', card)"
        />
      </li>
    </ul>

    <p
      v-if="!isLoading && !error && displayItems.length === 0"
      class="text-center py-12 text-gray-500"
    >
      {{ emptyMessage }}
    </p>

    <div v-if="showLoadMore" class="flex justify-center mt-12 pb-8">
      <slot name="cta" :disabled="isLoading" :onClick="handleLoadMore">
        <MehrButton :disabled="isLoading" @click="handleLoadMore">
          {{ moreLabel }}
        </MehrButton>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import MehrButton from './Button.vue'
import PolaroidCard from './PolaroidCard.vue'

export type Postcard = {
  id: string | number
  title: string
  imageUrl: string
  aspectClass?: string
}

const emit = defineEmits<{
  (e: 'select', card: Postcard): void
  (e: 'loadMore'): void
}>()

const props = withDefaults(
  defineProps<{
    items?: Postcard[]
    isLoading?: boolean
    error?: string | null
    ariaLabel?: string
    emptyMessage?: string
    hasMore?: boolean
    moreLabel?: string
    useLocalGallery?: boolean
  }>(),
  {
    items: () => [],
    isLoading: false,
    error: null,
    ariaLabel: 'Postcards',
    emptyMessage: 'No postcards yet — check back soon!',
    hasMore: false,
    moreLabel: 'Show more postcards',
    useLocalGallery: false,
  },
)

// Logic for Local Gallery
const localVisibleCount = ref(9)
const localItems = ref<Postcard[]>([])

onMounted(() => {
  if (props.useLocalGallery) {
    const galleryImages = import.meta.glob('../assets/gallery/*.{png,jpg,jpeg,svg}', {
      eager: true,
      as: 'url',
    })

    const captionMap: Record<string, string> = {
      postcard_example_1: 'Van Life Diaries 🚐',
      postcard_example_2: 'Secret Garden 🌸',
    }

    localItems.value = Object.entries(galleryImages).map(([path, url]) => {
      const filename = path.split('/').pop()?.split('.')[0] || 'Unknown'
      const title =
        captionMap[filename] ||
        filename.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

      return {
        id: filename,
        title: title,
        imageUrl: url as string,
      }
    })
  }
})

const displayItems = computed(() => {
  if (props.useLocalGallery) {
    return localItems.value.slice(0, localVisibleCount.value)
  }
  return props.items
})

const showLoadMore = computed(() => {
  if (props.useLocalGallery) {
    return localItems.value.length > localVisibleCount.value
  }
  return props.hasMore
})

function handleLoadMore() {
  if (props.useLocalGallery) {
    localVisibleCount.value = Math.min(localVisibleCount.value + 3, localItems.value.length)
  } else {
    emit('loadMore')
  }
}
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
