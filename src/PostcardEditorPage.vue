<template>
  <div class="flex h-screen w-screen overflow-hidden bg-[#F5F5F5]">
    <!-- Left Sidebar -->
    <aside
      class="flex w-24 flex-col items-center border-r border-gray-200 bg-white pt-20 pb-8 shadow-sm z-20 overflow-y-auto"
    >
      <div class="flex flex-col gap-6 w-full px-4">
        <!-- Orientation -->
        <Button
          variant="ghost"
          iconOnly
          @click="toggleOrientation"
          :aria-label="isVertical ? 'Zu Querformat wechseln' : 'Zu Hochformat wechseln'"
          class="w-full hover:bg-gray-100 rounded-md"
        >
          <template #icon>
            <span class="material-icons text-xl text-gray-600">{{
              isVertical ? 'crop_portrait' : 'crop_landscape'
            }}</span>
          </template>
        </Button>

        <div class="h-px w-full bg-gray-200"></div>

        <!-- Tools -->
        <Button
          variant="ghost"
          iconOnly
          @click="onAddText"
          aria-label="Text hinzufügen"
          class="w-full hover:bg-gray-100 rounded-md"
        >
          <template #icon
            ><span class="material-icons text-xl text-gray-600">title</span></template
          >
        </Button>

        <Button
          variant="ghost"
          iconOnly
          @click="onAddSticker"
          aria-label="Sticker hinzufügen"
          class="w-full hover:bg-gray-100 rounded-md"
        >
          <template #icon
            ><span class="material-icons text-3xl text-gray-600"
              >emoji_emotions</span
            ></template
          >
        </Button>

        <Button
          v-if="isFront"
          variant="ghost"
          iconOnly
          @click="onOpenMoodTemplates"
          aria-label="Mood Vorlagen"
          class="w-full hover:bg-gray-100 rounded-md"
        >
          <template #icon
            ><span class="material-icons text-3xl text-gray-600">palette</span></template
          >
        </Button>

        <Button
          v-if="isFront"
          variant="ghost"
          iconOnly
          @click="onMorePhotos"
          aria-label="Foto hinzufügen"
          class="w-full hover:bg-gray-100 rounded-md"
        >
          <template #icon
            ><span class="material-icons text-3xl text-gray-600"
              >add_photo_alternate</span
            ></template
          >
        </Button>
      </div>

      <div class="mt-auto flex flex-col gap-4 w-full px-4">
        <Button
          variant="ghost"
          iconOnly
          @click="toggleSide"
          aria-label="Seite wechseln"
          class="w-full hover:bg-gray-100 rounded-md"
        >
          <template #icon>
            <span
              class="material-icons text-3xl text-gray-600 transform transition-transform duration-500"
              :class="{ 'rotate-180': !isFront }"
            >
              flip_camera_android
            </span>
          </template>
        </Button>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      class="flex flex-1 items-center justify-center overflow-hidden bg-[#F5F5F5] pt-20 px-8 pb-8 relative"
    >
      <!-- Postcard Preview with Flip Animation -->
      <div class="perspective-1000 relative">
        <div
          :class="['relative transition-all duration-500 transform-style-3d shadow-2xl']"
          :style="{
            transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
            width: isVertical ? '500px' : '750px',
            height: isVertical ? '750px' : '500px',
          }"
        >
          <div
            class="bg-[var(--color-dropin-field)] flex items-center justify-center relative mx-auto transition-all duration-300 w-full h-full bg-white"
            style="backface-visibility: hidden"
          >
            <div class="text-center text-sm text-gray-500 w-full h-full relative">
              <!-- Front Side -->
              <template v-if="isFront">
                <div
                  class="flex items-center justify-center h-full w-full overflow-hidden relative bg-white"
                  @drop.prevent="onDropFile"
                  @dragover.prevent
                  @click="triggerFileUpload"
                >
                  <img
                    v-if="postcard.frontImage"
                    :src="postcard.frontImage"
                    class="w-full h-full object-cover absolute inset-0 pointer-events-none"
                    alt="Postcard Front"
                  />
                  <div
                    v-else
                    class="flex flex-col items-center gap-2 z-10 pointer-events-none"
                  >
                    <span class="material-icons text-6xl text-gray-300"
                      >add_photo_alternate</span
                    >
                    <p class="text-gray-400 font-light">Füge eine Mediadatei hinzu</p>
                  </div>

                  <!-- Draggable Elements Layer -->
                  <div class="absolute inset-0 z-20 overflow-hidden">
                    <div
                      v-for="element in postcard.elements.filter((e) => e.side === 'front')"
                      :key="element.id"
                      class="absolute cursor-move select-none p-2 border-2"
                      :class="
                        activeElementId === element.id
                          ? 'border-[var(--color-highlight)]'
                          : 'border-transparent hover:border-gray-300'
                      "
                      :style="{
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        fontFamily: element.fontFamily,
                        fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        fontStyle: element.fontStyle,
                        width: element.width ? `${element.width}px` : undefined,
                        height: element.height ? `${element.height}px` : undefined,
                      }"
                      @mousedown.stop="startDrag($event, element)"
                      @click.stop="selectElement(element.id)"
                    >
                      <span
                        v-if="element.type === 'text'"
                        contenteditable
                        @blur="updateText($event, element)"
                        class="outline-none min-w-[20px] inline-block"
                      >
                        {{ element.content }}
                      </span>
                      <span
                        v-else-if="element.type === 'sticker'"
                        :style="{
                          fontSize: element.fontSize ? `${element.fontSize}px` : '4rem',
                        }"
                      >
                        {{ element.content }}
                      </span>
                      <img
                        v-else-if="element.type === 'image'"
                        :src="element.content"
                        class="w-full h-full object-cover rounded-md pointer-events-none"
                      />

                      <!-- Delete button for active element -->
                      <button
                        v-if="activeElementId === element.id"
                        class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md"
                        @click.stop="deleteElement(element.id)"
                      >
                        ✕
                      </button>

                      <!-- Resize Handle (for all types) -->
                      <div
                        v-if="activeElementId === element.id"
                        class="absolute -bottom-2 -right-2 w-5 h-5 bg-white border border-gray-400 rounded-full cursor-se-resize z-40 shadow-sm"
                        @mousedown.stop="startResize($event, element)"
                      ></div>

                      <!-- Floating Toolbar for Active Text Element -->
                      <div
                        v-if="
                          activeElementId &&
                          postcard.elements.find((e) => e.id === activeElementId)?.type ===
                            'text' &&
                          activeElementId === element.id
                        "
                        class="absolute z-30 bg-white shadow-xl rounded-lg p-2 flex gap-2 items-center border border-gray-100"
                        :style="{
                          left: `${postcard.elements.find((e) => e.id === activeElementId)?.x || 0}px`,
                          top: `${(postcard.elements.find((e) => e.id === activeElementId)?.y || 0) - 60}px`,
                        }"
                      >
                        <button
                          @click="onChangeFont"
                          class="p-2 hover:bg-gray-100 rounded font-serif text-lg"
                        >
                          Aa
                        </button>
                        <button
                          @click="toggleBold"
                          class="p-2 hover:bg-gray-100 rounded font-bold"
                        >
                          B
                        </button>
                        <button
                          @click="toggleItalic"
                          class="p-2 hover:bg-gray-100 rounded italic"
                        >
                          I
                        </button>
                        <input
                          type="color"
                          :value="
                            postcard.elements.find((e) => e.id === activeElementId)?.color ||
                            '#000000'
                          "
                          @input="updateColor"
                          class="w-8 h-8 cursor-pointer border-none p-0 rounded overflow-hidden"
                        />
                        <button
                          @click="deleteElement(activeElementId!)"
                          class="text-red-500 hover:bg-red-50 rounded p-2"
                        >
                          <span class="material-icons text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref="fileInput"
                    class="hidden"
                    accept="image/*"
                    @change="onFileSelected"
                  />
                  <input
                    type="file"
                    ref="extraFileInput"
                    class="hidden"
                    accept="image/*"
                    @change="onExtraFileSelected"
                  />
                </div>
              </template>

              <!-- Back Side -->
              <template v-else>
                <!-- Draggable Elements Layer (Back) -->
                <div class="absolute inset-0 z-20 overflow-hidden pointer-events-none">
                  <div class="pointer-events-auto w-full h-full relative">
                    <div
                      v-for="element in postcard.elements.filter((e) => e.side === 'back')"
                      :key="element.id"
                      class="absolute cursor-move select-none p-2 border-2"
                      :class="
                        activeElementId === element.id
                          ? 'border-[var(--color-highlight)]'
                          : 'border-transparent hover:border-gray-300'
                      "
                      :style="{
                        left: `${element.x}px`,
                        top: `${element.y}px`,
                        fontFamily: element.fontFamily,
                        fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
                        color: element.color,
                        fontWeight: element.fontWeight,
                        fontStyle: element.fontStyle,
                        width: element.width ? `${element.width}px` : undefined,
                        height: element.height ? `${element.height}px` : undefined,
                      }"
                      @mousedown.stop="startDrag($event, element)"
                      @click.stop="selectElement(element.id)"
                    >
                      <span
                        v-if="element.type === 'text'"
                        contenteditable
                        @blur="updateText($event, element)"
                        class="outline-none min-w-[20px] inline-block"
                      >
                        {{ element.content }}
                      </span>
                      <span
                        v-else-if="element.type === 'sticker'"
                        :style="{
                          fontSize: element.fontSize ? `${element.fontSize}px` : '4rem',
                        }"
                      >
                        {{ element.content }}
                      </span>
                      <img
                        v-else-if="element.type === 'image'"
                        :src="element.content"
                        class="w-full h-full object-cover rounded-md pointer-events-none"
                      />

                      <button
                        v-if="activeElementId === element.id"
                        class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md"
                        @click.stop="deleteElement(element.id)"
                      >
                        ✕
                      </button>

                      <!-- Resize Handle (for all types) -->
                      <div
                        v-if="activeElementId === element.id"
                        class="absolute -bottom-2 -right-2 w-5 h-5 bg-white border border-gray-400 rounded-full cursor-se-resize z-40 shadow-sm"
                        @mousedown.stop="startResize($event, element)"
                      ></div>
                      <!-- Floating Toolbar for Active Text Element (Back) -->
                      <div
                        v-if="
                          activeElementId &&
                          postcard.elements.find((e) => e.id === activeElementId)?.type ===
                            'text' &&
                          activeElementId === element.id
                        "
                        class="absolute z-30 bg-white shadow-xl rounded-lg p-2 flex gap-2 items-center border border-gray-100"
                        :style="{
                          left: `${postcard.elements.find((e) => e.id === activeElementId)?.x || 0}px`,
                          top: `${(postcard.elements.find((e) => e.id === activeElementId)?.y || 0) - 60}px`,
                        }"
                      >
                        <button
                          @click="onChangeFont"
                          class="p-2 hover:bg-gray-100 rounded font-serif text-lg"
                        >
                          Aa
                        </button>
                        <button
                          @click="toggleBold"
                          class="p-2 hover:bg-gray-100 rounded font-bold"
                        >
                          B
                        </button>
                        <button
                          @click="toggleItalic"
                          class="p-2 hover:bg-gray-100 rounded italic"
                        >
                          I
                        </button>
                        <input
                          type="color"
                          :value="
                            postcard.elements.find((e) => e.id === activeElementId)?.color ||
                            '#000000'
                          "
                          @input="updateColor"
                          class="w-8 h-8 cursor-pointer border-none p-0 rounded overflow-hidden"
                        />
                        <button
                          @click="deleteElement(activeElementId!)"
                          class="text-red-500 hover:bg-red-50 rounded p-2"
                        >
                          <span class="material-icons text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="absolute right-8 bottom-24 flex flex-col gap-3 items-end w-64 pointer-events-auto"
                >
                  <input
                    v-for="(line, index) in 4"
                    :key="index"
                    v-model="postcard.addressLines[index]"
                    class="w-full border-b border-gray-300 bg-transparent text-base px-2 py-1 focus:outline-none focus:border-[var(--color-highlight)] placeholder-gray-400"
                    :placeholder="index === 0 ? 'Name' : 'Adresse'"
                  />
                </div>

                <div class="absolute left-8 bottom-8 z-20 pointer-events-auto">
                  <AudioRecorder
                    v-model:audioUrl="postcard.audioUrl"
                    @update:audioBlob="postcard.audioBlob = $event"
                  />
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Onboarding Overlay -->
      <div
        v-if="showOnboarding"
        class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6"
        @click="dismissOnboarding"
      >
        <div
          class="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl transform transition-all scale-100"
        >
          <div class="mb-4 text-4xl">✨</div>
          <h2 class="text-2xl font-bold mb-2 text-gray-900">
            Willkommen im Postkarten-Editor!
          </h2>
          <p class="text-gray-600 mb-6">
            Hier kannst du deine persönliche Postkarte gestalten.<br />
            Klicke auf Elemente, um sie zu bearbeiten, und ziehe sie an die gewünschte
            Position.
          </p>
          <Button variant="primary" @click="dismissOnboarding">Los geht's!</Button>
        </div>
      </div>

      <!-- Mood Gallery Modal -->
      <div
        v-if="showMoodGallery"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        @click.self="showMoodGallery = false"
      >
        <div
          class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Wähle eine Stimmung</h2>
            <button
              @click="showMoodGallery = false"
              class="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              v-for="(img, idx) in moodImages"
              :key="idx"
              class="aspect-video rounded-md overflow-hidden hover:ring-2 ring-[var(--color-highlight)] transition-all"
              @click="selectMood(img)"
            >
              <img :src="img" class="w-full h-full object-cover" loading="lazy" />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showEmojiPicker"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
        @click.self="showEmojiPicker = false"
      >
        <div class="bg-white rounded-lg shadow-xl">
          <EmojiPicker :native="true" @select="onSelectEmoji" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from './components/Button.vue'
