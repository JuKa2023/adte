import PocketBase from 'pocketbase'

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || window.location.origin
export const pb = new PocketBase(pbUrl)

export interface PostcardElement {
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

export interface PostcardRecord {
  id: string
  collectionId: string
  collectionName: string
  created: string
  updated: string
  user?: string
  front_image: string
  audio?: string
  element_images?: string[]
  message: string
  elements: PostcardElement[]
  is_public: boolean
  share_token?: string
  sent: boolean
  scheduled_time?: string
  recipient_email?: string
  is_landscape?: boolean
  is_vertical?: boolean
  canvas_width?: number
  canvas_height?: number
  theme_id?: string
  location?: string
}

function processElementsForUpload(
  elements: PostcardElement[],
  elementImageFiles: Map<string, File> | undefined,
  formData: FormData,
): PostcardElement[] {
  const rawElements = toRaw(elements || [])
  const processedElements: PostcardElement[] = []
  let imageIndex = 0

  for (const element of rawElements) {
    if (element.type === 'image') {
      const file = elementImageFiles?.get(element.id)
      if (file) {
        const ext = file.type.split('/')[1] || 'png'
        formData.append('element_images', file, `element_${imageIndex}.${ext}`)
        processedElements.push({
          ...element,
          content: `element_image:${imageIndex}`,
        })
        imageIndex++
      } else {
        processedElements.push(element)
      }
    } else {
      processedElements.push(element)
    }
  }

  return processedElements
}

export async function createPostcard(data: {
  frontImageBlob: Blob
  audioBlob: Blob | null
  message: string
  elements: PostcardElement[]
  elementImageFiles?: Map<string, File>
  isPublic: boolean
  sent?: boolean
  scheduledTime?: string
  recipientEmail?: string
  isLandscape?: boolean
  canvasWidth?: number
  canvasHeight?: number
  themeId?: string
  location?: string
}) {
  const userId = pb.authStore.model?.id
  if (!userId) {
    throw new Error('User must be logged in to create a postcard.')
  }

  const formData = new FormData()
  formData.append('front_image', data.frontImageBlob)
  if (data.audioBlob) {
    formData.append('audio', data.audioBlob)
  }

  const processedElements = processElementsForUpload(
    data.elements,
    data.elementImageFiles,
    formData,
  )

  const shareToken = crypto.randomUUID()
  formData.append('message', data.message)
  formData.append('elements', JSON.stringify(processedElements))
  formData.append('is_public', data.isPublic ? 'true' : 'false')
  formData.append('share_token', shareToken)
  formData.append('sent', data.sent ? 'true' : 'false')
  if (data.scheduledTime) {
    formData.append('scheduled_time', data.scheduledTime)
  }
  if (data.recipientEmail) {
    formData.append('recipient_email', data.recipientEmail)
  }
  if (data.isLandscape !== undefined) {
    formData.append('is_landscape', data.isLandscape ? 'true' : 'false')
  }
  if (data.canvasWidth) {
    formData.append('canvas_width', data.canvasWidth.toString())
  }
  if (data.canvasHeight) {
    formData.append('canvas_height', data.canvasHeight.toString())
  }
  if (data.themeId) {
    formData.append('theme_id', data.themeId)
  }
  if (data.location) {
    formData.append('location', data.location)
  }

  formData.append('user', userId)

  return await pb.collection('postcards').create<PostcardRecord>(formData)
}

export function getFileUrl(record: PostcardRecord, filename: string) {
  return pb.files.getURL(record, filename)
}

export function resolveElementImageUrl(record: PostcardRecord, content: string): string {
  if (content.startsWith('element_image:')) {
    const indexStr = content.slice('element_image:'.length)
    const index = parseInt(indexStr, 10)
    const filename = record.element_images?.[index]
    if (filename) {
      return pb.files.getURL(record, filename)
    }
  }
  return content
}

export async function loginUser() {
  try {
    return await pb.collection('users').authWithOAuth2({
      provider: 'google',
    })
  } catch (error) {
    console.error('OAuth2 login error:', error)
    throw error
  }
}

export async function deleteUser(userId: string) {
  return await pb.collection('users').delete(userId)
}

import { ref, toRaw } from 'vue'

export const currentUser = ref(pb.authStore.model)

pb.authStore.onChange(() => {
  currentUser.value = pb.authStore.model
})

export function logoutUser() {
  pb.authStore.clear()
}

export async function getMyPostcards(page = 1, perPage = 20) {
  const userId = pb.authStore.model?.id
  if (!userId) return { items: [], totalItems: 0 }

  return await pb.collection('postcards').getList<PostcardRecord>(page, perPage, {
    filter: `user = "${userId}"`,
  })
}

export async function getSharedPostcard(id: string, token: string) {
  try {
    const postcard = await pb.collection('postcards').getOne<PostcardRecord>(id)
    if (postcard.share_token !== token) {
      throw new Error('Invalid share token')
    }
    return postcard
  } catch {
    throw new Error('Postcard not found or invalid token')
  }
}

export function buildShareLink(postcard: { id: string; share_token?: string }) {
  if (!postcard.share_token) return ''
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/share/${postcard.id}?token=${postcard.share_token}`
}
