<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useCarouselProducts, type CarouselProductSource } from '@/composables/useCarouselProducts'
import RichText from '@/components/RichText.vue'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/services/payloadService'
import {
  formatProductPrice,
  getProductImageUrl,
  getProductPath,
  getProductShortDescription,
  hasProductShortDescription,
  isNewProduct,
  type ProductRef,
} from '@/utils/product'

const props = withDefaults(
  defineProps<{
    title?: string | null
    description?: string | null
    populateBy?: 'collection' | 'selection' | null
    limit?: number | null
    categories?: CarouselProductSource['categories']
    selectedDocs?: ProductRef[] | null
    populatedDocs?: ProductRef[] | null
    products?: Array<number | Product> | null
    blockName?: string | null
  }>(),
  {
    title: null,
    description: null,
    populateBy: 'collection',
    limit: 10,
    categories: null,
    selectedDocs: null,
    populatedDocs: null,
    products: null,
    blockName: null,
  },
)

const cart = useCartStore()
const scroller = ref<HTMLElement | null>(null)

const source = computed<CarouselProductSource>(() => ({
  populateBy: props.populateBy,
  limit: props.limit,
  categories: props.categories,
  selectedDocs: props.selectedDocs,
  populatedDocs: props.populatedDocs,
  products: props.products,
}))

const { products: carouselProducts, loading, error } = useCarouselProducts(source)

const heading = computed(() => props.title || props.blockName || 'Productos destacados')

const scrollByCard = (direction: -1 | 1) => {
  const el = scroller.value
  if (!el) return
  const card = el.querySelector<HTMLElement>('[data-carousel-card]')
  const amount = (card?.offsetWidth ?? 320) + 24
  el.scrollBy({ left: amount * direction, behavior: 'smooth' })
}

const addProduct = (product: Product) => {
  cart.addToCart({
    id: product.id,
    title: product.title,
    slug: product.slug,
    priceInUSD: product.priceInUSD,
    imageUrl: getProductImageUrl(product),
  })
}
</script>

<template>
  <section class="w-full border-y border-slate-200 bg-slate-50 py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {{ heading }}
          </h2>
          <p
            v-if="description"
            class="mt-2 text-base text-slate-600"
          >
            {{ description }}
          </p>
        </div>
        <div class="hidden space-x-2 md:flex">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-900 transition-colors hover:bg-slate-100"
            aria-label="Anterior"
            @click="scrollByCard(-1)"
          >
            ←
          </button>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-900 transition-colors hover:bg-slate-100"
            aria-label="Siguiente"
            @click="scrollByCard(1)"
          >
            →
          </button>
        </div>
      </div>

      <p
        v-if="loading"
        class="text-sm text-slate-500"
      >
        Cargando productos...
      </p>
      <p
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ error }}
      </p>
      <p
        v-else-if="carouselProducts.length === 0"
        class="text-sm text-slate-500"
      >
        No hay productos para este carousel.
      </p>

      <div
        v-else
        ref="scroller"
        class="hide-scroll flex snap-x gap-6 overflow-x-auto pb-8"
      >
        <article
          v-for="product in carouselProducts"
          :key="product.id"
          data-carousel-card
          class="group relative min-w-[280px] snap-start rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md md:min-w-[320px]"
        >
          <div
            v-if="isNewProduct(product)"
            class="absolute top-4 left-4 z-10"
          >
            <span class="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
              New
            </span>
          </div>

          <RouterLink
            :to="getProductPath(product.slug)"
            class="block aspect-[4/5] overflow-hidden rounded-t-lg bg-slate-100"
          >
            <img
              v-if="getProductImageUrl(product)"
              :src="getProductImageUrl(product)!"
              :alt="product.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div
              v-else
              class="flex h-full items-center justify-center text-sm text-slate-400"
            >
              Sin imagen
            </div>
          </RouterLink>

          <div class="p-6">
            <RouterLink
              :to="getProductPath(product.slug)"
              class="mb-1 block text-[20px] leading-tight font-semibold text-slate-900"
            >
              {{ product.title }}
            </RouterLink>
            <p
              v-if="hasProductShortDescription(product)"
              class="prose-cms mb-4 line-clamp-3 text-base text-slate-500 [&_p:last-child]:mb-0"
            >
              <RichText :data="getProductShortDescription(product)" />
            </p>
            <div class="flex items-center justify-between">
              <span class="text-base font-semibold text-slate-900">
                {{ formatProductPrice(product.priceInUSD) }}
              </span>
              <button
                type="button"
                class="p-2 text-slate-900 transition-colors hover:text-slate-600"
                aria-label="Añadir al carrito"
                @click="addProduct(product)"
              >
                +
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
