<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { payloadService, type Product } from '@/services/payloadService'
import { getProductImageUrl } from '@/utils/product'
import { useShopFilters } from '@/composables/useShopFilters'
import ShopProductCard from './ShopProductCard.vue'

const PAGE_SIZE = 12

const cart = useCartStore()
const shopFilters = useShopFilters()
const route = useRoute()

const appliedSearch = computed(() => {
  const value = route.query.q
  return typeof value === 'string' ? value.trim() : ''
})

const products = ref<Product[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const totalDocs = ref(0)
const totalPages = ref(1)
const sort = ref('-createdAt')

const sortOptions = [
  { label: 'Más recientes', value: '-createdAt' },
  { label: 'Precio: Menor a Mayor', value: 'priceInUSD' },
  { label: 'Precio: Mayor a Menor', value: '-priceInUSD' },
  { label: 'Nombre A-Z', value: 'title' },
]

const showingFrom = computed(() => {
  if (totalDocs.value === 0) return 0
  return (page.value - 1) * PAGE_SIZE + 1
})

const showingTo = computed(() => {
  if (totalDocs.value === 0) return 0
  return Math.min(page.value * PAGE_SIZE, totalDocs.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  let start = Math.max(1, page.value - 2)
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let current = start; current <= end; current += 1) {
    pages.push(current)
  }

  return pages
})

const resolvePriceBounds = (items: Product[]) => {
  const prices = items
    .map((product) => product.priceInUSD)
    .filter((price): price is number => typeof price === 'number')

  if (prices.length === 0) {
    return { min: 0, max: 1000 }
  }

  const minCents = Math.min(...prices)
  const maxCents = Math.max(...prices)
  const min = Math.floor(minCents / 100)
  const max = Math.ceil(maxCents / 100)

  return {
    min,
    max: min === max ? max + 1 : max,
  }
}

const loadPriceBounds = async () => {
  try {
    const response = await payloadService.getProducts({
      limit: 250,
      sort: 'priceInUSD',
    })
    shopFilters.setPriceBounds(resolvePriceBounds(response.docs))
  } catch {
    shopFilters.setPriceBounds({ min: 0, max: 1000 })
  }
}

const loadProducts = async () => {
  loading.value = true
  error.value = null

  const { categoryIds, minPrice, maxPrice } = shopFilters.appliedFilters.value

  try {
    const response = await payloadService.getProducts({
      limit: PAGE_SIZE,
      page: page.value,
      sort: sort.value,
      categoryIds: categoryIds.length > 0 ? categoryIds : undefined,
      minPrice,
      maxPrice,
      search: appliedSearch.value || undefined,
    })

    products.value = response.docs
    totalDocs.value = response.totalDocs
    totalPages.value = response.totalPages
  } catch (err) {
    products.value = []
    totalDocs.value = 0
    totalPages.value = 1
    error.value = err instanceof Error ? err.message : 'No se pudieron cargar los productos.'
  } finally {
    loading.value = false
  }
}

const goToPage = (nextPage: number) => {
  if (nextPage < 1 || nextPage > totalPages.value || nextPage === page.value) return
  page.value = nextPage
}

const addToCart = (product: Product) => {
  cart.addToCart({
    id: product.id,
    title: product.title,
    slug: product.slug,
    priceInUSD: product.priceInUSD,
    imageUrl: getProductImageUrl(product),
  })
}

onMounted(async () => {
  await loadPriceBounds()
  await loadProducts()
})

watch(page, loadProducts)
watch(sort, () => {
  page.value = 1
  loadProducts()
})
watch(() => shopFilters.appliedRevision.value, () => {
  page.value = 1
  loadProducts()
})
watch(appliedSearch, () => {
  page.value = 1
  loadProducts()
})
</script>

<template>
  <section class="flex-grow pt-12 lg:pt-0">
    <div class="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
      <div>
        <p
          v-if="appliedSearch"
          class="mb-1 text-sm font-medium text-slate-900"
        >
          Resultados para “{{ appliedSearch }}”
        </p>
        <p class="text-sm font-medium text-slate-500">
        <template v-if="loading">
          Cargando productos...
        </template>
        <template v-else-if="totalDocs > 0">
          Mostrando {{ showingFrom }}–{{ showingTo }} de {{ totalDocs }} productos
        </template>
        <template v-else>
          No hay productos disponibles
        </template>
        </p>
      </div>

      <div class="flex w-full items-center gap-4 sm:w-auto">
        <label
          for="shop-sort"
          class="shrink-0 text-sm font-medium text-slate-500"
        >
          Ordenar por:
        </label>
        <select
          id="shop-sort"
          v-model="sort"
          class="w-full cursor-pointer rounded border border-slate-300 bg-white py-2 pl-3 pr-10 text-sm transition focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 sm:w-auto"
        >
          <option
            v-for="option in sortOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <p
      v-if="error"
      class="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ error }}
    </p>

    <div
      v-if="loading"
      class="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="index in PAGE_SIZE"
        :key="index"
        class="aspect-[3/4] animate-pulse rounded-sm bg-slate-200"
      />
    </div>

    <div
      v-else-if="products.length > 0"
      class="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
    >
      <ShopProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        @add-to-cart="addToCart"
      />
    </div>

    <p
      v-else
      class="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500"
    >
      No hay productos que coincidan con los filtros seleccionados.
    </p>

    <div
      v-if="totalPages > 1 && !loading"
      class="mt-16 flex items-center justify-center gap-2"
    >
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded border border-slate-300 text-slate-500 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="page <= 1"
        aria-label="Página anterior"
        @click="goToPage(page - 1)"
      >
        ‹
      </button>

      <button
        v-for="currentPage in visiblePages"
        :key="currentPage"
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded border text-sm font-medium transition"
        :class="
          currentPage === page
            ? 'border-black bg-black text-white hover:bg-slate-900 hover:text-white'
            : 'border-slate-300 text-slate-500 hover:border-slate-900'
        "
        @click="goToPage(currentPage)"
      >
        {{ currentPage }}
      </button>

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded border border-slate-300 text-slate-500 transition hover:border-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="page >= totalPages"
        aria-label="Página siguiente"
        @click="goToPage(page + 1)"
      >
        ›
      </button>
    </div>
  </section>
</template>
