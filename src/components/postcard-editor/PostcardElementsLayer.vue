<template>
  <div
    ref="layerEl"
    class="absolute inset-0 overflow-visible"
    @click.self="emit('update:activeElementId', null)"
  >
    <div
      v-for="element in elementsForSide"
      :key="element.id"
      class="absolute p-2 border-2"
      :class="[
        activeElementId === element.id ? 'border-[var(--color-highlight)]' : inactiveBorderClass,
        interactive ? 'cursor-move pointer-events-auto select-none touch-none' : 'pointer-events-none',
      ]"
      :style="elementStyle(element)"
      @pointerdown.stop="interactive && startDrag($event, element)"
      @click.stop="interactive && emit('update:activeElementId', element.id)"
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
        :style="{ fontSize: `${element.fontSize || 64}px` }"
      >
        {{ element.content }}
      </span>

      <img
        v-else-if="element.type === 'image'"
        :src="element.content"
        class="w-full h-full object-cover rounded-md pointer-events-none"
        alt=""
      />

      <button
        v-if="activeElementId === element.id"
        class="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md"
        @pointerdown.stop
        @click.stop="emit('delete-element', element.id)"
        aria-label="Element löschen"
      >
        ✕
      </button>

      <div
        v-if="activeElementId === element.id"
        class="absolute -bottom-2 -right-2 w-5 h-5 rounded-full cursor-se-resize z-40 shadow-sm"
        style="background-color: var(--color-card-bg); border: 1px solid var(--color-border-dark)"
        @pointerdown.stop="startResize($event, element)"
        aria-label="Grösse ändern"
      ></div>

      <div
        v-if="activeElementId === element.id && element.type === 'text'"
        class="absolute left-0 shadow-lg rounded p-1 flex gap-1 items-center whitespace-nowrap"
        style="
          background-color: var(--color-modal-bg);
          border: 1px solid var(--color-border);
          z-index: 50;
        "
        :style="{ top: element.y > 60 ? '-52px' : 'calc(100% + 4px)' }"
        @pointerdown.stop
        @click.stop
      >
        <button
          @click.stop="cycleFont(element)"
          class="p-1 rounded font-serif text-sm text-[var(--color-font)] hover:bg-[var(--color-sidebar-hover)] transition-colors"
          aria-label="Schriftart wechseln"
        >
          Aa
        </button>

        <button
          @click.stop="toggleBold(element)"
          class="p-1 rounded font-bold text-sm text-[var(--color-font)] hover:bg-[var(--color-sidebar-hover)] transition-colors"
          aria-label="Fett"
        >
          B
        </button>

        <button
          @click.stop="toggleItalic(element)"
          class="p-1 rounded italic text-sm text-[var(--color-font)] hover:bg-[var(--color-sidebar-hover)] transition-colors"
          aria-label="Kursiv"
        >
          I
        </button>

        <div class="flex items-center gap-1 border-l pl-2 border-[var(--color-border)]">
          <button
            @click.stop="adjustFontSize(element, -2)"
            class="p-1 rounded text-sm text-[var(--color-font)] hover:bg-[var(--color-sidebar-hover)] transition-colors"
            title="Schriftgrösse verkleinern"
            aria-label="Schriftgrösse verkleinern"
          >
            <span class="material-icons" style="font-size: 14px">remove</span>
          </button>

          <input
            type="number"
            :value="element.fontSize || 24"
            @input="setFontSize($event, element)"
            @pointerdown.stop
            @click.stop
            min="8"
            max="200"
            class="w-10 text-center rounded px-0.5 py-0.5 text-xs"
            style="
              border: 1px solid var(--color-border-light);
              background-color: var(--color-card-bg);
              color: var(--color-font);
            "
            aria-label="Schriftgrösse"
          />

          <button
            @click.stop="adjustFontSize(element, 2)"
            class="p-1 rounded text-sm text-[var(--color-font)] hover:bg-[var(--color-sidebar-hover)] transition-colors"
            title="Schriftgrösse vergrössern"
            aria-label="Schriftgrösse vergrössern"
          >
            <span class="material-icons" style="font-size: 14px">add</span>
          </button>
        </div>

        <input
          type="color"
          :value="element.color || '#000000'"
          @input="setColor($event, element)"
          @pointerdown.stop
          @click.stop
          class="w-6 h-6 cursor-pointer border-none p-0 rounded overflow-hidden"
          aria-label="Textfarbe"
        />

        <button
          @click.stop="emit('delete-element', element.id)"
          class="text-red-500 hover:bg-red-50 rounded p-1 transition-colors"
          aria-label="Element löschen"
        >
          <span class="material-icons" style="font-size: 16px">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import type { PostcardElement } from '../../backend'

