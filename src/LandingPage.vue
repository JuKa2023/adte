<template>
  <div
    ref="scrollContainer"
    class="landing-page h-screen overflow-y-auto overflow-x-hidden bg-dot-pattern snap-y snap-mandatory scroll-smooth"
    @scroll="handleScroll"
  >
    <div
      class="fixed inset-0 z-0 bg-cover bg-center"
      :style="{ backgroundImage: `url(${heroBg})` }"
    ></div>
    <div
      class="fixed inset-0 z-0 bg-gradient-to-b from-white/60 via-white/90 to-white dark:from-slate-900/60 dark:via-slate-900/90 dark:to-slate-900 pointer-events-none"
    ></div>

    <nav
      class="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center transition-all duration-300"
      :class="{ 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm': isScrolled }"
    >
      <div
        class="text-2xl font-bold font-handwriting tracking-tight cursor-pointer select-none"
        @click="scrollToTop"
      >
        adte
      </div>
      <div class="flex gap-4">
        <Button v-if="!user" variant="ghost" @click="router.push('/login')">Login</Button>
        <Button variant="primary" @click="handleCtaClick">Postkarte erstellen</Button>
      </div>
    </nav>

    <header
      class="relative z-10 min-h-screen flex flex-col justify-center items-center text-center px-4 pt-20 overflow-hidden snap-start"
    >
      <div class="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div
          v-for="(card, index) in heroCards"
          :key="index"
          class="absolute transition-all duration-1000 ease-in-out will-change-transform opacity-0 animate-float-fade"
          :style="{
            top: card.top,
            left: card.left,
            right: card.right,
            bottom: card.bottom,
            animationDelay: card.delay,
            animationDuration: '12s',
            '--card-rotate': `${card.rotation}deg`,
            '--card-scale': card.scale,
          }"
        >
          <PolaroidCard class="shadow-2xl w-48 md:w-60">
            <template #image>
              <img
                :src="card.image"
                class="w-full h-full object-cover aspect-[3/4]"
                :alt="card.caption"
              />
            </template>
            <template #caption>
              <p class="font-handwriting text-lg text-center mt-2 text-gray-800 whitespace-nowrap">
                {{ card.caption }}
              </p>
            </template>
          </PolaroidCard>
        </div>
      </div>

      <div class="relative z-10 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
        <h1
          class="text-7xl md:text-[10rem] font-bold tracking-tighter text-slate-900 dark:text-white drop-shadow-sm font-handwriting mb-2 leading-none"
        >
          adte
        </h1>
        <p
          class="text-xl md:text-3xl text-slate-700 dark:text-slate-200 max-w-2xl mx-auto font-light leading-relaxed"
        >
          {{ introText }}
        </p>

        <div class="pt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
          <Button
            @click="handleCtaClick"
            size="lg"
            class="px-12 py-6 text-xl font-bold text-white shadow-2xl hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] hover:-translate-y-1 transition-all duration-300 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-none relative overflow-hidden group"
          >
            <span class="relative z-10">{{ ctaLabel }}</span>
            <div
              class="absolute inset-0 bg-white/20 group-hover:bg-white/30 transition-colors duration-300"
            ></div>
          </Button>
        </div>
      </div>

      <div
        class="absolute bottom-10 animate-bounce cursor-pointer opacity-70 z-20"
        @click="scrollToContent"
      >
        <span class="material-icons text-4xl">expand_more</span>
      </div>
    </header>

    <section
      id="how-it-works"
      class="relative z-10 py-32 px-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md min-h-screen flex flex-col justify-center snap-start"
    >
      <div class="max-w-7xl mx-auto">
        <h2
          class="text-5xl md:text-6xl font-bold text-center mb-24 font-handwriting text-slate-800 dark:text-white"
        >
          So funktioniert's
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
          <svg
            class="hidden md:block absolute top-[60px] left-[16%] right-[16%] w-[68%] h-20 -z-10"
            overflow="visible"
          >
            <path
              d="M0,0 Q150,50 300,0 T600,0"
              fill="none"
              class="stroke-slate-300 dark:stroke-slate-700"
              stroke-width="3"
              stroke-dasharray="8 8"
            />
          </svg>

          <div class="flex flex-col items-center text-center space-y-6 group">
            <div
              class="relative transform group-hover:rotate-[-3deg] transition-transform duration-300"
            >
              <div
                class="w-32 h-32 rounded-3xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shadow-lg border-2 border-slate-100 dark:border-slate-700"
              >
                <span class="material-icons text-5xl text-blue-500 dark:text-blue-400"
                  >add_a_photo</span
                >
              </div>
              <div
                class="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-lg shadow-md ring-4 ring-white dark:ring-slate-900"
              >
                1
              </div>
            </div>
            <h3 class="text-3xl font-bold font-handwriting text-slate-900 dark:text-white">
              Posing & Klick
            </h3>
            <p class="text-slate-600 dark:text-slate-300 max-w-xs text-lg leading-relaxed">
              Such dir ein schönes Motiv oder lade deinen Lieblings-Schnappschuss hoch.
            </p>
          </div>

          <div
            class="flex flex-col items-center text-center space-y-6 group delay-100 mt-12 md:mt-0"
          >
            <div
              class="relative transform group-hover:rotate-[3deg] transition-transform duration-300"
            >
              <div
                class="w-32 h-32 rounded-3xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shadow-lg border-2 border-slate-100 dark:border-slate-700"
              >
                <span class="material-icons text-5xl text-pink-500 dark:text-pink-400">brush</span>
              </div>
              <div
                class="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-lg shadow-md ring-4 ring-white dark:ring-slate-900"
              >
                2
              </div>
            </div>
            <h3 class="text-3xl font-bold font-handwriting text-slate-900 dark:text-white">
              Kreativ werden
            </h3>
            <p class="text-slate-600 dark:text-slate-300 max-w-xs text-lg leading-relaxed">
              Tob dich aus! Sticker, Texte, mach es zu deinem Kunstwerk.
            </p>
          </div>

          <div class="flex flex-col items-center text-center space-y-6 group delay-200">
            <div
              class="relative transform group-hover:rotate-[-3deg] transition-transform duration-300"
            >
              <div
                class="w-32 h-32 rounded-3xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shadow-lg border-2 border-slate-100 dark:border-slate-700"
              >
                <span class="material-icons text-5xl text-emerald-500 dark:text-emerald-400"
                  >send</span
                >
              </div>
              <div
                class="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold text-lg shadow-md ring-4 ring-white dark:ring-slate-900"
              >
                3
              </div>
            </div>
            <h3 class="text-3xl font-bold font-handwriting text-slate-900 dark:text-white">
              Freude schenken
            </h3>
            <p class="text-slate-600 dark:text-slate-300 max-w-xs text-lg leading-relaxed">
              Verschicke deinen magischen Link. Ohne Briefmarke, aber mit viel ❤️.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="relative z-10 py-32 px-4 bg-slate-50 dark:bg-slate-950 shadow-inner snap-start">
      <div class="max-w-7xl mx-auto">
        <div class="flex flex-col items-center mb-20 text-center">
          <h2
            class="text-5xl md:text-6xl font-bold font-handwriting mb-6 text-slate-800 dark:text-white"
          >
            Inspirationen
          </h2>
          <p class="text-xl text-slate-500 dark:text-slate-400 max-w-2xl">
            Jede Karte erzählt eine Geschichte. Hier sind ein paar von unserer Community.
          </p>
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
            <div class="flex justify-center mt-16">
              <Button
                variant="outline"
                size="lg"
                class="px-8 py-3"
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import PostcardGallery, { type Postcard } from './components/PostCardGallery.vue'
import PolaroidCard from './components/PolaroidCard.vue'
import Button from './components/Button.vue'
import heroBg from './assets/hero_bg.png'
import { useRouter } from 'vue-router'
import { currentUser } from './backend'

