import type { MediaRef } from '@/types/blocks'

const apiBase = (import.meta.env.VITE_PAYLOAD_API_URL || '').replace(/\/$/, '')

export const getMediaUrl = (media?: number | MediaRef | string | null) => {
  if (!media) return null
  if (typeof media === 'string') return media
  if (typeof media === 'number') return null

  const cloudinaryUrl = media.cloudinary?.secure_url
  if (cloudinaryUrl) return cloudinaryUrl

  if (!media.url) return null
  if (media.url.startsWith('http')) return media.url

  return `${apiBase}${media.url}`
}
