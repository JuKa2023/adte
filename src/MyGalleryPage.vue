<template>
  <div class="h-full w-full" style="background-color: var(--color-bg)">
    <!-- Content -->
    <main class="pt-24 px-6 pb-16 max-w-6xl mx-auto">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <span class="material-icons animate-spin text-4xl" style="color: var(--color-primary)">refresh</span>
      </div>

      <div v-else-if="postcards.length === 0" class="flex flex-col items-center justify-center h-64 text-center">
        <span class="material-icons text-6xl mb-4" style="color: var(--color-text-muted)">collections</span>
        <h3 class="text-xl font-medium mb-2" style="color: var(--color-font)">Noch keine Postkarten</h3>
        <p class="mb-6" style="color: var(--color-text-muted)">Erstelle deine erste Postkarte und speichere sie hier.</p>
        <Button
          @click="router.push('/create')"
        >
          Jetzt erstellen
        </Button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        <div
          v-for="card in postcards"
          :key="card.id"
          class="group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border flex flex-col"
          style="background-color: var(--color-card-bg); border-color: var(--color-border)"
        >
          <!-- Card Preview (Front Image) -->
          <div class="relative overflow-hidden" :style="{ aspectRatio: getCardAspectRatio(card) }">
            <GalleryPostcardPreview :postcard="card" />

            <!-- Gradient overlay (keep for text contrast if needed, or remove if it obscures content too much) -->
            <div class="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60"></div>

            <!-- Status badge -->
            <div class="absolute top-3 left-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold shadow"
                :class="card.sent ? 'bg-green-500 text-white' : 'bg-amber-400 text-black'"
              >
                {{ card.sent ? 'Gesendet' : 'Entwurf' }}
              </span>
            </div>

            <!-- Action buttons -->
            <div class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                class="px-3 py-1 rounded-full text-xs font-semibold bg-white text-[var(--color-font)] shadow hover:shadow-lg"
                @click.stop="openShare(card)"
              >
                Share-Link
              </button>
            </div>
          </div>

          <!-- Info footer -->
          <div class="p-4 flex flex-col gap-2" style="background-color: var(--color-card-bg)">
            <p class="font-semibold text-base truncate" style="color: var(--color-font)">{{ card.recipient_email || 'Noch nicht gesetzt' }}</p>
            <p class="text-sm line-clamp-2" style="color: var(--color-text-muted)">{{ card.message || 'Keine Nachricht' }}</p>
            <div class="flex items-center gap-2 text-xs" style="color: var(--color-text-muted)">
              <span class="inline-block w-2 h-2 rounded-full" :class="card.sent ? 'bg-green-500' : 'bg-amber-400'"></span>
              {{ card.sent ? 'Bereits verschickt' : 'Geplant / Entwurf' }}
            </div>
            <div class="text-xs" style="color: var(--color-text-muted)" v-if="!card.sent">
              <span v-if="card.scheduled_time">Geplant für {{ formatDate(card.scheduled_time) }}</span>
              <span v-else>Sofort senden</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <ShareLinkModal
      :is-open="showShareModal"
      :link="activeShareLink"
      @close="closeShareModal"
      @go-to-gallery="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyPostcards, type PostcardRecord, buildShareLink } from './backend'
import ShareLinkModal from './components/ShareLinkModal.vue'
import Button from './components/Button.vue'
import GalleryPostcardPreview from './components/GalleryPostcardPreview.vue'

const router = useRouter()
const postcards = ref<PostcardRecord[]>([])
const loading = ref(true)
const showShareModal = ref(false)
const activeShareLink = ref('')

onMounted(async () => {
  try {
    const result = await getMyPostcards()
    postcards.value = result.items
  } catch (error) {
    console.error('Failed to load postcards:', error)
  } finally {
    loading.value = false
  }
})

const openShare = (card: PostcardRecord) => {
  const link = buildShareLink(card)
  if (!link) return
  activeShareLink.value = link
  showShareModal.value = true
}

const getCardAspectRatio = (card: PostcardRecord) => {
  const isLandscape =
    typeof card.is_landscape === 'boolean'
      ? card.is_landscape
      : typeof card.is_vertical === 'boolean'
        ? !card.is_vertical
        : true

  return isLandscape ? '3/2' : '2/3'
}

const closeShareModal = () => {
  showShareModal.value = false
}

const formatDate = (value?: string) => {
  if (!value) return ''
  try {
    const d = new Date(value) // stored in UTC; Date will handle offset; display in user locale
    return d.toLocaleString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return value
  }
}
</script>
