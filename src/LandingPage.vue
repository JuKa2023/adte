<template>
  <div class="min-h-screen flex flex-col relative text-slate-800">
    <!-- Global Background -->
    <div 
      class="fixed inset-0 z-0 bg-cover bg-center" 
      :style="{ backgroundImage: `url(${heroBg})` }"
    ></div>
    <div class="fixed inset-0 z-0 bg-gradient-to-b from-white/30 via-white/70 to-white/90 pointer-events-none"></div>

    <!-- Hero Section -->
    <header class="relative z-10 flex flex-col justify-center items-center text-center px-4 py-32 md:py-48 overflow-hidden">
      
      <div class="relative z-10 max-w-4xl mx-auto space-y-6 animate-fade-in-up">
        <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 drop-shadow-sm font-handwriting">
          Postcard Gallery
        </h1>
        <p class="text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto font-sans leading-relaxed">
          {{ introText }}
        </p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow relative z-10 shadow-xl rounded-t-3xl border-t border-white/50 mx-4 md:mx-0" role="main">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="mb-12 flex items-center justify-between">
            <h2 class="text-3xl font-bold text-slate-800 font-handwriting">Community Creations</h2>
             <div class="h-1 flex-grow mx-6 bg-slate-400/20 rounded-full"></div>
        </div>

        <PostcardGallery
          :items="postcards"
          :isLoading="isLoading"
          :error="error"
          :has-more="hasMore"
          :more-label="'Mehr laden'"
          @load-more="onLoadMore"
        >
          <template #cta="{ disabled, onClick }">
             <div class="flex justify-center mt-12">
                <Button
                    variant="outline"
                    :disabled="disabled"
                    @click="
                      () => {
                        onClick()
                        emit('cta')
                      }
                    "
                  >
                  Mehr anzeigen
                </Button>
             </div>
          </template>
        </PostcardGallery>
      </div>
    </main>
    
    <!-- Fixed Floating CTA -->
    <div class="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div class="pointer-events-auto filter drop-shadow-xl">
        <Button
          @click="emit('cta')"
          size="lg"
        >
          {{ ctaLabel }}
          <template #icon>
            <img :src="arrowIcon" class="invert brightness-0" alt="" width="24" height="24" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </div>
    
    <!-- Footer moved to global App.vue -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PostcardGallery, { type Postcard } from './components/PostCardGallery.vue'
import Button from './components/Button.vue'
import arrowIcon from './assets/icons/arrow_icon.svg'
import heroBg from './assets/hero_bg.png'

const emit = defineEmits<{ (e: 'cta'): void }>()

const props = withDefaults(
  defineProps<{
    introText?: string
    ctaLabel?: string
    apiUrl?: string
  }>(),
  {
    introText: 'Gestalte deine digitale Postkarte ganz easy und sende sie sofort los. Ein paar Klicks und deine Grüsse sind da.',
    ctaLabel: 'Jetzt gestalten',
    apiUrl: '/api/postcards',
  },
)

const isLoading = ref(false)
const error = ref<string | null>(null)

const galleryImages = import.meta.glob('./assets/gallery/*.{png,jpg,jpeg,svg}', { eager: true, as: 'url' })

const allPostcards = ref<Postcard[]>(
  Object.entries(galleryImages).map(([path, url]) => {
    const filename = path.split('/').pop()?.split('.')[0] || 'Unknown'
    const title = filename
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
    
    return {
      id: filename,
      title: title,
      imageUrl: url
    }
  })
)
const visibleCount = ref(9)

const postcards = computed(() => allPostcards.value.slice(0, visibleCount.value))
const hasMore = computed(() => allPostcards.value.length > visibleCount.value)

function onLoadMore() {
  visibleCount.value = Math.min(visibleCount.value + 3, allPostcards.value.length)
}

</script>

<style scoped>
.font-handwriting {
    font-family: 'Architects Daughter', cursive;
}

.animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
