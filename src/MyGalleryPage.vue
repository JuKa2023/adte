<template>
  <div class="h-full w-full" style="background-color: var(--color-bg)">
    <main class="pt-24 px-6 pb-16 max-w-6xl mx-auto">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <span class="material-icons animate-spin text-4xl" style="color: var(--color-primary)"
          >refresh</span
        >
      </div>

      <div
        v-else-if="postcards.length === 0"
        class="flex flex-col items-center justify-center h-64 text-center"
      >
        <span class="material-icons text-6xl mb-4" style="color: var(--color-text-muted)"
          >collections</span
        >
        <h3 class="text-xl font-medium mb-2" style="color: var(--color-font)">
          Noch keine Postkarten
        </h3>
        <p class="mb-6" style="color: var(--color-text-muted)">
          Erstelle deine erste Postkarte und speichere sie hier.
        </p>
        <Button @click="router.push('/create')"> Jetzt erstellen </Button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 items-start">
        <PolaroidCard
          v-for="card in postcards"
          :key="card.id"
          class="h-full"
          @click="openViewModal(card)"
        >
          <template #image>
            <div class="w-full h-full relative" :style="{ aspectRatio: getCardAspectRatio(card) }">
              <GalleryPostcardPreview :postcard="card" />
            </div>
          </template>

          <template #overlay>
            <div
              class="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60"
            ></div>

            <div class="absolute top-3 left-3">
              <span
                class="px-2 py-0.5 rounded-sm text-[10px] uppercase tracking-wider font-bold shadow-sm"
                :class="
                  card.sent ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                "
              >
                {{ card.sent ? 'Gesendet' : 'Entwurf' }}
              </span>
            </div>

            <div
              class="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <button
                class="p-2 rounded-full bg-white/90 text-gray-700 shadow-sm hover:bg-white transition-colors"
                title="Share"
                @click.stop="openShare(card)"
              >
                <span class="material-icons text-sm">share</span>
              </button>
            </div>
          </template>

          <template #caption>
            <div class="flex flex-col gap-1 text-left px-1">
              <p class="font-handwriting text-lg !text-gray-900 truncate">
                {{ card.recipient_email || 'No Recipient' }}
              </p>
              <p class="text-xs !text-gray-500 font-mono mt-1">
                {{ card.sent ? 'Gesendet am ' : 'Geplant für ' }}
                {{ card.scheduled_time ? formatDate(card.scheduled_time) : 'Sofort' }}
              </p>
            </div>
          </template>
        </PolaroidCard>
      </div>
    </main>

    <ShareLinkModal :is-open="showShareModal" :link="activeShareLink" @close="closeShareModal" />

    <ViewPostcardModal
      :is-open="!!viewingPostcard"
      :postcard="viewingPostcard"
      @close="closeViewModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyPostcards, type PostcardRecord, buildShareLink } from './backend'
import { getCanvasAspectRatio, getRecordCanvasSize } from './postcard/canvas'
import ShareLinkModal from './components/ShareLinkModal.vue'
import Button from './components/Button.vue'
import GalleryPostcardPreview from './components/GalleryPostcardPreview.vue'
import ViewPostcardModal from './components/ViewPostcardModal.vue'
import PolaroidCard from './components/PolaroidCard.vue'

const router = useRouter()
const postcards = ref<PostcardRecord[]>([])
const loading = ref(true)
const showShareModal = ref(false)
const activeShareLink = ref('')
const viewingPostcard = ref<PostcardRecord | null>(null)

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

const openViewModal = (card: PostcardRecord) => {
  viewingPostcard.value = card
}

const closeViewModal = () => {
  viewingPostcard.value = null
}

const getCardAspectRatio = (card: PostcardRecord) => {
  return getCanvasAspectRatio(getRecordCanvasSize(card))
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