const props = withDefaults(
  defineProps<{
    elements: PostcardElement[]
    side: 'front' | 'back'
    activeElementId: string | null
    interactive?: boolean
    canvasWidth: number
    canvasHeight: number
  }>(),
  {
    interactive: true,
  },
)

const emit = defineEmits<{
  (e: 'update:activeElementId', id: string | null): void
  (e: 'delete-element', id: string): void
}>()

const layerEl = ref<HTMLDivElement | null>(null)

const elementsForSide = computed(() => props.elements.filter((e) => e.side === props.side))

const inactiveBorderClass = computed(() =>
  props.side === 'back' ? 'border-transparent hover:border-gray-300' : 'border-transparent',
)

const elementStyle = (element: PostcardElement) => ({
  left: `${element.x}px`,
  top: `${element.y}px`,
  fontFamily: element.fontFamily,
  fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
  color: element.color,
  fontWeight: element.fontWeight,
  fontStyle: element.fontStyle,
  width: element.width ? `${element.width}px` : undefined,
  height: element.height ? `${element.height}px` : undefined,
})

const getScale = () => {
  if (!layerEl.value) return 1
  const rect = layerEl.value.getBoundingClientRect()
  const scaleX = rect.width / props.canvasWidth
  const scaleY = rect.height / props.canvasHeight
  const scale = Math.min(scaleX, scaleY)
  return Number.isFinite(scale) && scale > 0 ? scale : 1
}

const updateText = (event: Event, element: PostcardElement) => {
  const target = event.target as HTMLElement | null
  if (!target) return
  element.content = target.innerText
}

const cycleFont = (element: PostcardElement) => {
  if (element.type !== 'text') return
  const fonts = ['Roboto', 'Inconsolata', 'serif', 'cursive']
  const currentIdx = fonts.indexOf(element.fontFamily || 'Roboto')
  element.fontFamily = fonts[(currentIdx + 1) % fonts.length]
}

const toggleBold = (element: PostcardElement) => {
  if (element.type !== 'text') return
  element.fontWeight = element.fontWeight === 'bold' ? 'normal' : 'bold'
}

const toggleItalic = (element: PostcardElement) => {
  if (element.type !== 'text') return
  element.fontStyle = element.fontStyle === 'italic' ? 'normal' : 'italic'
}

const setColor = (event: Event, element: PostcardElement) => {
  if (element.type !== 'text') return
  element.color = (event.target as HTMLInputElement).value
}

const setFontSize = (event: Event, element: PostcardElement) => {
  if (element.type !== 'text') return
  const value = parseInt((event.target as HTMLInputElement).value, 10)
  if (Number.isNaN(value)) return
  element.fontSize = Math.max(8, Math.min(200, value))
}

const adjustFontSize = (element: PostcardElement, delta: number) => {
  if (element.type !== 'text') return
  const currentSize = element.fontSize || 24
  element.fontSize = Math.max(8, Math.min(200, currentSize + delta))
}

type DragState = {
  element: PostcardElement
  containerRect: DOMRect
  pointerOffsetX: number
  pointerOffsetY: number
  elementWidth: number
  elementHeight: number
  scale: number
  pointerId: number
}

let dragState: DragState | null = null

