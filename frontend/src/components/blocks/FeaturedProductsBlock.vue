<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { payloadService, type Product } from '@/services/payloadService'
import type { LexicalRichText } from '@/types/blocks'
import { lexicalToHtml } from '@/utils/lexical'
import { getMediaUrl } from '@/utils/media'
import { getProductPath } from '@/utils/product'

type SelectedDoc = {
  relationTo?: 'products' | string
  value?: number | Product | null
}

const props = defineProps<{
  introContent?: LexicalRichText
  populateBy?: 'collection' | 'selection' | null
  relationTo?: 'products' | null
  categories?: unknown
  limit?: number | null
  selectedDocs?: SelectedDoc[] | null
  populatedDocs?: SelectedDoc[] | null
  products?: Array<number | Product> | null
  blockName?: string | null
  blockType?: string | null
}>()

const cart = useCartStore()
const loading = ref(false)
const error = ref<string | null>(null)
const products = ref<Product[]>([])

const introHtml = computed(() => lexicalToHtml(props.introContent))
const sectionTitle = computed(
  () => props.blockName || (props.blockType === 'threeItemGrid' ? 'Selección destacada' : 'Productos destacados'),
)

const isProduct = (value: unknown): value is Product =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'title' in value &&
  typeof (value as Product).title === 'string'

const resolveProductImage = (product: Product) => {
  const gallery = Array.isArray(product.gallery) ? product.gallery : []
  const firstImage = gallery[0] as { image?: unknown } | undefined
  return getMediaUrl((firstImage?.image as never) ?? null)
}

const normalizeProducts = (entries: Array<number | Product | SelectedDoc | null | undefined>) =>
  entries
    .map((entry) => {
      if (!entry || typeof entry === 'number') return null
      if ('value' in entry) {
        return isProduct(entry.value) ? entry.value : null
      }
      return isProduct(entry) ? entry : null
    })
    .filter((product): product is Product => isProduct(product))

const loadProducts = async () => {
  error.value = null

  const fromSelection = normalizeProducts([
    ...(props.products ?? []),
    ...(props.selectedDocs ?? []),
    ...(props.populatedDocs ?? []),
  ])

  if (fromSelection.length > 0) {
    products.value = fromSelection.slice(0, props.limit ?? fromSelection.length)
    return
  }

  loading.value = true
  try {
    const response = await payloadService.getProducts({
      limit: props.limit ?? 8,
    })
    products.value = response.docs
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudieron cargar los productos.'
    products.value = []
  } finally {
    loading.value = false
  }
}

const addProduct = (product: Product) => {
  cart.addToCart({
    id: product.id,
    title: product.title,
    slug: product.slug,
    priceInUSD: product.priceInUSD,
    imageUrl: resolveProductImage(product),
  })
}

onMounted(loadProducts)
watch(
  () => [props.populateBy, props.limit, props.selectedDocs, props.populatedDocs, props.products],
  loadProducts,
  { deep: true },
)
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
          Catálogo
        </p>
        <h2 class="text-2xl font-semibold tracking-tight text-slate-900">
          {{ sectionTitle }}
        </h2>
      </div>
      <p class="text-sm text-slate-500">
        {{ products.length }} producto{{ products.length === 1 ? '' : 's' }}
      </p>
    </div>

    <div
      v-if="introHtml"
      class="prose-cms mb-6"
      v-html="introHtml"
    />

    <p v-if="loading" class="text-sm text-slate-500">
      Cargando productos...
    </p>
    <p v-else-if="error" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ error }}
    </p>
    <p v-else-if="products.length === 0" class="text-sm text-slate-500">
      No hay productos destacados para este bloque.
    </p>

    <div
      v-else
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <article
        v-for="product in products"
        :key="product.id"
        class="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition hover:border-indigo-200 hover:shadow-md"
      >
        <RouterLink
          :to="getProductPath(product.slug)"
          class="aspect-[4/3] bg-slate-200"
        >
          <img
            v-if="resolveProductImage(product)"
            :src="resolveProductImage(product)!"
            :alt="product.title"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-sm text-slate-500"
          >
            Sin imagen
          </div>
        </RouterLink>

        <div class="flex flex-1 flex-col gap-3 p-4 text-left">
          <div>
            <RouterLink
              :to="getProductPath(product.slug)"
              class="text-lg font-semibold text-slate-900 transition hover:text-indigo-700"
            >
              {{ product.title }}
            </RouterLink>
            <p class="mt-1 text-sm text-slate-500">
              {{ product.slug || 'producto' }}
            </p>
          </div>

          <div class="mt-auto flex items-center justify-between gap-3">
            <p class="text-base font-semibold text-indigo-700">
              {{
                typeof product.priceInUSD === 'number'
                  ? new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(product.priceInUSD / 100)
                  : 'Consultar'
              }}
            </p>
            <button
              type="button"
              class="rounded-full bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500"
              @click="addProduct(product)"
            >
              Añadir
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
