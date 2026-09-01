import type { LexicalRichText, MediaRef } from '@/types/blocks'
import { lexicalToPlainText } from '@/utils/lexical'
import { getMediaUrl } from '@/utils/media'
import type { Product, ProductCategory } from '@/services/payloadService'

export const SHOP_PATH = '/tienda'

export const getProductPath = (slug?: string | null) =>
  slug ? `${SHOP_PATH}/${slug}` : SHOP_PATH

export type ProductRef = {
  relationTo?: 'products' | string
  value?: number | Product | null
}

export const isProduct = (value: unknown): value is Product =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'title' in value &&
  typeof (value as Product).title === 'string'

export const getProductId = (entry: number | string | Product | ProductRef | null | undefined) => {
  if (entry == null) return null
  if (typeof entry === 'number' || typeof entry === 'string') return entry
  if ('value' in entry) {
    const value = entry.value
    if (typeof value === 'number' || typeof value === 'string') return value
    return isProduct(value) ? value.id : null
  }
  return isProduct(entry) ? entry.id : null
}

export const normalizeProducts = (
  entries: Array<number | Product | ProductRef | null | undefined> = [],
) =>
  entries
    .map((entry) => {
      if (!entry || typeof entry === 'number' || typeof entry === 'string') return null
      if ('value' in entry) return isProduct(entry.value) ? entry.value : null
      return isProduct(entry) ? entry : null
    })
    .filter((product): product is Product => isProduct(product))

export const getProductImageUrl = (product?: Product | null) => {
  if (!product) return null

  const gallery = Array.isArray(product.gallery) ? product.gallery : []
  const firstImage = gallery[0]?.image as number | MediaRef | undefined
  return getMediaUrl(firstImage ?? null)
}

export const getProductCategoryLabel = (product?: Product | null) => {
  const first = product?.categories?.find((category): category is ProductCategory =>
    typeof category === 'object' && category !== null && 'title' in category,
  )

  return first?.title || null
}

export const getProductShortDescription = (product?: Product | null): LexicalRichText =>
  product?.shortDescription ?? null

export const hasProductShortDescription = (product?: Product | null) =>
  Boolean(lexicalToPlainText(getProductShortDescription(product)))

export const formatProductPrice = (priceInUSD?: number | null) => {
  if (typeof priceInUSD !== 'number') return 'Consultar'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInUSD / 100)
}

export const isNewProduct = (product?: Product | null, days = 30) => {
  if (!product?.createdAt) return false
  const created = new Date(product.createdAt).getTime()
  if (Number.isNaN(created)) return false
  return Date.now() - created < days * 24 * 60 * 60 * 1000
}
