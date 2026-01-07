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
        v-model:theme-id="postcard.themeId"
        :location="postcard.location"
        @update:audio-blob="postcard.audioBlob = $event"
        @update:location="postcard.location = $event"
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
        <span>Senden</span>
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

    <EmojiPickerModal
      :is-open="showEmojiPicker"
      @close="showEmojiPicker = false"
      @select="onSelectEmoji"
    />

    <SavePostcardModal
      :is-open="showSaveModal"
      :is-loading="isSaving"
      @close="showSaveModal = false"
      @save="onSavePostcard"
    />

    <ShareLinkModal :is-open="showShareModal" :link="shareLink" @close="closeShareModal" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { buildShareLink, createPostcard } from './backend'
import { getCanvasSize } from './postcard/canvas'
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
  themeId?: string
  location?: { city: string; weather: string }
}

const router = useRouter()

const postcard = ref<PostcardState>({
  frontImage: null,
  elements: [],
  message: '',
  audioBlob: null,
  audioUrl: null,
  themeId: 'classic',
  // location is undefined initially
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

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = ''
}

onMounted(() => {
  const seen = localStorage.getItem('postcard_onboarding_seen')
  if (!seen) showOnboarding.value = true
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const dismissOnboarding = () => {
  showOnboarding.value = false
  localStorage.setItem('postcard_onboarding_seen', 'true')
}

const closeShareModal = () => {
  showShareModal.value = false
  router.push('/gallery')
}

const moodImagePool = [
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2592&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2070&auto=format&fit=crop',
]

const moodImages = ref<string[]>([])

const shuffleMoodImages = () => {
  const shuffled = [...moodImagePool].sort(() => 0.5 - Math.random())
  moodImages.value = shuffled.slice(0, 6)
}

watch(showMoodGallery, (isOpen) => {
  if (isOpen) {
    shuffleMoodImages()
  }
})

// Initialize with a random set
shuffleMoodImages()

const selectMood = (img: string) => {
  postcard.value.frontImage = img
  showMoodGallery.value = false
}

const onSelectEmoji = (emoji: { i: string }) => {
  if (!isFront.value) return
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
  const fromSize = getCanvasSize(isLandscape.value)
  const toSize = getCanvasSize(!isLandscape.value)
  const scaleX = toSize.width / fromSize.width
  const scaleY = toSize.height / fromSize.height
  const fromShortSide = Math.min(fromSize.width, fromSize.height)
  const toShortSide = Math.min(toSize.width, toSize.height)
  const fontScale = toShortSide / fromShortSide

  postcard.value.elements.forEach((element) => {
    element.x *= scaleX
    element.y *= scaleY

    if (element.width) {
      element.width *= scaleX
    }
    if (element.height) {
      element.height *= scaleY
    }
    if (element.fontSize) {
      element.fontSize = Math.max(12, Math.min(400, element.fontSize * fontScale))
    }

    if (element.width) {
      element.x = Math.min(Math.max(0, element.x), toSize.width - element.width)
    } else {
      element.x = Math.min(Math.max(0, element.x), toSize.width)
    }

    if (element.height) {
      element.y = Math.min(Math.max(0, element.y), toSize.height - element.height)
    } else {
      element.y = Math.min(Math.max(0, element.y), toSize.height)
    }
  })

  isLandscape.value = !isLandscape.value
}

const onAddText = () => {
  if (!isFront.value) return
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
  const element = postcard.value.elements.find((e) => e.id === id)
  if (element?.type === 'image' && element.content.startsWith('blob:')) {
    URL.revokeObjectURL(element.content)
    elementImageFiles.delete(id)
  }
  postcard.value.elements = postcard.value.elements.filter((e) => e.id !== id)
  if (activeElementId.value === id) activeElementId.value = null
}

const onMorePhotos = () => {
  extraFileInput.value?.click()
}

const elementImageFiles = new Map<string, File>()

const onExtraFileSelected = (event: Event) => {
  if (!isFront.value) return
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !file.type.startsWith('image/')) {
    target.value = ''
    return
  }

  const elementId = crypto.randomUUID()
  elementImageFiles.set(elementId, file)
  const objectUrl = URL.createObjectURL(file)

  const newElement: PostcardElement = {
    id: elementId,
    type: 'image',
    content: objectUrl,
    x: 100,
    y: 100,
    width: 300,
    height: 300,
    side: isFront.value ? 'front' : 'back',
  }
  postcard.value.elements.push(newElement)
  activeElementId.value = newElement.id
  target.value = ''
}

const onClearPostcard = () => {
  if (
    !confirm(
      'Möchtest du wirklich alles zurücksetzen? Alle nicht gespeicherten Änderungen gehen verloren.',
    )
  ) {
    return
  }

  postcard.value.elements.forEach((element) => {
    if (element.type === 'image' && element.content.startsWith('blob:')) {
      URL.revokeObjectURL(element.content)
    }
  })
  elementImageFiles.clear()

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

const onSavePostcard = async (data: {
  sent: boolean
  scheduledTime?: string
  recipientEmail: string
}) => {
  if (!postcard.value.frontImage) {
    toast.error('Bitte füge ein Hintergrundbild für die Vorderseite hinzu.')
    return
  }

  isSaving.value = true
  try {
    const response = await fetch(postcard.value.frontImage)
    const blob = await response.blob()

    const canvasSize = getCanvasSize(isLandscape.value)

    const frontElements = postcard.value.elements.filter((element) => element.side === 'front')

    const created = await createPostcard({
      frontImageBlob: blob,
      audioBlob: postcard.value.audioBlob,
      message: postcard.value.message,
      elements: frontElements,
      elementImageFiles,
      isPublic: true,
      sent: data.sent,
      scheduledTime: data.scheduledTime,
      recipientEmail: data.recipientEmail,
      isLandscape: isLandscape.value,
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height,
      themeId: postcard.value.themeId,
      location: postcard.value.location ? JSON.stringify(postcard.value.location) : undefined,
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
  } catch (error) {
    console.error('Error saving postcard:', error)
    const message =
      (error as { message?: string })?.message || 'Fehler beim Speichern der Postkarte.'
    toast.error(message)
  } finally {
    isSaving.value = false
  }
}
</script>
