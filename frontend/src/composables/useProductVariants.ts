import { computed, ref, watch, type MaybeRefOrGetter, toValue } from 'vue'
import type { Product } from '@/services/payloadService'
import {
  findVariantBySelectedOptions,
  getInitialSelectedOptions,
  getVariantOptionLabel,
  getVariantTypeGroups,
  normalizeProductVariants,
  productHasVariants,
  variantHasStock,
} from '@/utils/variants'
import {
  resolveVariantDescription,
  resolveVariantGallery,
  resolveVariantShortDescription,
} from '@/utils/variantContent'

export const useProductVariants = (product: MaybeRefOrGetter<Product | null>) => {
  const selectedOptions = ref<Record<string, number | string>>({})

  const currentProduct = computed(() => toValue(product))

  const hasVariants = computed(() => productHasVariants(currentProduct.value))

  const variantTypeGroups = computed(() => getVariantTypeGroups(currentProduct.value))

  const variants = computed(() => normalizeProductVariants(currentProduct.value))

  const selectedVariant = computed(() =>
    findVariantBySelectedOptions(variants.value, selectedOptions.value),
  )

  const selectedVariantLabel = computed(() => getVariantOptionLabel(selectedVariant.value))

  const activePrice = computed(() => {
    if (selectedVariant.value?.priceInUSD != null) {
      return selectedVariant.value.priceInUSD
    }
    return currentProduct.value?.priceInUSD ?? null
  })

  const activeShortDescription = computed(() =>
    resolveVariantShortDescription(selectedVariant.value, currentProduct.value),
  )

  const activeDescription = computed(() =>
    resolveVariantDescription(selectedVariant.value, currentProduct.value),
  )

  const activeGallery = computed(() =>
    resolveVariantGallery(selectedVariant.value, currentProduct.value),
  )

  const canAddToCart = computed(() => {
    if (!currentProduct.value) return false
    if (!hasVariants.value) {
      const inventory = currentProduct.value.inventory
      return typeof inventory !== 'number' || inventory > 0
    }
    return Boolean(selectedVariant.value && variantHasStock(selectedVariant.value))
  })

  const selectOption = (typeId: number | string, optionId: number | string) => {
    selectedOptions.value = {
      ...selectedOptions.value,
      [String(typeId)]: optionId,
    }
  }

  const isOptionSelected = (typeId: number | string, optionId: number | string) =>
    String(selectedOptions.value[String(typeId)]) === String(optionId)

  const resetSelection = () => {
    selectedOptions.value = hasVariants.value
      ? getInitialSelectedOptions(variantTypeGroups.value)
      : {}
  }

  watch(
    currentProduct,
    () => {
      resetSelection()
    },
    { immediate: true },
  )

  return {
    hasVariants,
    variantTypeGroups,
    variants,
    selectedOptions,
    selectedVariant,
    selectedVariantLabel,
    activePrice,
    activeShortDescription,
    activeDescription,
    activeGallery,
    canAddToCart,
    selectOption,
    isOptionSelected,
    resetSelection,
  }
}
