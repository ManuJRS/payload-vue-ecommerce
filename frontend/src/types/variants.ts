import type { LexicalRichText, MediaRef } from '@/types/blocks'

export type VariantOption = {
  id: number | string
  label: string
  value: string
  variantType?: number | string | VariantTypeRef | null
}

export type VariantTypeRef = {
  id: number | string
  label: string
  name: string
}

export type ProductVariant = {
  id: number | string
  title?: string | null
  options?: Array<number | string | VariantOption> | null
  shortDescription?: LexicalRichText
  description?: LexicalRichText
  image?: number | MediaRef | null
  inventory?: number | null
  priceInUSD?: number | null
  priceInUSDEnabled?: boolean | null
}

export type VariantTypeGroup = {
  id: number | string
  label: string
  name: string
  options: VariantOption[]
}

export type ProductVariantsField = {
  enableVariants?: boolean | null
  variantTypes?: Array<number | string | VariantTypeRef> | null
  variants?: {
    docs?: Array<number | string | ProductVariant> | null
    hasNextPage?: boolean
    totalDocs?: number
  } | null
}
