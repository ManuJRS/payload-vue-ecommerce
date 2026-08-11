import type { PageHero, PayloadBlock } from '@/types/blocks'
import api from './api'

export type PayloadDoc = {
  id: number | string
  slug?: string | null
  title?: string | null
  [key: string]: unknown
}

export type PayloadListResponse<T> = {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page?: number
  pagingCounter?: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage?: number | null
  nextPage?: number | null
}

export type Product = PayloadDoc & {
  title: string
  slug?: string | null
  description?: unknown
  gallery?: unknown
  priceInUSD?: number | null
  inventory?: number | null
  enableVariants?: boolean | null
  meta?: unknown
  _status?: 'draft' | 'published' | null
}

export type Page = PayloadDoc & {
  title: string
  slug?: string | null
  hero?: PageHero | null
  layout?: PayloadBlock[] | null
  meta?: unknown
  _status?: 'draft' | 'published' | null
}

const publishedOnly = {
  'where[_status][equals]': 'published',
} as const

export const payloadService = {
  /** Catálogo de productos publicados. */
  async getProducts(params: Record<string, string | number | boolean> = {}) {
    const { data } = await api.get<PayloadListResponse<Product>>('/api/products', {
      params: {
        depth: 2,
        limit: 100,
        sort: '-createdAt',
        ...publishedOnly,
        ...params,
      },
    })

    return data
  },

  /** Detalle de un producto por slug. */
  async getProductBySlug(slug: string) {
    const { data } = await api.get<PayloadListResponse<Product>>('/api/products', {
      params: {
        depth: 2,
        limit: 1,
        'where[slug][equals]': slug,
        ...publishedOnly,
      },
    })

    return data.docs[0] ?? null
  },

  /** Página dinámica (home, nosotros, etc.) por slug. */
  async getPageBySlug(slug: string) {
    const { data } = await api.get<PayloadListResponse<Page>>('/api/pages', {
      params: {
        depth: 2,
        limit: 1,
        'where[slug][equals]': slug,
        ...publishedOnly,
      },
    })

    return data.docs[0] ?? null
  },
}

export default payloadService
