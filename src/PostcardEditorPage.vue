<template>
  <div class="flex h-screen w-screen overflow-hidden" style="background-color: var(--color-bg)">
    <!-- Left Sidebar -->
    <aside
      class="flex w-24 flex-col items-center pt-20 pb-8 shadow-sm z-20 overflow-y-auto"
      style="background-color: var(--color-sidebar-bg); border-right: 1px solid var(--color-border)"
    >
      <div class="flex flex-col gap-6 w-full px-4">
        <!-- Orientation -->
        <Button
          variant="ghost"
          iconOnly
          @click="toggleOrientation"
          :aria-label="isVertical ? 'Zu Querformat wechseln' : 'Zu Hochformat wechseln'"
          class="w-full rounded-md"
          style="--hover-bg: var(--color-sidebar-hover)"
          @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
        >
          <template #icon>
            <span class="material-icons text-xl" style="color: var(--color-icon)">{{
              isVertical ? 'crop_portrait' : 'crop_landscape'
            }}</span>
          </template>
        </Button>

        <div class="h-px w-full" style="background-color: var(--color-divider)"></div>

        <!-- Tools -->
        <Button
          variant="ghost"
          iconOnly
          @click="onAddText"
          aria-label="Text hinzufügen"
          class="w-full rounded-md"
          style="--hover-bg: var(--color-sidebar-hover)"
          @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
        >
          <template #icon
            ><span class="material-icons text-xl" style="color: var(--color-icon)">title</span></template
          >
        </Button>

        <Button
          variant="ghost"
          iconOnly
          @click="onAddSticker"
          aria-label="Sticker hinzufügen"
          class="w-full rounded-md"
          style="--hover-bg: var(--color-sidebar-hover)"
          @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
        >
          <template #icon
            ><span class="material-icons text-3xl" style="color: var(--color-icon)"
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
          class="w-full"
          style="--hover-bg: var(--color-sidebar-hover)"
          @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
        >
          <template #icon
            ><span class="material-icons text-3xl" style="color: var(--color-icon)">palette</span></template
          >
        </Button>

        <Button
          v-if="isFront"
          variant="ghost"
          iconOnly
          @click="onMorePhotos"
          aria-label="Foto hinzufügen"
          class="w-full rounded-md"
          style="--hover-bg: var(--color-sidebar-hover)"
          @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
        >
          <template #icon
            ><span class="material-icons text-3xl" style="color: var(--color-icon)"
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
          class="w-full rounded-md"
          style="--hover-bg: var(--color-sidebar-hover)"
          @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
        >
          <template #icon>
            <span
              class="material-icons text-3xl transform transition-transform duration-500"
              :class="{ 'rotate-180': !isFront }"
              style="color: var(--color-icon)"
            >
              flip_camera_android
            </span>
          </template>
        </Button>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      class="flex flex-1 items-center justify-center overflow-hidden pt-20 px-8 pb-8 relative"
      style="background-color: var(--color-bg)"
    >
      <!-- Postcard Preview with Flip Animation -->
      <div class="perspective-1000 relative flex items-center gap-8">
        <div
          :class="['relative transition-all duration-700 transform-style-3d']"
          :style="{
            transform: isFront ? 'rotateY(0deg)' : 'rotateY(180deg)',
            aspectRatio: isVertical ? '2/3' : '3/2',
            width: isVertical ? 'min(500px, calc(100vw - 12rem))' : 'min(750px, calc(100vw - 12rem))',
            maxHeight: 'calc(100vh - 12rem)',
          }"
        >
          <!-- Front Face -->
          <div
            class="card-face card-face-front absolute inset-0 shadow-2xl"
            :style="{ 'backface-visibility': 'hidden', 'pointer-events': isFront ? 'auto' : 'none', 'background-color': 'var(--color-card-bg)', 'z-index': isFront ? 2 : 1 }"
          >
            <div
              class="flex items-center justify-center h-full w-full overflow-hidden relative"
              style="background-color: var(--color-card-bg)"
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
                <span class="material-icons text-6xl" style="color: var(--color-icon-light)"
                  >add_photo_alternate</span
                >
                <p class="font-light" style="color: var(--color-placeholder)">Füge eine Mediadatei hinzu</p>
              </div>

              <!-- Draggable Elements Layer (Front) -->
              <div class="absolute inset-0 z-20 overflow-hidden">
                <div
                  v-for="element in postcard.elements.filter((e) => e.side === 'front')"
                  :key="element.id"
                  class="absolute cursor-move select-none p-2 border-2"
                  :class="
                    activeElementId === element.id
                      ? 'border-[var(--color-highlight)]'
                      : 'border-transparent'
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
                    class="absolute -bottom-2 -right-2 w-5 h-5 rounded-full cursor-se-resize z-40 shadow-sm"
                    style="background-color: var(--color-card-bg); border: 1px solid var(--color-border-dark)"
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
                    class="absolute z-30 shadow-lg rounded p-1 flex gap-1 items-center"
                    style="background-color: var(--color-modal-bg); border: 1px solid var(--color-border)"
                    :style="{
                      left: `${postcard.elements.find((e) => e.id === activeElementId)?.x || 0}px`,
                      top: `${(postcard.elements.find((e) => e.id === activeElementId)?.y || 0) - 50}px`,
                    }"
                  >
                    <button
                      @click="onChangeFont"
                      class="p-1 rounded font-serif text-sm"
                      style="color: var(--color-font)"
                      @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
                    >
                      Aa
                    </button>
                    <button
                      @click="toggleBold"
                      class="p-1 rounded font-bold text-sm"
                      style="color: var(--color-font)"
                      @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
                    >
                      B
                    </button>
                    <button
                      @click="toggleItalic"
                      class="p-1 rounded italic text-sm"
                      style="color: var(--color-font)"
                      @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
                      @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
                    >
                      I
                    </button>

                    <!-- Font Size Controls -->
                    <div class="flex items-center gap-1 border-l pl-2">
                      <button
                        @click="decreaseFontSize"
                        class="p-1 rounded text-sm"
                        title="Schriftgröße verkleinern"
                        style="color: var(--color-font)"
                        @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
                        @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
                      >
                        <span class="material-icons" style="font-size: 14px">remove</span>
                      </button>
                      <input
                        type="number"
                        :value="postcard.elements.find((e) => e.id === activeElementId)?.fontSize || 24"
                        @input="updateFontSize"
                        min="8"
                        max="200"
                        class="w-10 text-center rounded px-0.5 py-0.5 text-xs"
                        style="border: 1px solid var(--color-border-light); background-color: var(--color-card-bg); color: var(--color-font)"
                      />
                      <button
                        @click="increaseFontSize"
                        class="p-1 rounded text-sm"
                        title="Schriftgröße vergrößern"
                        style="color: var(--color-font)"
                        @mouseenter="($event.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-sidebar-hover)'"
                        @mouseleave="($event.currentTarget as HTMLElement).style.backgroundColor = 'transparent'"
                      >
                        <span class="material-icons" style="font-size: 14px">add</span>
                      </button>
                    </div>

                    <input
                      type="color"
                      :value="
                        postcard.elements.find((e) => e.id === activeElementId)?.color ||
                        '#000000'
                      "
                      @input="updateColor"
                      class="w-6 h-6 cursor-pointer border-none p-0 rounded overflow-hidden"
                    />
                    <button
                      @click="deleteElement(activeElementId!)"
                      class="text-red-500 hover:bg-red-50 rounded p-1"
                    >
                      <span class="material-icons" style="font-size: 16px">delete</span>
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
          </div>

          <!-- Back Face -->
          <div
            class="card-face card-face-back absolute inset-0 shadow-2xl"
            :style="{ 'backface-visibility': 'hidden', 'transform': 'rotateY(180deg)', 'pointer-events': isFront ? 'none' : 'auto', 'background-color': 'var(--color-card-bg)', 'z-index': isFront ? 1 : 2 }"
          >
            <!-- Draggable Elements Layer (Back) -->
            <div class="absolute inset-0 z-20 overflow-hidden pointer-events-none">
              <div
                v-for="element in postcard.elements.filter((e) => e.side === 'back')"
                :key="element.id"
                class="absolute cursor-move select-none p-2 border-2 pointer-events-auto"
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
                  class="absolute z-30 bg-white shadow-lg rounded p-1 flex gap-1 items-center border border-gray-200"
                  :style="{
                    left: `${postcard.elements.find((e) => e.id === activeElementId)?.x || 0}px`,
                    top: `${(postcard.elements.find((e) => e.id === activeElementId)?.y || 0) - 50}px`,
                  }"
                >
                  <button
                    @click="onChangeFont"
                    class="p-1 hover:bg-gray-100 rounded font-serif text-sm"
                  >
                    Aa
                  </button>
                  <button
                    @click="toggleBold"
                    class="p-1 hover:bg-gray-100 rounded font-bold text-sm"
                  >
                    B
                  </button>
                  <button
                    @click="toggleItalic"
                    class="p-1 hover:bg-gray-100 rounded italic text-sm"
                  >
                    I
                  </button>

                  <!-- Font Size Controls -->
                  <div class="flex items-center gap-1 border-l pl-2">
                    <button
                      @click="decreaseFontSize"
                      class="p-1 hover:bg-gray-100 rounded text-sm"
                      title="Schriftgröße verkleinern"
                    >
                      <span class="material-icons" style="font-size: 14px">remove</span>
                    </button>
                    <input
                      type="number"
                      :value="postcard.elements.find((e) => e.id === activeElementId)?.fontSize || 24"
                      @input="updateFontSize"
                      min="8"
                      max="200"
                      class="w-10 text-center border border-gray-300 rounded px-0.5 py-0.5 text-xs"
                    />
                    <button
                      @click="increaseFontSize"
                      class="p-1 hover:bg-gray-100 rounded text-sm"
                      title="Schriftgröße vergrößern"
                    >
                      <span class="material-icons" style="font-size: 14px">add</span>
                    </button>
                  </div>

                  <input
                    type="color"
                    :value="
                      postcard.elements.find((e) => e.id === activeElementId)?.color ||
                      '#000000'
                    "
                    @input="updateColor"
                    class="w-6 h-6 cursor-pointer border-none p-0 rounded overflow-hidden"
                  />
                  <button
                    @click="deleteElement(activeElementId!)"
                    class="text-red-500 hover:bg-red-50 rounded p-1"
                  >
                    <span class="material-icons" style="font-size: 16px">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Vertical Layout: Message top, fields bottom -->
            <template v-if="isVertical">
              <!-- Message Area (Full Width) -->
              <div
                class="absolute left-8 right-8 top-8 bottom-32 pointer-events-auto flex flex-col"
              >
                <label class="text-xs mb-2 font-medium" style="color: var(--color-text-muted)">Deine Nachricht</label>
                <textarea
                  v-model="postcard.message"
                  class="flex-1 backdrop-blur-sm text-base px-3 py-2 rounded-md focus:outline-none focus:border-[var(--color-highlight)] focus:ring-1 focus:ring-[var(--color-highlight)] resize-none"
                  style="border: 1px solid var(--color-border-light); background-color: color-mix(in srgb, var(--color-card-bg) 80%, transparent); color: var(--color-font)"
                  :style="{ '--placeholder-color': 'var(--color-placeholder)' }"
                  placeholder="Schreibe deine Nachricht hier..."
                ></textarea>
              </div>

              <!-- Sender & Recipient Info (Bottom) removed; handled via save modal -->
            </template>

            <!-- Horizontal Layout: Message left, fields right -->
            <template v-else>
              <!-- Left Side: Message Area -->
              <div
                class="absolute left-8 top-8 bottom-24 w-[45%] pointer-events-auto flex flex-col"
              >
                <label class="text-xs mb-2 font-medium" style="color: var(--color-text-muted)">Deine Nachricht</label>
                <textarea
                  v-model="postcard.message"
                  class="flex-1 backdrop-blur-sm text-base px-3 py-2 rounded-md focus:outline-none focus:border-[var(--color-highlight)] focus:ring-1 focus:ring-[var(--color-highlight)] resize-none"
                  style="border: 1px solid var(--color-border-light); background-color: color-mix(in srgb, var(--color-card-bg) 80%, transparent); color: var(--color-font)"
                  placeholder="Schreibe deine Nachricht hier..."
                ></textarea>
              </div>

              <!-- Contact fields removed; handled via save modal -->
            </template>

            <!-- Audio Recorder at Bottom -->
            <div class="absolute left-8 bottom-8 z-20 pointer-events-auto">
              <AudioRecorder
                v-model:audioUrl="postcard.audioUrl"
                @update:audioBlob="postcard.audioBlob = $event"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Finish Button - Bottom Right Corner -->
      <Button
        variant="primary"
        @click="onFinish"
        class="absolute bottom-8 right-8 rounded-lg px-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
      >
        <template #icon>
          <span class="material-icons text-2xl">check_circle</span>
        </template>
        <span class="font-bold text-lg" style="color: var(--color-bg)">Senden</span>
      </Button>
    </main>

      <!-- Onboarding Overlay -->
      <div
        v-if="showOnboarding"
        class="fixed inset-0 z-[60] flex items-center justify-center p-6"
        style="background-color: var(--color-modal-overlay)"
        @click="dismissOnboarding"
      >
        <div
          class="rounded-xl p-8 max-w-md text-center shadow-2xl transform transition-all scale-100"
          style="background-color: var(--color-modal-bg)"
        >
          <div class="mb-4 text-4xl">✨</div>
          <h2 class="text-2xl font-bold mb-2" style="color: var(--color-font)">
            Willkommen im Postkarten-Editor!
          </h2>
          <p class="mb-6" style="color: var(--color-text-muted)">
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
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        style="background-color: var(--color-modal-overlay)"
        @click.self="showMoodGallery = false"
      >
        <div
          class="rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          style="background-color: var(--color-modal-bg)"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Wähle eine Stimmung</h2>
            <button
              @click="showMoodGallery = false"
              class="hover:opacity-70"
              style="color: var(--color-text-muted)"
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
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background-color: var(--color-modal-overlay)"
        @click.self="showEmojiPicker = false"
      >
        <div class="rounded-lg shadow-xl" style="background-color: var(--color-modal-bg)">
          <EmojiPicker :native="true" @select="onSelectEmoji" />
        </div>
      </div>


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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from './components/Button.vue'
import AudioRecorder from './components/AudioRecorder.vue'
import SavePostcardModal from './components/SavePostcardModal.vue'
import ShareLinkModal from './components/ShareLinkModal.vue'
import { createPostcard, buildShareLink } from './backend'
import { toast } from 'vue-sonner'

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
const fileInput = ref<HTMLInputElement | null>(null)
const extraFileInput = ref<HTMLInputElement | null>(null)
const showMoodGallery = ref(false)
const showEmojiPicker = ref(false)
const showOnboarding = ref(false)
const showSaveModal = ref(false)
const isSaving = ref(false)
const shareLink = ref('')
const showShareModal = ref(false)

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

