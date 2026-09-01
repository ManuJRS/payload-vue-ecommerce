import { computed, inject, provide, ref, type InjectionKey, type Ref } from 'vue'

export type ShopAppliedFilters = {
  categoryIds: Array<number | string>
  minPrice: number | null
  maxPrice: number | null
}

export type ShopPriceBounds = {
  min: number
  max: number
}

export type ShopFiltersContext = {
  draftCategoryIds: Ref<Set<string>>
  draftMinPrice: Ref<number>
  draftMaxPrice: Ref<number>
  priceBounds: Ref<ShopPriceBounds>
  appliedFilters: Ref<ShopAppliedFilters>
  appliedRevision: Ref<number>
  toggleDraftCategory: (id: number | string) => void
  isDraftCategorySelected: (id: number | string) => boolean
  applyFilters: () => void
  resetDraftToApplied: () => void
  setPriceBounds: (bounds: ShopPriceBounds) => void
  hasPendingChanges: Ref<boolean>
}

const SHOP_FILTERS_KEY: InjectionKey<ShopFiltersContext> = Symbol('shopFilters')

const toKey = (id: number | string) => String(id)

const dollarsToCents = (value: number) => Math.round(value * 100)

export const provideShopFilters = () => {
  const draftCategoryIds = ref<Set<string>>(new Set())
  const draftMinPrice = ref(0)
  const draftMaxPrice = ref(1000)
  const priceBounds = ref<ShopPriceBounds>({ min: 0, max: 1000 })

  const appliedFilters = ref<ShopAppliedFilters>({
    categoryIds: [],
    minPrice: null,
    maxPrice: null,
  })
  const appliedRevision = ref(0)

  const appliedCategorySet = computed(
    () => new Set(appliedFilters.value.categoryIds.map(toKey)),
  )

  const hasPendingChanges = computed(() => {
    const draftKeys = [...draftCategoryIds.value].sort().join(',')
    const appliedKeys = [...appliedCategorySet.value].sort().join(',')
    if (draftKeys !== appliedKeys) return true

    const bounds = priceBounds.value
    const appliedMin =
      appliedFilters.value.minPrice != null
        ? appliedFilters.value.minPrice / 100
        : bounds.min
    const appliedMax =
      appliedFilters.value.maxPrice != null
        ? appliedFilters.value.maxPrice / 100
        : bounds.max

    return draftMinPrice.value !== appliedMin || draftMaxPrice.value !== appliedMax
  })

  const toggleDraftCategory = (id: number | string) => {
    const key = toKey(id)
    const next = new Set(draftCategoryIds.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    draftCategoryIds.value = next
  }

  const isDraftCategorySelected = (id: number | string) =>
    draftCategoryIds.value.has(toKey(id))

  const applyFilters = () => {
    const bounds = priceBounds.value
    const minChanged = draftMinPrice.value > bounds.min
    const maxChanged = draftMaxPrice.value < bounds.max

    appliedFilters.value = {
      categoryIds: [...draftCategoryIds.value],
      minPrice: minChanged ? dollarsToCents(draftMinPrice.value) : null,
      maxPrice: maxChanged ? dollarsToCents(draftMaxPrice.value) : null,
    }
    appliedRevision.value += 1
  }

  const resetDraftToApplied = () => {
    draftCategoryIds.value = new Set(appliedFilters.value.categoryIds.map(toKey))

    const bounds = priceBounds.value
    draftMinPrice.value =
      appliedFilters.value.minPrice != null
        ? appliedFilters.value.minPrice / 100
        : bounds.min
    draftMaxPrice.value =
      appliedFilters.value.maxPrice != null
        ? appliedFilters.value.maxPrice / 100
        : bounds.max
  }

  const setPriceBounds = (bounds: ShopPriceBounds) => {
    priceBounds.value = bounds
    if (appliedFilters.value.minPrice == null) draftMinPrice.value = bounds.min
    if (appliedFilters.value.maxPrice == null) draftMaxPrice.value = bounds.max
  }

  const context: ShopFiltersContext = {
    draftCategoryIds,
    draftMinPrice,
    draftMaxPrice,
    priceBounds,
    appliedFilters,
    appliedRevision,
    toggleDraftCategory,
    isDraftCategorySelected,
    applyFilters,
    resetDraftToApplied,
    setPriceBounds,
    hasPendingChanges,
  }

  provide(SHOP_FILTERS_KEY, context)

  return context
}

export const useShopFilters = () => {
  const context = inject(SHOP_FILTERS_KEY)
  if (!context) {
    throw new Error('useShopFilters debe usarse dentro de ShopView')
  }
  return context
}

export const useShopFiltersOptional = () => inject(SHOP_FILTERS_KEY)