import AudioRecorder from './components/AudioRecorder.vue'

import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

type ButtonVariant = 'primary' | 'ghost' | 'primaryIconTop'
type SecondaryButton = {
  label: string
  variant: ButtonVariant
  onClick: () => void
}

interface PostcardElement {
  id: string
  type: 'text' | 'sticker' | 'image'
  content: string
  x: number
  y: number
  fontFamily?: string
  fontSize?: number
  rotation?: number
  color?: string
  fontWeight?: string
  fontStyle?: string
  width?: number
  height?: number
  side: 'front' | 'back'
}

interface PostcardState {
  frontImage: string | null
  elements: PostcardElement[]
  addressLines: string[]
  audioBlob: Blob | null
  audioUrl: string | null
}

const postcard = ref<PostcardState>({
  frontImage: null,
  elements: [],
  addressLines: ['', '', '', ''],
  audioBlob: null,
  audioUrl: null,
})

const activeElementId = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const extraFileInput = ref<HTMLInputElement | null>(null)
const showMoodGallery = ref(false)
const showEmojiPicker = ref(false)
const showOnboarding = ref(false)

onMounted(() => {
  const seen = localStorage.getItem('postcard_onboarding_seen')
  if (!seen) {
    showOnboarding.value = true
  }
})

const dismissOnboarding = () => {
  showOnboarding.value = false
  localStorage.setItem('postcard_onboarding_seen', 'true')
}

