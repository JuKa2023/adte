<template>
  <div class="">
    <div class="">
      <!-- Header -->
      <!-- Header -->
      <article class="px-6 pt-6 pb-3">
        <div class="flex items-center gap-1 text-[var(--color-highlight)] mb-4 cursor-pointer">
            <span class="material-icons text-sm">chevron_right</span>
            <span class="text-sm font-medium">Startseite</span>
        </div>
        <h1 class="text-lg font-normal text-gray-900 truncate">
          Füge passende Elemente zu deiner<br>
          Postkarte hinzu und platziere diese.
        </h1>
      </article>

      <main class="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center">
        <!-- Orientation Toggle -->
        <div v-if="isFront" class="mb-6">
          <Button type="button" variant="ghost" @click="toggleOrientation">
            <span v-if="isVertical">Querformat</span>
            <span v-else>Hochformat</span>
          </Button>
        </div>

        <!-- Postcard Preview with Flip Animation -->
        <section class="mb-8 perspective-1000 w-full flex justify-center">
          <div
            :class="['relative transition-all duration-500 transform-style-3d']"
            :style="{
              transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }"
          >
            <div
              :class="[
                'bg-[var(--color-dropin-field)] shadow-sm flex items-center justify-center relative mx-auto transition-all duration-300',
                isVertical ? 'w-64 h-96' : 'w-96 h-64'
              ]"
              style="backface-visibility: hidden"
            >
              <div class="text-center text-sm text-gray-500 w-full h-full relative">
                <!-- Front Side -->
                <template v-if="isFront">
                    <div 
                      class="flex items-center justify-center h-full w-full overflow-hidden relative"
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
                        <div v-else class="flex flex-col items-center gap-2 z-10 pointer-events-none">
                           <span class="material-icons text-4xl text-gray-400">add_photo_alternate</span>
                           <p class="text-gray-800">Füge eine Mediadatei hinzu</p>
                        </div>
                        
                        <!-- Draggable Elements Layer -->
                        <div class="absolute inset-0 z-20 overflow-hidden">
                             <div
                                v-for="element in postcard.elements.filter(e => e.side === 'front')"
                                :key="element.id"
                                class="absolute cursor-move select-none p-2 border-2"
                                :class="activeElementId === element.id ? 'border-[var(--color-highlight)]' : 'border-transparent hover:border-gray-300'"
                                :style="{
                                    left: `${element.x}px`,
                                    top: `${element.y}px`,
                                    fontFamily: element.fontFamily,
                                    fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
                                    color: element.color,
                                    fontWeight: element.fontWeight,
                                    fontStyle: element.fontStyle,
                                    width: element.width ? `${element.width}px` : undefined,
                                    height: element.height ? `${element.height}px` : undefined
                                }"
                                @mousedown.stop="startDrag($event, element)"
                                @click.stop="selectElement(element.id)"
                             >
                                <span v-if="element.type === 'text'" contenteditable @blur="updateText($event, element)" class="outline-none min-w-[20px] inline-block">
                                    {{ element.content }}
                                </span>
                                <span v-else-if="element.type === 'sticker'" :style="{ fontSize: element.fontSize ? `${element.fontSize}px` : '4rem' }">
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
                                    class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    @click.stop="deleteElement(element.id)"
                                >
                                    ✕
                                </button>
                                
                                <!-- Resize Handle (for all types) -->
                                <div
                                   v-if="activeElementId === element.id"
                                   class="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-se-resize z-40"
                                   @mousedown.stop="startResize($event, element)"
                                ></div>
                             
                             <!-- Floating Toolbar for Active Text Element -->
                             <div 
                                v-if="activeElementId && postcard.elements.find(e => e.id === activeElementId)?.type === 'text' && activeElementId === element.id"
                                class="absolute z-30 bg-white shadow-lg rounded-lg p-2 flex gap-2 items-center"
                                :style="{
                                    left: `${(postcard.elements.find(e => e.id === activeElementId)?.x || 0)}px`,
                                    top: `${(postcard.elements.find(e => e.id === activeElementId)?.y || 0) - 50}px`
                                }"
                             >
                                <button @click="onChangeFont" class="p-1 hover:bg-gray-100 rounded font-serif text-lg">Aa</button>
                                <button @click="toggleBold" class="p-1 hover:bg-gray-100 rounded font-bold">B</button>
                                <button @click="toggleItalic" class="p-1 hover:bg-gray-100 rounded italic">I</button>
                                <input type="color" :value="postcard.elements.find(e => e.id === activeElementId)?.color || '#000000'" @input="updateColor" class="w-6 h-6 cursor-pointer border-none p-0" />
                                <button @click="deleteElement(activeElementId!)" class="text-red-500 hover:bg-red-50 rounded p-1">
                                    <span class="material-icons text-sm">delete</span>
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
                                v-for="element in postcard.elements.filter(e => e.side === 'back')"
                                :key="element.id"
                                class="absolute cursor-move select-none p-2 border-2"
                                :class="activeElementId === element.id ? 'border-[var(--color-highlight)]' : 'border-transparent hover:border-gray-300'"
                                :style="{
                                    left: `${element.x}px`,
                                    top: `${element.y}px`,
                                    fontFamily: element.fontFamily,
                                    fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
                                    color: element.color,
                                    fontWeight: element.fontWeight,
                                    fontStyle: element.fontStyle,
                                    width: element.width ? `${element.width}px` : undefined,
                                    height: element.height ? `${element.height}px` : undefined
                                }"
                                @mousedown.stop="startDrag($event, element)"
                                @click.stop="selectElement(element.id)"
                             >
                                <span v-if="element.type === 'text'" contenteditable @blur="updateText($event, element)" class="outline-none min-w-[20px] inline-block">
                                    {{ element.content }}
                                </span>
                                <span v-else-if="element.type === 'sticker'" :style="{ fontSize: element.fontSize ? `${element.fontSize}px` : '4rem' }">
                                    {{ element.content }}
                                </span>
                                <img 
                                    v-else-if="element.type === 'image'" 
                                    :src="element.content" 
                                    class="w-full h-full object-cover rounded-md pointer-events-none" 
                                />
                                
                                <button 
                                    v-if="activeElementId === element.id"
                                    class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                    @click.stop="deleteElement(element.id)"
                                >
                                    ✕
                                </button>
                                
                                <!-- Resize Handle (for all types) -->
                                <div
                                   v-if="activeElementId === element.id"
                                   class="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-gray-400 rounded-full cursor-se-resize z-40"
                                   @mousedown.stop="startResize($event, element)"
                                ></div>
                             <!-- Floating Toolbar for Active Text Element (Back) -->
                              <div 
                                v-if="activeElementId && postcard.elements.find(e => e.id === activeElementId)?.type === 'text' && activeElementId === element.id"
                                class="absolute z-30 bg-white shadow-lg rounded-lg p-2 flex gap-2 items-center"
                                :style="{
                                    left: `${(postcard.elements.find(e => e.id === activeElementId)?.x || 0)}px`,
                                    top: `${(postcard.elements.find(e => e.id === activeElementId)?.y || 0) - 50}px`
                                }"
                              >
                                <button @click="onChangeFont" class="p-1 hover:bg-gray-100 rounded font-serif text-lg">Aa</button>
                                <button @click="toggleBold" class="p-1 hover:bg-gray-100 rounded font-bold">B</button>
                                <button @click="toggleItalic" class="p-1 hover:bg-gray-100 rounded italic">I</button>
                                <input type="color" :value="postcard.elements.find(e => e.id === activeElementId)?.color || '#000000'" @input="updateColor" class="w-6 h-6 cursor-pointer border-none p-0" />
                                <button @click="deleteElement(activeElementId!)" class="text-red-500 hover:bg-red-50 rounded p-1">
                                    <span class="material-icons text-sm">delete</span>
                                </button>
                             </div>
                             </div>
                       </div>
                   </div>

                  <div class="absolute right-4 bottom-20 flex flex-col gap-2 items-end w-48">
                    <input 
                        v-for="(line, index) in 4" 
                        :key="index"
                        v-model="postcard.addressLines[index]"
                        class="w-full border-b border-gray-400 bg-transparent text-sm px-1 focus:outline-none focus:border-[var(--color-highlight)]"
                        :placeholder="index === 0 ? 'Name' : 'Adresse'"
                    />
                  </div>
                  
                  <div class="absolute left-4 bottom-4 flex flex-col gap-2">
                      <div class="flex items-center gap-2">
                          <button 
                            type="button"
                            class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                            :class="isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
                            @click="toggleRecording"
                          >
                              <span class="material-icons">{{ isRecording ? 'stop' : (postcard.audioUrl ? 'mic_none' : 'mic') }}</span>
                          </button>
                          
                          <button 
                            v-if="postcard.audioUrl && !isRecording"
                            type="button"
                            class="w-10 h-10 rounded-full bg-[var(--color-highlight)] text-white flex items-center justify-center hover:opacity-90"
                            @click="playAudio"
                          >
                              <span class="material-icons">play_arrow</span>
                          </button>
                      </div>
                      <span class="text-xs text-gray-500 ml-1">
                        {{ isRecording ? 'Aufnahme läuft...' : (postcard.audioUrl ? 'Nachricht aufgenommen' : 'Nachricht aufnehmen') }}
                      </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- Action Buttons -->
        <section class="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
          <Button variant="primaryIconTop" @click="onAddText">
            <template #icon><span class="material-icons">edit</span></template>
            Text
          </Button>
          <Button variant="primaryIconTop" @click="onAddSticker">
            <template #icon><span class="material-icons">local_florist</span></template>
            Sticker
          </Button>
          <Button v-if="isFront" variant="primaryIconTop" @click="onOpenMoodTemplates">
             <template #icon><span class="material-icons">palette</span></template>
             Mood Vorlagen
          </Button>
          <Button v-if="isFront" variant="primaryIconTop" @click="onMorePhotos">
             <template #icon><span class="material-icons">add_a_photo</span></template>
             Weitere Fotos
          </Button>
        </section>

        <!-- Secondary Buttons -->
        <section v-if="isFront" class="flex justify-between gap-4 w-full max-w-md mb-8">
          <Button
            v-for="action in secondaryButtons"
            :key="action.label"
            type="button"
            :variant="action.variant"
            class="flex-1"
            @click="action.onClick"
          >
            {{ action.label }}
          </Button>
        </section>
      </main>

      <!-- Footer Actions -->
      <footer class="p-4 bg-white border-t flex justify-center">
        <Button variant="ghost" @click="toggleSide">
          <span class="material-icons mr-2">flip</span>
          {{ isFront ? 'Rückseite' : 'Vorderseite' }}
        </Button>
      </footer>
      
      <!-- Onboarding Overlay -->
      <div v-if="showOnboarding" class="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6" @click="dismissOnboarding">
        <div class="bg-white rounded-xl p-8 max-w-md text-center shadow-2xl transform transition-all scale-100">
            <div class="mb-4 text-4xl">✨</div>
            <h2 class="text-2xl font-bold mb-2 text-gray-900">Willkommen im Postkarten-Editor!</h2>
            <p class="text-gray-600 mb-6">
                Hier kannst du deine persönliche Postkarte gestalten.<br>
                Klicke auf Elemente, um sie zu bearbeiten, und ziehe sie an die gewünschte Position.
            </p>
            <Button variant="primary" @click="dismissOnboarding">Los geht's!</Button>
        </div>
      </div>

      <!-- Mood Gallery Modal -->
      <div v-if="showMoodGallery" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showMoodGallery = false">
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Wähle eine Stimmung</h2>
                <button @click="showMoodGallery = false" class="text-gray-500 hover:text-gray-700">✕</button>
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

      <!-- Emoji Picker Popover -->
      <div v-if="showEmojiPicker" class="fixed inset-0 z-50 flex items-center justify-center bg-black/20" @click.self="showEmojiPicker = false">
         <div class="bg-white rounded-lg shadow-xl">
             <EmojiPicker :native="true" @select="onSelectEmoji" />
         </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Button from './components/Button.vue'

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
  content: string // text content or sticker emoji/url or image data url
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
  audioUrl: null
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
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop'
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
      // postcard.value.frontImage = e.target?.result as string // OLD: Set as background
      
      // NEW: Add as image element
      const newElement: PostcardElement = {
        id: Date.now().toString(),
        type: 'image',
        content: e.target?.result as string,
        x: 0,
        y: 0,
        width: 300, // Default width
        height: 200, // Default height
        side: 'front' // Main upload is usually for front
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
                width: 300, // Default width
                height: 200, // Default height
                side: 'front' // Main upload is usually for front
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
    side: isFront.value ? 'front' : 'back'
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
    side: isFront.value ? 'front' : 'back'
  }
  postcard.value.elements.push(newElement)
  activeElementId.value = newElement.id
}

