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
        <div class="pt-8">
           <Button
            @click="emit('cta')"
          >
            {{ ctaLabel }}
            <template #icon>
              <img :src="arrowIcon" class="invert brightness-0" alt="" width="24" height="24" aria-hidden="true" />
            </template>
          </Button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-grow relative z-10 bg-white/60 backdrop-blur-sm shadow-xl rounded-t-3xl border-t border-white/50 mx-4 md:mx-0" role="main">
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
    
    <!-- Footer moved to global App.vue -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import PostcardGallery, { type Postcard } from './components/PostCardGallery.vue'
import Button from './components/Button.vue'
import vintage1 from './assets/gallery/vintage_1.png'
import vintage2 from './assets/gallery/vintage_2.png'
import vintage3 from './assets/gallery/vintage_3.png'
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
const allPostcards = ref<Postcard[]>([
  { id: 'vintage-1', title: 'Swiss Alps Heritage', imageUrl: vintage1 },
  { id: 'vintage-2', title: 'Romantic Bouquet', imageUrl: vintage2 },
  { id: 'vintage-3', title: 'Parisian Streets', imageUrl: vintage3 },
])
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