const isPrimaryPointer = (event: PointerEvent) =>
  event.isPrimary && (event.pointerType !== 'mouse' || event.button === 0)

const startDrag = (event: PointerEvent, element: PostcardElement) => {
  if (!layerEl.value) return
  if (!isPrimaryPointer(event)) return
  const containerRect = layerEl.value.getBoundingClientRect()
  const targetRect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const scale = getScale()

  dragState = {
    element,
    containerRect,
    pointerOffsetX: (event.clientX - targetRect.left) / scale,
    pointerOffsetY: (event.clientY - targetRect.top) / scale,
    elementWidth: targetRect.width / scale,
    elementHeight: targetRect.height / scale,
    scale,
    pointerId: event.pointerId,
  }

  emit('update:activeElementId', element.id)

  window.addEventListener('pointermove', onDrag)
  window.addEventListener('pointerup', stopDrag)
  window.addEventListener('pointercancel', stopDrag)
}

const onDrag = (event: PointerEvent) => {
  if (!dragState || event.pointerId !== dragState.pointerId) return
  const {
    element,
    containerRect,
    pointerOffsetX,
    pointerOffsetY,
    elementWidth,
    elementHeight,
    scale,
  } = dragState
  const maxX = Math.max(0, props.canvasWidth - elementWidth)
  const maxY = Math.max(0, props.canvasHeight - elementHeight)

  const newX = Math.max(
    0,
    Math.min((event.clientX - containerRect.left) / scale - pointerOffsetX, maxX),
  )
  const newY = Math.max(
    0,
    Math.min((event.clientY - containerRect.top) / scale - pointerOffsetY, maxY),
  )

  element.x = newX
  element.y = newY
}

const stopDrag = (event?: PointerEvent) => {
  if (event && dragState && event.pointerId !== dragState.pointerId) return
  dragState = null
  window.removeEventListener('pointermove', onDrag)
  window.removeEventListener('pointerup', stopDrag)
  window.removeEventListener('pointercancel', stopDrag)
}

type ResizeState = {
  element: PostcardElement
  startX: number
  startY: number
  startWidth: number
  startHeight: number
  startFontSize: number
  scale: number
  pointerId: number
}

let resizeState: ResizeState | null = null

const startResize = (event: PointerEvent, element: PostcardElement) => {
  if (!isPrimaryPointer(event)) return
  const scale = getScale()

  resizeState = {
    element,
    startX: event.clientX,
    startY: event.clientY,
    startWidth: element.width || 150,
    startHeight: element.height || 150,
    startFontSize: element.fontSize || (element.type === 'sticker' ? 64 : 24),
    scale,
    pointerId: event.pointerId,
  }

  emit('update:activeElementId', element.id)

  window.addEventListener('pointermove', onResize)
  window.addEventListener('pointerup', stopResize)
  window.addEventListener('pointercancel', stopResize)
}

const onResize = (event: PointerEvent) => {
  if (!resizeState || event.pointerId !== resizeState.pointerId) return
  const { element, startX, startY, startWidth, startHeight, startFontSize, scale } = resizeState
  const dx = (event.clientX - startX) / scale
  const dy = (event.clientY - startY) / scale

  if (element.type === 'image') {
    const maxWidth = Math.max(50, props.canvasWidth - element.x)
    const maxHeight = Math.max(50, props.canvasHeight - element.y)
    element.width = Math.max(50, Math.min(startWidth + dx, maxWidth))
    element.height = Math.max(50, Math.min(startHeight + dy, maxHeight))
    return
  }

  const delta = (dx + dy) / 2
  const newSize = Math.max(12, Math.min(400, startFontSize + delta))
  element.fontSize = newSize
}

const stopResize = (event?: PointerEvent) => {
  if (event && resizeState && event.pointerId !== resizeState.pointerId) return
  resizeState = null
  window.removeEventListener('pointermove', onResize)
  window.removeEventListener('pointerup', stopResize)
  window.removeEventListener('pointercancel', stopResize)
}

onUnmounted(() => {
  stopDrag()
  stopResize()
})
</script>