interface Props {
  introText?: string
  ctaLabel?: string
  apiUrl?: string
}

withDefaults(defineProps<Props>(), {
  introText: 'Der einfachste Weg, digitale Postkarten mit echtem Feeling zu versenden.',
  ctaLabel: 'Jetzt loslegen',
  apiUrl: '/api/postcards',
})

const emit = defineEmits<{ (e: 'cta'): void }>()
const router = useRouter()
const user = currentUser

const scrollContainer = ref<HTMLElement | null>(null)
const isScrolled = ref(false)

const handleScroll = () => {
  if (scrollContainer.value) {
    isScrolled.value = scrollContainer.value.scrollTop > 50
  }
}

onMounted(() => {})

onUnmounted(() => {})

function scrollToTop() {
  scrollContainer.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

function scrollToContent() {
  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
}

function handleCtaClick() {
  if (currentUser.value) {
    router.push('/create')
  } else {
    router.push('/login')
  }
}

const isLoading = ref(false)
const error = ref<string | null>(null)

const galleryImages = import.meta.glob('./assets/gallery/*.{png,jpg,jpeg,svg}', {
  eager: true,
  as: 'url',
})

const captionMap: Record<string, string> = {
  postcard_example_1: 'Van Life Diaries 🚐',
  postcard_example_2: 'Secret Garden 🌸',
}

const allPostcards = ref<Postcard[]>(
  Object.entries(galleryImages).map(([path, url]) => {
    const filename = path.split('/').pop()?.split('.')[0] || 'Unknown'
    const title =
      captionMap[filename] ||
      filename.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

    return {
      id: filename,
      title: title,
      imageUrl: url,
    }
  }),
)
const visibleCount = ref(9)

const heroCards = [
  {
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=600',
    caption: 'Ciao Bella! 🇮🇹',
    top: '15%',
    left: '5%',
    rotation: -6,
    scale: 0.9,
    delay: '0s',
  },
  {
    image: 'https://images.unsplash.com/photo-1534081333815-ae5019106622?q=80&w=600',
    caption: 'Relaxing... 🌊',
    bottom: '20%',
    right: '5%',
    rotation: 6,
    scale: 0.95,
    delay: '2s',
  },
  {
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600',
    caption: 'Roadtrip 🚐',
    top: '25%',
    right: '10%',
    rotation: 12,
    scale: 0.85,
    delay: '4s',
  },
  {
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=600',
    caption: 'Summit 🏔️',
    bottom: '15%',
    left: '8%',
    rotation: -12,
    scale: 0.9,
    delay: '6s',
  },
  {
    image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=600',
    caption: 'Starry Night ✨',
    top: '10%',
    left: '25%',
    rotation: -3,
    scale: 0.8,
    delay: '8s',
  },
  {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600',
    caption: 'Paradise 🌴',
    bottom: '30%',
    right: '20%',
    rotation: 8,
    scale: 0.85,
    delay: '10s',
  },
  {
    image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600',
    caption: 'Cozy Vibes ☕',
    top: '40%',
    left: '-2%',
    rotation: 15,
    scale: 0.8,
    delay: '5s',
  },
  {
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=600',
    caption: 'Venice ❤️',
    top: '35%',
    right: '-2%',
    rotation: -8,
    scale: 0.85,
    delay: '1s',
  },
  {
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600',
    caption: 'Greek Summer 🇬🇷',
    top: '12%',
    right: '15%',
    rotation: 4,
    scale: 0.9,
    delay: '3s',
  },
  {
    image: 'https://images.unsplash.com/photo-1499678329028-101435549a4e?q=80&w=600',
    caption: 'Tuscany 🍷',
    bottom: '10%',
    left: '30%',
    rotation: -5,
    scale: 0.88,
    delay: '7s',
  },
]

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

.bg-dot-pattern {
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 24px 24px;
}
.dark .bg-dot-pattern {
  background-image: radial-gradient(#1f2937 1px, transparent 1px);
}

.animate-fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
  transform: translateY(30px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-float-fade {
  animation-name: float-fade;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@keyframes float-fade {
  0% {
    opacity: 0;
    transform: translateY(20px) rotate(var(--card-rotate)) scale(var(--card-scale));
  }
  10% {
    opacity: 0.9;
    transform: translateY(0) rotate(var(--card-rotate)) scale(var(--card-scale));
  }
  50% {
    opacity: 0.9;
    transform: translateY(-10px) rotate(var(--card-rotate)) scale(var(--card-scale));
  }
  60% {
    opacity: 0;
    transform: translateY(-30px) rotate(var(--card-rotate)) scale(var(--card-scale));
  }
  100% {
    opacity: 0;
    transform: translateY(-30px) rotate(var(--card-rotate)) scale(var(--card-scale));
  }
}
</style>