const onChangeFont = () => {
  if (!activeElementId.value) return
  const element = postcard.value.elements.find(e => e.id === activeElementId.value)
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
  postcard.value.elements = postcard.value.elements.filter(e => e.id !== id)
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
        y: event.clientY - element.y
    }
    
    window.addEventListener('mousemove', onDrag)
    window.addEventListener('mouseup', stopDrag)
}

const onDrag = (event: MouseEvent) => {
    if (!isDragging || !draggedElement) return
    
    const containerWidth = isVertical.value ? 256 : 384 // w-64 (16rem*16) or w-96 (24rem*16)
    const containerHeight = isVertical.value ? 384 : 256 // h-96 or h-64
    
    let newX = event.clientX - dragOffset.x
    let newY = event.clientY - dragOffset.y
    
    // Simple constraints (assuming element size approx 50px for now, could be better)
    // Ideally we'd use element.getBoundingClientRect() but we don't have direct ref access easily here without more setup
    // So we'll just clamp to container bounds with some padding
    newX = Math.max(0, Math.min(newX, containerWidth - 20))
    newY = Math.max(0, Math.min(newY, containerHeight - 20))
    
    draggedElement.x = newX
    draggedElement.y = newY
}

const toggleBold = () => {
    const el = postcard.value.elements.find(e => e.id === activeElementId.value)
    if (el) el.fontWeight = el.fontWeight === 'bold' ? 'normal' : 'bold'
}

