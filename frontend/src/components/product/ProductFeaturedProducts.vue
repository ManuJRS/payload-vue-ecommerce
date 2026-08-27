<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { payloadService, type Product } from '@/services/payloadService'
import { formatProductPrice, getProductImageUrl, isProduct } from '@/utils/product'

export type FeaturedProductsBlockData = {
  blockType?: 'featuredProducts' | string
  title?: string | null
  blockName?: string | null
  products?: Array<number | Product> | null
}

const props = withDefaults(
  defineProps<FeaturedProductsBlockData>(),
  {
    title: null,
    blockName: null,
    products: null,
  },
)

const loading = ref(false)
const items = ref<Product[]>([])

const heading = computed(() => props.title || props.blockName || 'Completa el look')

const normalizeProducts = (entries: Array<number | Product | null | undefined> = []) =>
  entries.filter((entry): entry is Product => isProduct(entry))

const loadProducts = async () => {
  const fromProps = normalizeProducts(props.products ?? [])
  if (fromProps.length > 0) {
    items.value = fromProps
    return
  }

  const ids = (props.products ?? [])
    .map((entry) => (typeof entry === 'number' || typeof entry === 'string' ? entry : null))
    .filter((id): id is number | string => id != null)

  if (ids.length === 0) {
    items.value = []
    return
  }

  loading.value = true
  try {
    const response = await payloadService.getProducts({ ids })
    items.value = response.docs
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.products, loadProducts, { immediate: true, deep: true })
</script>

<template>
  <section
    v-if="loading || items.length > 0"
    class="mt-16 border-t border-slate-200 pt-12"
  >
    <h2 class="mb-8 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
      {{ heading }}
    </h2>

    <p
      v-if="loading"
      class="text-sm text-slate-500"
    >
      Cargando productos...
    </p>

    <div
      v-else
      class="grid grid-cols-2 gap-6 md:grid-cols-4"
    >
      <RouterLink
        v-for="item in items"
        :key="item.id"
        :to="item.slug ? `/productos/${item.slug}` : '/'"
        class="group block"
      >
        <div
          class="relative mb-4 aspect-[3/4] overflow-hidden rounded-lg bg-slate-100 transition-shadow duration-300 group-hover:shadow-[0px_10px_30px_-5px_rgba(15,23,42,0.08)]"
        >
          <img
            v-if="getProductImageUrl(item)"
            :src="getProductImageUrl(item)!"
            :alt="item.title"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-sm text-slate-400"
          >
            Sin imagen
          </div>
        </div>
        <h3 class="text-base font-medium text-slate-900">
          {{ item.title }}
        </h3>
        <p class="text-base text-slate-600">
          {{ formatProductPrice(item.priceInUSD) }}
        </p>
      </RouterLink>
    </div>
  </section>
</template>
