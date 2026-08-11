<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { payloadService, type Product } from '@/services/payloadService'
import type { LexicalRichText, MediaRef } from '@/types/blocks'
import { lexicalToHtml } from '@/utils/lexical'
import { getMediaUrl } from '@/utils/media'

const route = useRoute()
const cart = useCartStore()

const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const quantity = ref(1)

const slug = computed(() => String(route.params.slug || ''))

type GalleryItem = {
  url: string
  alt?: string
}

const galleryItems = computed(() => {
  if (!Array.isArray(product.value?.gallery)) return [] as GalleryItem[]

  const items: GalleryItem[] = []

  for (const entry of product.value.gallery) {
    const item = entry as { image?: number | MediaRef | null }
    const url = getMediaUrl(item.image ?? null)
    if (!url) continue

    items.push({
      url,
      alt:
        typeof item.image === 'object' && item.image?.alt
          ? item.image.alt
          : product.value?.title || undefined,
    })
  }

  return items
})

const descriptionHtml = computed(() =>
  lexicalToHtml(product.value?.description as LexicalRichText),
)

const formattedPrice = computed(() => {
  const price = product.value?.priceInUSD
  if (typeof price !== 'number') return 'Consultar precio'

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100)
})

const loadProduct = async () => {
  if (!slug.value) {
    product.value = null
    error.value = 'Slug de producto no válido.'
    return
  }

  loading.value = true
  error.value = null

  try {
    product.value = await payloadService.getProductBySlug(slug.value)
    if (!product.value) {
      error.value = `No se encontró el producto “${slug.value}”.`
    }
  } catch (err) {
    product.value = null
    error.value = err instanceof Error ? err.message : 'Error al cargar el producto.'
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  if (!product.value) return

  cart.addToCart(
    {
      id: product.value.id,
      title: product.value.title,
      slug: product.value.slug,
      priceInUSD: product.value.priceInUSD,
      imageUrl: galleryItems.value[0]?.url ?? null,
    },
    quantity.value,
  )
}

onMounted(loadProduct)
watch(slug, loadProduct)
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
    <RouterLink
      to="/"
      class="w-fit text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
    >
      ← Volver al inicio
    </RouterLink>

    <div
      v-if="loading"
      class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500"
    >
      Cargando producto...
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700"
    >
      {{ error }}
    </div>

    <article
      v-else-if="product"
      class="grid grid-cols-1 gap-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2 lg:p-8"
    >
      <div class="space-y-3">
        <div class="aspect-square overflow-hidden rounded-2xl bg-slate-100">
          <img
            v-if="galleryItems[0]"
            :src="galleryItems[0].url"
            :alt="galleryItems[0].alt || product.title"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-sm text-slate-500"
          >
            Sin imagen
          </div>
        </div>

        <div
          v-if="galleryItems.length > 1"
          class="grid grid-cols-4 gap-2"
        >
          <img
            v-for="(image, index) in galleryItems.slice(0, 4)"
            :key="`${image.url}-${index}`"
            :src="image.url"
            :alt="image.alt || product.title"
            class="aspect-square rounded-xl object-cover"
          />
        </div>
      </div>

      <div class="flex flex-col gap-5 text-left">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
            Producto
          </p>
          <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {{ product.title }}
          </h1>
          <p class="mt-2 text-sm text-slate-500">
            /productos/{{ product.slug }}
          </p>
        </div>

        <p class="text-2xl font-semibold text-indigo-700">
          {{ formattedPrice }}
        </p>

        <div
          v-if="descriptionHtml"
          class="prose-cms"
          v-html="descriptionHtml"
        />
        <p
          v-else
          class="text-sm text-slate-500"
        >
          Este producto aún no tiene descripción.
        </p>

        <div class="mt-auto flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
          <label class="flex items-center gap-2 text-sm text-slate-600">
            Cantidad
            <input
              v-model.number="quantity"
              type="number"
              min="1"
              class="w-20 rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-indigo-400"
            />
          </label>

          <button
            type="button"
            class="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
            @click="addToCart"
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </article>
  </div>
</template>
