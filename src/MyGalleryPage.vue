<template>
  <div class="h-full w-full" style="background-color: var(--color-bg)">
    <main class="pt-24 px-6 pb-16 max-w-6xl mx-auto">
      <div
        v-if="!loading && postcards.length > 0"
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
      >
        <div class="flex gap-1 p-1" style="background-color: var(--color-card-bg)">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="px-4 py-2 text-sm font-medium transition-all"
            :class="
              activeFilter === filter.value
                ? 'bg-white shadow-sm'
                : 'hover:bg-white/50'
            "
            :style="{ color: activeFilter === filter.value ? 'var(--color-primary)' : 'var(--color-text-muted)' }"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
            <span
              v-if="filter.count > 0"
              class="ml-1.5 text-xs opacity-60"
            >({{ filter.count }})</span>
          </button>
        </div>

        <button
          class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors hover:bg-black/5"
          style="color: var(--color-text-muted)"
          @click="toggleSort"
        >
          <span class="material-icons text-base">swap_vert</span>
          {{ sortNewestFirst ? 'Neueste zuerst' : 'Älteste zuerst' }}
        </button>
      </div>

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

      <div
        v-if="filteredPostcards.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 items-start"
      >
        <PolaroidCard
          v-for="card in filteredPostcards"
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

      <div
        v-if="!loading && postcards.length > 0 && filteredPostcards.length === 0"
        class="flex flex-col items-center justify-center h-48 text-center"
      >
        <span class="material-icons text-4xl mb-3" style="color: var(--color-text-muted)">filter_list_off</span>
        <p style="color: var(--color-text-muted)">
          Keine {{ activeFilter === 'sent' ? 'gesendeten' : '' }}{{ activeFilter === 'draft' ? 'Entwürfe' : '' }} Postkarten gefunden.
        </p>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyPostcards, type PostcardRecord, buildShareLink } from './backend'
import { getCanvasAspectRatio, getRecordCanvasSize } from './postcard/canvas'
import ShareLinkModal from './components/ShareLinkModal.vue'
import Button from './components/Button.vue'
import GalleryPostcardPreview from './components/GalleryPostcardPreview.vue'
import ViewPostcardModal from './components/ViewPostcardModal.vue'
import PolaroidCard from './components/PolaroidCard.vue'

type FilterValue = 'all' | 'draft' | 'sent'

const router = useRouter()
const postcards = ref<PostcardRecord[]>([])
const loading = ref(true)
const showShareModal = ref(false)
const activeShareLink = ref('')
const viewingPostcard = ref<PostcardRecord | null>(null)

const activeFilter = ref<FilterValue>('all')
const sortNewestFirst = ref(true)

const filters = computed(() => [
  { value: 'all' as FilterValue, label: 'Alle', count: postcards.value.length },
  { value: 'draft' as FilterValue, label: 'Entwürfe', count: postcards.value.filter(p => !p.sent).length },
  { value: 'sent' as FilterValue, label: 'Gesendet', count: postcards.value.filter(p => p.sent).length },
])

const filteredPostcards = computed(() => {
  let result = [...postcards.value]

  if (activeFilter.value === 'draft') {
    result = result.filter(p => !p.sent)
  } else if (activeFilter.value === 'sent') {
    result = result.filter(p => p.sent)
  }

  result.sort((a, b) => {
    const dateA = new Date(a.scheduled_time || a.created).getTime()
    const dateB = new Date(b.scheduled_time || b.created).getTime()
    return sortNewestFirst.value ? dateB - dateA : dateA - dateB
  })

  return result
})

const toggleSort = () => {
  sortNewestFirst.value = !sortNewestFirst.value
}

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
    const d = new Date(value)
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
