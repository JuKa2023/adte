<template>
  <div class="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-[var(--color-bg)]">
    <PostcardEditorSidebar
      :is-front="isFront"
      :is-landscape="isLandscape"
      @clear="onClearPostcard"
      @toggle-orientation="toggleOrientation"
      @add-text="onAddText"
      @add-sticker="showEmojiPicker = true"
      @open-mood-templates="showMoodGallery = true"
      @add-photo="onMorePhotos"
      @toggle-side="toggleSide"
    />

    <main
      class="flex flex-1 items-center justify-center overflow-hidden pt-20 px-4 md:px-8 pb-2 md:pb-8 relative order-1 md:order-2 bg-[var(--color-bg)]"
    >
      <PostcardCard
        :is-front="isFront"
        :is-landscape="isLandscape"
        :elements="postcard.elements"
        v-model:front-image="postcard.frontImage"
        v-model:active-element-id="activeElementId"
        v-model:message="postcard.message"
        v-model:audio-url="postcard.audioUrl"
        @update:audio-blob="postcard.audioBlob = $event"
        @delete-element="deleteElement"
      />

      <Button
        variant="primary"
        @click="onFinish"
        class="absolute bottom-2 right-4 md:bottom-8 md:right-8 rounded-lg px-4 py-2 md:px-6 md:py-3 shadow-lg hover:shadow-xl transition-shadow"
      >
        <template #icon>
          <span class="material-icons text-2xl">check_circle</span>
        </template>
        <span class="font-bold text-lg text-[var(--color-bg)]">Senden</span>
      </Button>
    </main>

    <input
      type="file"
      ref="extraFileInput"
      class="hidden"
      accept="image/*"
      @change="onExtraFileSelected"
    />

    <OnboardingOverlay :is-open="showOnboarding" @dismiss="dismissOnboarding" />

    <MoodGalleryModal
      :is-open="showMoodGallery"
      :mood-images="moodImages"
      @close="showMoodGallery = false"
      @select="selectMood"
    />

    <EmojiPickerModal :is-open="showEmojiPicker" @close="showEmojiPicker = false" @select="onSelectEmoji" />

    <SavePostcardModal
      :is-open="showSaveModal"
      :is-loading="isSaving"
      @close="showSaveModal = false"
      @save="onSavePostcard"
    />

    <ShareLinkModal
      :is-open="showShareModal"
      :link="shareLink"
      @close="closeShareModal"
      @go-to-gallery="goToGallery"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { buildShareLink, createPostcard } from './backend'
import type { PostcardElement } from './backend'
import Button from './components/Button.vue'
import SavePostcardModal from './components/SavePostcardModal.vue'
import ShareLinkModal from './components/ShareLinkModal.vue'
import EmojiPickerModal from './components/postcard-editor/EmojiPickerModal.vue'
import MoodGalleryModal from './components/postcard-editor/MoodGalleryModal.vue'
import OnboardingOverlay from './components/postcard-editor/OnboardingOverlay.vue'
import PostcardCard from './components/postcard-editor/PostcardCard.vue'
import PostcardEditorSidebar from './components/postcard-editor/PostcardEditorSidebar.vue'

interface PostcardState {
  frontImage: string | null
  elements: PostcardElement[]
  message: string
  audioBlob: Blob | null
  audioUrl: string | null
}

const router = useRouter()

const postcard = ref<PostcardState>({
  frontImage: null,
  elements: [],
  message: '',
  audioBlob: null,
  audioUrl: null,
})

const activeElementId = ref<string | null>(null)
const extraFileInput = ref<HTMLInputElement | null>(null)

const showMoodGallery = ref(false)
const showEmojiPicker = ref(false)
const showOnboarding = ref(false)
const showSaveModal = ref(false)
const isSaving = ref(false)
const shareLink = ref('')
const showShareModal = ref(false)

const isFront = ref(true)
const isLandscape = ref(true)

onMounted(() => {
  const seen = localStorage.getItem('postcard_onboarding_seen')
  if (!seen) showOnboarding.value = true
})