const moodImages = [
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=2592&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519681393798-3828fb4090bb?q=80&w=2070&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop',
]

const isFront = ref(true)
const isVertical = ref(true)
const isFlipping = ref(false)

const triggerFileUpload = () => {
  if (!postcard.value.frontImage) {
    fileInput.value?.click()
  }
}

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newElement: PostcardElement = {
        id: Date.now().toString(),
        type: 'image',
        content: e.target?.result as string,
        x: 0,
        y: 0,
        width: 400, // Default width
        height: 300, // Default height
        side: 'front', // Main upload is usually for front
      }
      postcard.value.elements.push(newElement)
      activeElementId.value = newElement.id
    }
    reader.readAsDataURL(target.files[0])
  }
}

const onDropFile = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    const file = files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        // postcard.value.frontImage = e.target?.result as string // OLD: Set as background

        // NEW: Add as image element
        const newElement: PostcardElement = {
          id: Date.now().toString(),
          type: 'image',
          content: e.target?.result as string,
          x: 0,
          y: 0,
          width: 400, // Default width
          height: 300, // Default height
          side: 'front', // Main upload is usually for front
        }
        postcard.value.elements.push(newElement)
        activeElementId.value = newElement.id
      }
      reader.readAsDataURL(file)
    }
  }
}

