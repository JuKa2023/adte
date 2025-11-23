import PocketBase from 'pocketbase'

export const pb = new PocketBase('http://127.0.0.1:8090')

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
    // Ensure elements is a string and not empty
    console.log('Sending elements:', data.elements)
    // Use toRaw to ensure we get the plain array from Vue proxy
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

    formData.append('user', userId)

    return await pb.collection('postcards').create<PostcardRecord>(formData)
}

export async function updatePostcard(id: string, data: Partial<PostcardRecord>) {
    return await pb.collection('postcards').update<PostcardRecord>(id, data)
}

export async function getPostcards(page = 1, perPage = 20) {
    return await pb.collection('postcards').getList<PostcardRecord>(page, perPage, {
        filter: 'is_public = true',
    })
}

export function getFileUrl(record: PostcardRecord, filename: string) {
    return pb.files.getUrl(record, filename)
}

export async function registerUser(data: any) {
    return await pb.collection('users').create(data)
}

export async function loginUser(data: any) {
    return await pb.collection('users').authWithPassword(data.email, data.password)
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
    } catch (error) {
        throw new Error('Postcard not found or invalid token')
    }
}

export function buildShareLink(postcard: { id: string; share_token?: string }) {
    if (!postcard.share_token) return ''
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/share/${postcard.id}?token=${postcard.share_token}`
}
