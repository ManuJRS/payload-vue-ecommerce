import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { payloadService, type Product } from '@/services/payloadService'
import {
  getProductId,
  normalizeProducts,
  type ProductRef,
} from '@/utils/product'

export type CarouselProductSource = {
  populateBy?: 'collection' | 'selection' | null
  limit?: number | null
  categories?: Array<number | { id?: number | string } | null> | null
  selectedDocs?: ProductRef[] | null
  populatedDocs?: ProductRef[] | null
  products?: Array<number | Product> | null
}

const toCategoryIds = (categories: CarouselProductSource['categories']) =>
  (categories ?? [])
    .map((category) => {
      if (typeof category === 'number' || typeof category === 'string') return category
      return category?.id ?? null
    })
    .filter((id): id is number | string => id != null)

export const useCarouselProducts = (source: MaybeRefOrGetter<CarouselProductSource>) => {
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const query = computed(() => toValue(source))

  const loadProducts = async () => {
    const current = query.value
    const limit = current.limit ?? 10
    error.value = null

    const embedded = normalizeProducts([
      ...(current.products ?? []),
      ...(current.selectedDocs ?? []),
      ...(current.populatedDocs ?? []),
    ])

    if (embedded.length > 0) {
      products.value = embedded.slice(0, limit)
      return
    }

    loading.value = true

    try {
      if (current.populateBy === 'selection') {
        const ids = (current.selectedDocs ?? [])
          .map((entry) => getProductId(entry))
          .filter((id): id is number | string => id != null)

        if (ids.length === 0) {
          products.value = []
          return
        }

        const response = await payloadService.getProducts({ ids, limit })
        products.value = response.docs
        return
      }

      const categoryIds = toCategoryIds(current.categories)
      let response = await payloadService.getProducts({
        limit,
        categoryIds,
      })

      // Si el bloque filtra por categorías pero los productos no las tienen asignadas,
      // mostramos el catálogo publicado para que el carousel no quede vacío.
      if (response.docs.length === 0 && categoryIds.length > 0) {
        response = await payloadService.getProducts({ limit })
      }

      products.value = response.docs
    } catch (err) {
      products.value = []
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar los productos.'
    } finally {
      loading.value = false
    }
  }

  watch(query, loadProducts, { immediate: true, deep: true })

  return {
    products,
    loading,
    error,
    loadProducts,
  }
}
