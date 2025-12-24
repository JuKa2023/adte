export type CanvasSize = {
  width: number
  height: number
}

const LANDSCAPE_CANVAS: CanvasSize = { width: 900, height: 600 }
const PORTRAIT_CANVAS: CanvasSize = { width: 600, height: 900 }

export type OrientationRecord = {
  is_landscape?: boolean
  is_vertical?: boolean
  canvas_width?: number
  canvas_height?: number
}

export const getCanvasSize = (isLandscape: boolean): CanvasSize => {
  return isLandscape ? { ...LANDSCAPE_CANVAS } : { ...PORTRAIT_CANVAS }
}

export const getRecordOrientation = (record: OrientationRecord): boolean => {
  if (typeof record.is_landscape === 'boolean') return record.is_landscape
  if (typeof record.is_vertical === 'boolean') return !record.is_vertical
  return true
}

export const getRecordCanvasSize = (record: OrientationRecord): CanvasSize => {
  if (record.canvas_width && record.canvas_height) {
    return { width: record.canvas_width, height: record.canvas_height }
  }
  return getCanvasSize(getRecordOrientation(record))
}

export const getCanvasAspectRatio = (size: CanvasSize): string => {
  return `${size.width} / ${size.height}`
}
