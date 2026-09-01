import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import {
  payloadService,
  type Category,
  type Product,
  type ProductCategory,
} from '@/services/payloadService'
import { getMediaUrl } from '@/utils/media'
import {
  getProductId,
  getProductImageUrl,
  getProductPath,
  normalizeProducts,
  type ProductRef,
} from '@/utils/product'

export type ArchiveDocRef = {
  relationTo?: 'products' | 'categories' | string
  value?: number | Product | Category | null
}

export type ArchiveSource = {
  title?: string | null
  populateBy?: 'collection' | 'selection' | null
  relationTo?: 'products' | 'categories' | null
  limit?: number | null
  categories?: Array<number | ProductCategory | null> | null
  selectedDocs?: ArchiveDocRef[] | null
  products?: Array<number | Product> | null
}

export type ArchiveTile = {
  id: number | string
  title: string
  slug?: string | null
  href: string
  imageUrl: string | null
  kind: 'product' | 'category'
}

const toCategoryIds = (categories: ArchiveSource['categories']) =>
  (categories ?? [])
    .map((category) => {
      if (typeof category === 'number' || typeof category === 'string') return category
      return category?.id ?? null
    })
    .filter((id): id is number | string => id != null)

const isCategory = (value: unknown): value is Category =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'title' in value &&
  typeof (value as Category).title === 'string' &&
  !('priceInUSD' in (value as object))

const categoryHref = (category: Category) =>
  category.slug ? `/?categoria=${encodeURIComponent(category.slug)}` : '/'

const toProductTile = (product: Product): ArchiveTile => ({
  id: product.id,
  title: product.title,
  slug: product.slug,
  href: getProductPath(product.slug),
  imageUrl: getProductImageUrl(product),
  kind: 'product',
})

const toCategoryTile = (category: Category): ArchiveTile => ({
  id: category.id,
  title: category.title,
  slug: category.slug,
  href: categoryHref(category),
  imageUrl: getMediaUrl(category.image ?? null),
  kind: 'category',
})

export const useArchiveItems = (source: MaybeRefOrGetter<ArchiveSource>) => {
  const items = ref<ArchiveTile[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const query = computed(() => toValue(source))

  const loadItems = async () => {
    const current = query.value
    const limit = current.limit ?? 10
    const relationTo = current.relationTo ?? 'products'
    error.value = null

    loading.value = true

    try {
      if (current.populateBy === 'selection') {
        const selected = current.selectedDocs ?? []
        const tiles: ArchiveTile[] = []

        for (const entry of selected) {
          if (!entry?.value || typeof entry.value !== 'object') continue
          if (entry.relationTo === 'categories' && isCategory(entry.value)) {
            tiles.push(toCategoryTile(entry.value))
          } else if (entry.relationTo === 'products' || !entry.relationTo) {
            const products = normalizeProducts([entry as ProductRef])
            products.forEach((product) => tiles.push(toProductTile(product)))
          }
        }

        // Si selection trae solo IDs, los resolvemos por tipo.
        if (tiles.length === 0) {
          const productIds = selected
            .filter((entry) => entry?.relationTo === 'products' || !entry?.relationTo)
            .map((entry) => getProductId(entry as ProductRef))
            .filter((id): id is number | string => id != null)
          const categoryIds = selected
            .filter((entry) => entry?.relationTo === 'categories')
            .map((entry) =>
              typeof entry.value === 'number' || typeof entry.value === 'string'
                ? entry.value
                : isCategory(entry.value)
                  ? entry.value.id
                  : null,
            )
            .filter((id): id is number | string => id != null)

          if (productIds.length > 0) {
            const response = await payloadService.getProducts({ ids: productIds, limit })
            response.docs.forEach((product) => tiles.push(toProductTile(product)))
          }
          if (categoryIds.length > 0) {
            const response = await payloadService.getCategories({ ids: categoryIds, limit })
            response.docs.forEach((category) => tiles.push(toCategoryTile(category)))
          }
        }

        items.value = tiles.slice(0, limit)
        return
      }

      if (relationTo === 'categories') {
        const response = await payloadService.getCategories({ limit })
        items.value = response.docs.map(toCategoryTile)
        return
      }

      const categoryIds = toCategoryIds(current.categories)
      let response = await payloadService.getProducts({ limit, categoryIds })
      if (response.docs.length === 0 && categoryIds.length > 0) {
        response = await payloadService.getProducts({ limit })
      }
      items.value = response.docs.map(toProductTile)
    } catch (err) {
      items.value = []
      error.value = err instanceof Error ? err.message : 'No se pudo cargar el archive.'
    } finally {
      loading.value = false
    }
  }

  watch(query, loadItems, { immediate: true, deep: true })

  return {
    items,
    loading,
    error,
    loadItems,
  }
}