const isFront = ref(true)
const isVertical = ref(true)

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
      postcard.value.frontImage = e.target?.result as string
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
        postcard.value.frontImage = e.target?.result as string
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
  isFront.value = !isFront.value
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

const updateFontSize = (e: Event) => {
  const el = postcard.value.elements.find((e) => e.id === activeElementId.value)
  if (el && el.type === 'text') {
    const newSize = parseInt((e.target as HTMLInputElement).value)
    if (newSize >= 8 && newSize <= 200) {
      el.fontSize = newSize
    }
  }
}

const increaseFontSize = () => {
  const el = postcard.value.elements.find((e) => e.id === activeElementId.value)
  if (el && el.type === 'text') {
    const currentSize = el.fontSize || 24
    el.fontSize = Math.min(200, currentSize + 2)
  }
}

const decreaseFontSize = () => {
  const el = postcard.value.elements.find((e) => e.id === activeElementId.value)
  if (el && el.type === 'text') {
    const currentSize = el.fontSize || 24
    el.fontSize = Math.max(8, currentSize - 2)
  }
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
  activeElementId.value = null
  isFront.value = !isFront.value
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
  showSaveModal.value = true
}

const onSavePostcard = async (data: { sent: boolean; scheduledTime?: string; recipientEmail: string }) => {
  // Allow saving without front image if it's just a text card or if user wants to save draft
  // But if the backend requires it, we might need a placeholder or check.
  // The user said "i currently get the error that i shoudl add an image first".
  // The backend schema says front_image is required: true.
  // So we MUST have an image.
  // However, maybe the user thinks they added one?
  // Or maybe we should allow saving drafts without images?
  // The user said "make sure to double chekc how our editor is tsrtcured and make the right assertions."

  if (!postcard.value.frontImage) {
    // If no image is selected, we can't save to backend as per schema.
    // But maybe we can use a default background?
    // For now, let's keep the check but make it clearer or check if there are other elements.
    // Actually, looking at the schema: required: true.
    toast.error('Bitte füge ein Hintergrundbild für die Vorderseite hinzu.')
    return
  }

  isSaving.value = true
  try {
    // Convert base64 image to blob
    const response = await fetch(postcard.value.frontImage)
    const blob = await response.blob()

    const created = await createPostcard({
      frontImageBlob: blob,
      audioBlob: postcard.value.audioBlob,
      message: postcard.value.message,
      elements: postcard.value.elements,
      isPublic: true, // Default to public for now or add a toggle
      sent: data.sent,
      scheduledTime: data.scheduledTime,
      recipientEmail: data.recipientEmail
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

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-3d {
  transform-style: preserve-3d;
}
</style>
