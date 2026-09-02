<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { payloadService, type Product } from '@/services/payloadService'
import { formatProductPrice, getProductImageUrl, getProductPath, SHOP_PATH } from '@/utils/product'

const MIN_QUERY_LENGTH = 2
const SUGGESTION_LIMIT = 6
const DEBOUNCE_MS = 300

const route = useRoute()
const router = useRouter()

const query = ref('')
const suggestions = ref<Product[]>([])
const loadingSuggestions = ref(false)
const showSuggestions = ref(false)
const suggestionError = ref<string | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let requestId = 0

const trimmedQuery = computed(() => query.value.trim())
const hasSuggestions = computed(() => showSuggestions.value && trimmedQuery.value.length >= MIN_QUERY_LENGTH)

const syncFromRoute = () => {
  const routeQuery = route.query.q
  if (typeof routeQuery === 'string') {
    query.value = routeQuery
  }
}

const clearDebounce = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

const fetchSuggestions = async (term: string) => {
  const currentRequest = ++requestId
  loadingSuggestions.value = true
  suggestionError.value = null

  try {
    const response = await payloadService.getProducts({
      search: term,
      limit: SUGGESTION_LIMIT,
      sort: 'title',
    })

    if (currentRequest !== requestId) return
    suggestions.value = response.docs
  } catch (err) {
    if (currentRequest !== requestId) return
    suggestions.value = []
    suggestionError.value =
      err instanceof Error ? err.message : 'No se pudieron cargar las sugerencias.'
  } finally {
    if (currentRequest === requestId) {
      loadingSuggestions.value = false
    }
  }
}

const scheduleSuggestions = (term: string) => {
  clearDebounce()

  if (term.length < MIN_QUERY_LENGTH) {
    suggestions.value = []
    loadingSuggestions.value = false
    suggestionError.value = null
    return
  }

  debounceTimer = setTimeout(() => {
    fetchSuggestions(term)
  }, DEBOUNCE_MS)
}

const openSuggestions = () => {
  if (trimmedQuery.value.length >= MIN_QUERY_LENGTH) {
    showSuggestions.value = true
  }
}

const closeSuggestions = () => {
  showSuggestions.value = false
}

const submitSearch = async () => {
  const term = trimmedQuery.value
  closeSuggestions()

  if (route.path === SHOP_PATH) {
    await router.replace({
      path: SHOP_PATH,
      query: term ? { q: term } : {},
    })
    return
  }

  await router.push({
    path: SHOP_PATH,
    query: term ? { q: term } : {},
  })
}

const handleInput = () => {
  openSuggestions()
  scheduleSuggestions(trimmedQuery.value)
}

const handleFocus = () => {
  openSuggestions()
  if (trimmedQuery.value.length >= MIN_QUERY_LENGTH && suggestions.value.length === 0) {
    scheduleSuggestions(trimmedQuery.value)
  }
}

const handleBlur = () => {
  window.setTimeout(() => {
    closeSuggestions()
  }, 150)
}

const handleRootClick = (event: MouseEvent) => {
  const target = event.target as Node
  if (!rootRef.value?.contains(target)) {
    closeSuggestions()
  }
}

const rootRef = ref<HTMLElement | null>(null)

watch(
  () => route.query.q,
  () => {
    syncFromRoute()
  },
)

onMounted(() => {
  syncFromRoute()
  document.addEventListener('click', handleRootClick)
})

onUnmounted(() => {
  clearDebounce()
  document.removeEventListener('click', handleRootClick)
})
</script>

<template>
  <div
    ref="rootRef"
    class="relative w-full max-w-md flex-1"
  >
    <form
      class="flex w-full items-stretch gap-2"
      role="search"
      @submit.prevent="submitSearch"
    >
      <label
        for="product-search"
        class="sr-only"
      >
        Buscar productos
      </label>
      <input
        id="product-search"
        v-model="query"
        type="search"
        autocomplete="off"
        placeholder="Buscar productos..."
        class="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      >
      <button
        type="submit"
        class="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        Buscar
      </button>
    </form>

    <div
      v-if="hasSuggestions"
      class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <p
        v-if="loadingSuggestions"
        class="px-4 py-3 text-sm text-slate-500"
      >
        Buscando sugerencias...
      </p>

      <p
        v-else-if="suggestionError"
        class="px-4 py-3 text-sm text-rose-600"
      >
        {{ suggestionError }}
      </p>

      <p
        v-else-if="suggestions.length === 0"
        class="px-4 py-3 text-sm text-slate-500"
      >
        No hay productos que coincidan.
      </p>

      <ul
        v-else
        class="max-h-80 overflow-y-auto py-1"
      >
        <li
          v-for="product in suggestions"
          :key="product.id"
        >
          <RouterLink
            :to="getProductPath(product.slug)"
            class="flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
            @mousedown.prevent
          >
            <div class="h-12 w-10 shrink-0 overflow-hidden rounded bg-slate-100">
              <img
                v-if="getProductImageUrl(product)"
                :src="getProductImageUrl(product)!"
                :alt="product.title"
                class="h-full w-full object-cover"
              >
            </div>
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-slate-900">
                {{ product.title }}
              </p>
              <p class="text-xs text-slate-500">
                {{ formatProductPrice(product.priceInUSD) }}
              </p>
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
