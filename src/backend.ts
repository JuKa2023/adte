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
  front_image: string // Filename
  audio?: string // Filename
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
  location?: string // JSON string of { city, weather }
}

export async function createPostcard(data: {
  frontImageBlob: Blob
  audioBlob: Blob | null
  message: string
  elements: PostcardElement[]
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

  // Append files
  formData.append('front_image', data.frontImageBlob)
  if (data.audioBlob) {
    formData.append('audio', data.audioBlob)
  }

  // Generate unique share token
  const shareToken = crypto.randomUUID()

  // Append data fields
  formData.append('message', data.message)
  const rawElements = toRaw(data.elements || [])
  formData.append('elements', JSON.stringify(rawElements))
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

export async function loginUser() {
  try {
    // First, verify that OAuth2 is configured by listing auth methods
    const authMethods = await pb.collection('users').listAuthMethods()

    if (!authMethods?.oauth2?.providers?.length) {
      throw new Error(
        'OAuth2 is not configured on the PocketBase server. Please configure Google OAuth2 in PocketBase admin panel.',
      )
    }

    // Check if Google provider is available
    const googleProvider = authMethods.oauth2.providers.find(
      (p: { name: string }) => p.name === 'google',
    )

    if (!googleProvider) {
      throw new Error(
        'Google OAuth2 provider is not configured. Available providers: ' +
          authMethods.oauth2.providers.map((p: { name: string }) => p.name).join(', '),
      )
    }

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

    // Validate token for privacy
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