const onOpenMoodTemplates = () => {
  showMoodGallery.value = true
}

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
    fontSize: 64, // Initial size for emoji
    side: isFront.value ? 'front' : 'back',
  }
  postcard.value.elements.push(newElement)
  activeElementId.value = newElement.id
  showEmojiPicker.value = false
}

const toggleSide = () => {
  isFlipping.value = true
  setTimeout(() => {
    isFront.value = !isFront.value
    isFlipping.value = false
  }, 300)
}

const toggleOrientation = () => {
  isVertical.value = !isVertical.value
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

const onChangeFont = () => {
  if (!activeElementId.value) return
  const element = postcard.value.elements.find((e) => e.id === activeElementId.value)
  if (element && element.type === 'text') {
    // Cycle through fonts
    const fonts = ['Roboto', 'Inconsolata', 'serif', 'cursive']
    const currentIdx = fonts.indexOf(element.fontFamily || 'Roboto')
    element.fontFamily = fonts[(currentIdx + 1) % fonts.length]
  }
}

const onAddSticker = () => {
  showEmojiPicker.value = true
}

const selectElement = (id: string) => {
  activeElementId.value = id
}

const deleteElement = (id: string) => {
  postcard.value.elements = postcard.value.elements.filter((e) => e.id !== id)
  if (activeElementId.value === id) {
    activeElementId.value = null
  }
}

const updateText = (event: Event, element: PostcardElement) => {
  const target = event.target as HTMLElement
  element.content = target.innerText
}

// Drag Logic
let isDragging = false
let dragOffset = { x: 0, y: 0 }
let draggedElement: PostcardElement | null = null

const startDrag = (event: MouseEvent, element: PostcardElement) => {
  isDragging = true
  draggedElement = element
  activeElementId.value = element.id
  dragOffset = {
    x: event.clientX - element.x,
    y: event.clientY - element.y,
  }

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
}

const onDrag = (event: MouseEvent) => {
  if (!isDragging || !draggedElement) return

  const containerWidth = isVertical.value ? 500 : 750
  const containerHeight = isVertical.value ? 750 : 500

  let newX = event.clientX - dragOffset.x
  let newY = event.clientY - dragOffset.y

  newX = Math.max(0, Math.min(newX, containerWidth - 20))
  newY = Math.max(0, Math.min(newY, containerHeight - 20))

  draggedElement.x = newX
  draggedElement.y = newY
}

const toggleBold = () => {
  const el = postcard.value.elements.find((e) => e.id === activeElementId.value)
  if (el) el.fontWeight = el.fontWeight === 'bold' ? 'normal' : 'bold'
}

const toggleItalic = () => {
  const el = postcard.value.elements.find((e) => e.id === activeElementId.value)
  if (el) el.fontStyle = el.fontStyle === 'italic' ? 'normal' : 'italic'
}

const updateColor = (e: Event) => {
  const el = postcard.value.elements.find((e) => e.id === activeElementId.value)
  if (el) el.color = (e.target as HTMLInputElement).value
}

const stopDrag = () => {
  isDragging = false
  draggedElement = null
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

// Resize Logic
let isResizing = false
let initialResizeX = 0
let initialResizeY = 0
let initialWidth = 0
let initialHeight = 0
let initialFontSize = 0
let resizingElement: PostcardElement | null = null

const startResize = (event: MouseEvent, element: PostcardElement) => {
  isResizing = true
  resizingElement = element
  initialResizeX = event.clientX
  initialResizeY = event.clientY

  if (element.type === 'image') {
    initialWidth = element.width || 150
    initialHeight = element.height || 150
  } else if (element.type === 'sticker' || element.type === 'text') {
    initialFontSize = element.fontSize || (element.type === 'sticker' ? 64 : 24)
  }

  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopResize)
}

const onResize = (event: MouseEvent) => {
  if (!isResizing || !resizingElement) return

  const dx = event.clientX - initialResizeX

  if (resizingElement.type === 'image') {
    const dy = event.clientY - initialResizeY

    const newWidth = Math.max(50, initialWidth + dx)
    const newHeight = Math.max(50, initialHeight + dy)

    resizingElement.width = newWidth
    resizingElement.height = newHeight
  } else if (resizingElement.type === 'sticker' || resizingElement.type === 'text') {
    const delta = (dx + (event.clientY - initialResizeY)) / 2
    const newSize = Math.max(12, initialFontSize + delta)
    resizingElement.fontSize = newSize
  }
}

const stopResize = () => {
  isResizing = false
  resizingElement = null
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopResize)
}

const flipCard = () => {
  if (isFlipping.value) return
  isFlipping.value = true
  activeElementId.value = null
  setTimeout(() => {
    isFront.value = !isFront.value
    isFlipping.value = false
  }, 300)
}

const onMorePhotos = () => {
  extraFileInput.value?.click()
}

const onExtraFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const newElement: PostcardElement = {
        id: crypto.randomUUID(),
        type: 'image',
        content: e.target?.result as string,
        x: 100,
        y: 100,
        width: 300, // Initial width
        height: 300, // Initial height
        side: isFront.value ? 'front' : 'back',
      }
      postcard.value.elements.push(newElement)
      activeElementId.value = newElement.id
    }
    reader.readAsDataURL(target.files[0])
  }
  // Reset input
  target.value = ''
}

const onFinish = () => {
  console.log('Finish postcard', postcard.value)
  alert('Postkarte fertig! (Siehe Konsole für Daten)')
}
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
</style>