const dismissOnboarding = () => {
  showOnboarding.value = false
  localStorage.setItem('postcard_onboarding_seen', 'true')
}

const closeShareModal = () => {
  showShareModal.value = false
}

const goToGallery = () => {
  showShareModal.value = false
  router.push('/gallery')
}

const moodImages = [
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2592&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519681393798-3828fb4090bb?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
]

const selectMood = (img: string) => {
  postcard.value.frontImage = img
  showMoodGallery.value = false
}

const onSelectEmoji = (emoji: any) => {
  const newElement: PostcardElement = {
    id: crypto.randomUUID(),
    type: 'sticker',
    content: emoji.i,
    x: 100,
    y: 100,
    fontSize: 64,
    side: isFront.value ? 'front' : 'back',
  }

  postcard.value.elements.push(newElement)
  activeElementId.value = newElement.id
  showEmojiPicker.value = false
}

const toggleSide = () => {
  activeElementId.value = null
  isFront.value = !isFront.value
}

const toggleOrientation = () => {
  isLandscape.value = !isLandscape.value
}

const onAddText = () => {
  const newElement: PostcardElement = {
    id: crypto.randomUUID(),
    type: 'text',
    content: 'Neuer Text',
    x: 50,
    y: 50,
    fontSize: 24,
    color: '#000000',
    fontWeight: 'normal',
    fontStyle: 'normal',
    side: isFront.value ? 'front' : 'back',
  }

  postcard.value.elements.push(newElement)
  activeElementId.value = newElement.id
}

const deleteElement = (id: string) => {
  postcard.value.elements = postcard.value.elements.filter((e) => e.id !== id)
  if (activeElementId.value === id) activeElementId.value = null
}

const onMorePhotos = () => {
  extraFileInput.value?.click()
}

const onExtraFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !file.type.startsWith('image/')) {
    target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const newElement: PostcardElement = {
      id: crypto.randomUUID(),
      type: 'image',
      content: e.target?.result as string,
      x: 100,
      y: 100,
      width: 300,
      height: 300,
      side: isFront.value ? 'front' : 'back',
    }
    postcard.value.elements.push(newElement)
    activeElementId.value = newElement.id
  }
  reader.readAsDataURL(file)
  target.value = ''
}

const onClearPostcard = () => {
  if (!confirm('Möchtest du wirklich alles zurücksetzen? Alle nicht gespeicherten Änderungen gehen verloren.')) {
    return
  }

  postcard.value = {
    frontImage: null,
    elements: [],
    message: '',
    audioBlob: null,
    audioUrl: null,
  }
  activeElementId.value = null
  toast.success('Postkarte wurde zurückgesetzt.')
}

const onFinish = () => {
  showSaveModal.value = true
}

const onSavePostcard = async (data: { sent: boolean; scheduledTime?: string; recipientEmail: string }) => {
  if (!postcard.value.frontImage) {
    toast.error('Bitte füge ein Hintergrundbild für die Vorderseite hinzu.')
    return
  }

  isSaving.value = true
  try {
    const response = await fetch(postcard.value.frontImage)
    const blob = await response.blob()

    const created = await createPostcard({
      frontImageBlob: blob,
      audioBlob: postcard.value.audioBlob,
      message: postcard.value.message,
      elements: postcard.value.elements,
      isPublic: true,
      sent: data.sent,
      scheduledTime: data.scheduledTime,
      recipientEmail: data.recipientEmail,
      isLandscape: isLandscape.value,
    })

    showSaveModal.value = false
    const link = buildShareLink(created)
    toast.success('Postkarte erfolgreich gespeichert!')

    if (link) {
      shareLink.value = link
      showShareModal.value = true
    } else {
      router.push('/gallery')
    }
  } catch (error: any) {
    console.error('Error saving postcard:', error)
    const message = error?.message || 'Fehler beim Speichern der Postkarte.'
    toast.error(message)
  } finally {
    isSaving.value = false
  }
}
</script>
