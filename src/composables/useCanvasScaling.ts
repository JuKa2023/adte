import { ref, watch, onMounted, onUnmounted, type Ref } from 'vue'

interface ScalingOptions {
  maxScale?: number
  padding?: number
}

export function useCanvasScaling(
  containerRef: Ref<HTMLElement | null>,
  canvasWidth: Ref<number>,
  canvasHeight: Ref<number>,
  options: ScalingOptions = {},
) {
  const scale = ref(1)
  let resizeObserver: ResizeObserver | null = null

  const updateScale = () => {
    if (!containerRef.value) return

    const { clientWidth, clientHeight } = containerRef.value
    if (!clientWidth || !clientHeight) return

    const padding = options.padding ?? 0
    const availableW = Math.max(0, clientWidth - padding)
    const availableH = Math.max(0, clientHeight - padding)

    const scaleX = availableW / canvasWidth.value
    const scaleY = availableH / canvasHeight.value
    let nextScale = Math.min(scaleX, scaleY)

    if (options.maxScale !== undefined) {
      nextScale = Math.min(nextScale, options.maxScale)
    }

    scale.value = Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1
  }

  const getScale = () => {
    if (!containerRef.value) return 1
    const rect = containerRef.value.getBoundingClientRect()
    const scaleX = rect.width / canvasWidth.value
    const scaleY = rect.height / canvasHeight.value
    const result = Math.min(scaleX, scaleY)
    return Number.isFinite(result) && result > 0 ? result : 1
  }

  onMounted(() => {
    if (!containerRef.value) return
    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateScale)
    })
    resizeObserver.observe(containerRef.value)
    updateScale()
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
  })

  watch([canvasWidth, canvasHeight], updateScale)

  return { scale, updateScale, getScale }
}
