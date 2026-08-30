import type { LexicalRichText } from '@/types/blocks'
import type { Product, ProductGalleryItem } from '@/services/payloadService'
import type { ProductVariant } from '@/types/variants'
import { lexicalToPlainText } from '@/utils/lexical'
import { getMediaUrl } from '@/utils/media'
import { getProductImageUrl } from '@/utils/product'
import { getOptionIds } from '@/utils/variants'

export type ResolvedGalleryItem = {
  url: string
  alt?: string
}

const hasLexicalContent = (value?: LexicalRichText) => Boolean(lexicalToPlainText(value))

export const resolveVariantShortDescription = (
  variant?: ProductVariant | null,
  product?: Product | null,
): LexicalRichText => {
  if (hasLexicalContent(variant?.shortDescription)) return variant?.shortDescription ?? null
  return product?.shortDescription ?? null
}

export const resolveVariantDescription = (
  variant?: ProductVariant | null,
  product?: Product | null,
): LexicalRichText => {
  if (hasLexicalContent(variant?.description)) return variant?.description ?? null
  return product?.description ?? null
}

const buildGalleryFromProduct = (
  product?: Product | null,
  variant?: ProductVariant | null,
): ResolvedGalleryItem[] => {
  if (!Array.isArray(product?.gallery)) return []

  const optionIds = variant ? getOptionIds(variant).map(String) : []
  const items: ResolvedGalleryItem[] = []

  for (const entry of product.gallery as ProductGalleryItem[]) {
    const image = entry.image
    const url = getMediaUrl(image ?? null)
    if (!url) continue

    const variantOption = entry.variantOption
    const variantOptionId =
      typeof variantOption === 'object' && variantOption !== null && 'id' in variantOption
        ? String(variantOption.id)
        : variantOption != null
          ? String(variantOption)
          : null

    if (optionIds.length > 0 && variantOptionId && !optionIds.includes(variantOptionId)) {
      continue
    }

    items.push({
      url,
      alt:
        typeof image === 'object' && image?.alt
          ? image.alt
          : product?.title || undefined,
    })
  }

  if (items.length > 0) return items

  return (product.gallery as ProductGalleryItem[])
    .map((entry): ResolvedGalleryItem | null => {
      const url = getMediaUrl(entry.image ?? null)
      if (!url) return null
      return {
        url,
        alt:
          typeof entry.image === 'object' && entry.image?.alt
            ? entry.image.alt
            : product?.title || undefined,
      }
    })
    .filter((item): item is ResolvedGalleryItem => item !== null)
}

export const resolveVariantGallery = (
  variant?: ProductVariant | null,
  product?: Product | null,
): ResolvedGalleryItem[] => {
  const variantImageUrl = getMediaUrl(variant?.image ?? null)
  if (variantImageUrl) {
    const alt =
      typeof variant?.image === 'object' && variant.image?.alt
        ? variant.image.alt
        : product?.title || undefined

    return [{ url: variantImageUrl, alt }]
  }

  const matchedGallery = buildGalleryFromProduct(product, variant)
  if (matchedGallery.length > 0) return matchedGallery

  const fallbackUrl = getProductImageUrl(product)
  if (!fallbackUrl) return []

  return [{ url: fallbackUrl, alt: product?.title || undefined }]
}

export const resolveVariantImageUrl = (
  variant?: ProductVariant | null,
  product?: Product | null,
) => resolveVariantGallery(variant, product)[0]?.url ?? null
