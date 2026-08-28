import type { MediaRef, PageHero, PayloadBlock, LexicalRichText } from '@/types/blocks'
import type { NavItem } from '@/utils/nav'
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

export type ProductGalleryItem = {
  image?: number | MediaRef
  variantOption?: unknown
  id?: string | null
}

export type ProductCategory = {
  id: number | string
  title?: string | null
  slug?: string | null
}

export type Category = PayloadDoc & {
  title: string
  slug?: string | null
  image?: number | MediaRef | null
}

export type Product = PayloadDoc & {
  title: string
  slug?: string | null
  shortDescription?: LexicalRichText
  description?: LexicalRichText
  gallery?: ProductGalleryItem[] | null
  layout?: PayloadBlock[] | null
  categories?: Array<number | ProductCategory> | null
  priceInUSD?: number | null
  inventory?: number | null
  enableVariants?: boolean | null
  createdAt?: string | null
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

export type HeaderGlobal = {
  id: number | string
  navItems?: NavItem[] | null
  updatedAt?: string | null
  createdAt?: string | null
}

export type FooterGlobal = HeaderGlobal

const publishedOnly = {
  'where[_status][equals]': 'published',
} as const

export type ProductListParams = {
  limit?: number
  page?: number
  ids?: Array<number | string>
  categoryIds?: Array<number | string>
  sort?: string
}

const toWhereParams = (params: ProductListParams) => {
  const query: Record<string, string | number | boolean> = {}

  params.ids?.forEach((id, index) => {
    query[`where[id][in][${index}]`] = id
  })

  params.categoryIds?.forEach((id, index) => {
    query[`where[or][${index}][categories][contains]`] = id
  })

  return query
}

export type CategoryListParams = {
  limit?: number
  ids?: Array<number | string>
  sort?: string
}

const toCategoryWhereParams = (params: CategoryListParams) => {
  const query: Record<string, string | number | boolean> = {}
  params.ids?.forEach((id, index) => {
    query[`where[id][in][${index}]`] = id
  })
  return query
}

export const payloadService = {
  /** Catálogo de productos publicados. */
  async getProducts(params: ProductListParams = {}) {
    const { ids, categoryIds, ...rest } = params
    const { data } = await api.get<PayloadListResponse<Product>>('/api/products', {
      params: {
        depth: 2,
        limit: rest.limit ?? 100,
        page: rest.page ?? 1,
        sort: rest.sort ?? '-createdAt',
        ...publishedOnly,
        ...toWhereParams({ ids, categoryIds }),
      },
    })

    return data
  },

  /** Listado de categorías. */
  async getCategories(params: CategoryListParams = {}) {
    const { ids, ...rest } = params
    const { data } = await api.get<PayloadListResponse<Category>>('/api/categories', {
      params: {
        depth: 1,
        limit: rest.limit ?? 100,
        sort: rest.sort ?? 'title',
        ...toCategoryWhereParams({ ids }),
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

  /** Global Header con navItems. */
  async getHeader() {
    const { data } = await api.get<HeaderGlobal>('/api/globals/header', {
      params: {
        depth: 1,
      },
    })

    return data
  },

  /** Global Footer con navItems. */
  async getFooter() {
    const { data } = await api.get<FooterGlobal>('/api/globals/footer', {
      params: {
        depth: 1,
      },
    })

    return data
  },
}

export default payloadService