const toggleItalic = () => {
    const el = postcard.value.elements.find(e => e.id === activeElementId.value)
    if (el) el.fontStyle = el.fontStyle === 'italic' ? 'normal' : 'italic'
}

const updateColor = (e: Event) => {
    const el = postcard.value.elements.find(e => e.id === activeElementId.value)
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
    // For simplicity, we'll just use dx to scale proportionally or just width for images
    // But let's try to be a bit smarter.
    
    if (resizingElement.type === 'image') {
        // Maintain aspect ratio if we had one, or just free resize? 
        // Let's do free resize for now or proportional based on max delta
        const dy = event.clientY - initialResizeY
        
        const newWidth = Math.max(50, initialWidth + dx)
        const newHeight = Math.max(50, initialHeight + dy)
        
        resizingElement.width = newWidth
        resizingElement.height = newHeight
    } else if (resizingElement.type === 'sticker' || resizingElement.type === 'text') {
        // For stickers and text, we scale font-size
        // We'll use the average delta to scale
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
    activeElementId.value = null // Clear selection on flip
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
        width: 150, // Initial width
        height: 150, // Initial height
        side: isFront.value ? 'front' : 'back'
      }
      postcard.value.elements.push(newElement)
      activeElementId.value = newElement.id
    }
    reader.readAsDataURL(target.files[0])
  }
  // Reset input
  target.value = ''
}

// Audio Recording
const isRecording = ref(false)
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data)
    }
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
      postcard.value.audioBlob = audioBlob
      postcard.value.audioUrl = URL.createObjectURL(audioBlob)
    }
    
    mediaRecorder.start()
    isRecording.value = true
  } catch (err) {
    console.error('Error accessing microphone:', err)
    alert('Mikrofonzugriff verweigert oder nicht verfügbar.')
  }
}

const stopRecording = () => {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop()
    isRecording.value = false
    mediaRecorder.stream.getTracks().forEach(track => track.stop())
  }
}

const playAudio = () => {
  if (postcard.value.audioUrl) {
    const audio = new Audio(postcard.value.audioUrl)
    audio.play()
  }
}

const onFinish = () => {
  console.log('Finish postcard', postcard.value)
  alert('Postkarte fertig! (Siehe Konsole für Daten)')
}

const secondaryButtons: SecondaryButton[] = [
  {
    label: 'Mood Vorlagen',
    variant: 'ghost',
    onClick: onOpenMoodTemplates,
  },
  {
    label: 'Weitere Fotos',
    variant: 'ghost',
    onClick: onMorePhotos,
  },
]
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
</style>
