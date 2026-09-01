<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import ProductFeaturedProducts from '@/components/product/ProductFeaturedProducts.vue'
import ProductInfoAccordion, {
  type ProductInfoAccordionItem,
} from '@/components/product/ProductInfoAccordion.vue'
import ProductVariantSelector from '@/components/product/ProductVariantSelector.vue'
import { useProductVariants } from '@/composables/useProductVariants'
import { useCartStore } from '@/stores/cart'
import { payloadService, type Product } from '@/services/payloadService'
import type { LexicalRichText, PayloadBlock } from '@/types/blocks'
import {
  formatProductPrice,
  getProductCategoryLabel,
  isNewProduct,
  SHOP_PATH,
} from '@/utils/product'
import { lexicalToPlainText } from '@/utils/lexical'

const route = useRoute()
const cart = useCartStore()

const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const selectedImageIndex = ref(0)
const wishlisted = ref(false)

const slug = computed(() => String(route.params.slug || ''))

const {
  hasVariants,
  variantTypeGroups,
  selectedVariant,
  selectedVariantLabel,
  activePrice,
  activeShortDescription,
  activeDescription,
  activeGallery,
  canAddToCart,
  selectOption,
  isOptionSelected,
} = useProductVariants(product)

const galleryItems = computed(() => activeGallery.value)

const activeImage = computed(() => galleryItems.value[selectedImageIndex.value] ?? galleryItems.value[0] ?? null)

const shortDescriptionText = computed(() => lexicalToPlainText(activeShortDescription.value as LexicalRichText))

const hasShortDescription = computed(() => Boolean(shortDescriptionText.value))

const hasLongDescription = computed(() =>
  Boolean(lexicalToPlainText(activeDescription.value as LexicalRichText)),
)

const formattedPrice = computed(() => formatProductPrice(activePrice.value))

const categoryLabel = computed(() => getProductCategoryLabel(product.value))

const showNewBadge = computed(() => isNewProduct(product.value))

const accordionItems = computed<ProductInfoAccordionItem[]>(() => {
  const items: ProductInfoAccordionItem[] = []

  if (hasLongDescription.value) {
    items.push({
      id: 'details',
      title: 'Detalles',
      content: activeDescription.value as LexicalRichText,
    })
  }

  for (const item of product.value?.infoAccordion ?? []) {
    if (!item?.title) continue
    items.push({
      id: item.id,
      title: item.title,
      content: item.content ?? null,
    })
  }

  return items
})

watch(selectedVariant, () => {
  selectedImageIndex.value = 0
})

const featuredProductBlocks = computed(() =>
  (product.value?.layout ?? []).filter(
    (block): block is PayloadBlock & { blockType: 'featuredProducts'; products?: Product[] } =>
      block?.blockType === 'featuredProducts',
  ),
)

const loadProduct = async () => {
  if (!slug.value) {
    product.value = null
    error.value = 'Slug de producto no válido.'
    return
  }

  loading.value = true
  error.value = null
  selectedImageIndex.value = 0

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

const selectImage = (index: number) => {
  selectedImageIndex.value = index
}

const addToCart = () => {
  if (!product.value || !canAddToCart.value) return

  cart.addToCart({
    id: product.value.id,
    title: product.value.title,
    slug: product.value.slug,
    priceInUSD: activePrice.value,
    variantId: selectedVariant.value?.id ?? null,
    variantLabel: selectedVariantLabel.value,
    imageUrl: activeImage.value?.url ?? null,
  })
}

onMounted(loadProduct)
watch(slug, loadProduct)
</script>

<template>
  <div class="mx-auto w-full max-w-6xl px-6 py-10 sm:py-16">
    <nav
      aria-label="Migas de pan"
      class="mb-8 text-sm"
    >
      <ol class="flex flex-wrap items-center gap-2 text-slate-600">
        <li>
          <RouterLink
            to="/"
            class="transition hover:text-slate-900"
          >
            Inicio
          </RouterLink>
        </li>
        <li
          aria-hidden="true"
          class="text-slate-400"
        >
          /
        </li>
        <li>
          <RouterLink
            :to="SHOP_PATH"
            class="transition hover:text-slate-900"
          >
            Tienda
          </RouterLink>
        </li>
        <template v-if="product">
          <li
            aria-hidden="true"
            class="text-slate-400"
          >
            /
          </li>
          <li
            class="font-medium text-slate-900"
            aria-current="page"
          >
            {{ product.title }}
          </li>
        </template>
      </ol>
    </nav>

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
      class="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12"
    >
      <!-- Galería -->
      <div class="flex flex-col gap-4 lg:col-span-7 lg:flex-row">
        <div
          v-if="galleryItems.length > 1"
          class="flex shrink-0 gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:w-24 lg:flex-col lg:overflow-visible"
        >
          <button
            v-for="(image, index) in galleryItems"
            :key="`${image.url}-${index}`"
            type="button"
            class="relative h-24 w-20 shrink-0 overflow-hidden rounded-md border transition focus:outline-none lg:h-32 lg:w-full"
            :class="
              selectedImageIndex === index
                ? 'border-slate-900 opacity-100'
                : 'border-transparent opacity-60 hover:opacity-100'
            "
            @click="selectImage(index)"
          >
            <img
              :src="image.url"
              :alt="image.alt || product.title"
              class="h-full w-full object-cover"
            />
          </button>
        </div>

        <div class="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-100">
          <img
            v-if="activeImage"
            :src="activeImage.url"
            :alt="activeImage.alt || product.title"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-sm text-slate-400"
          >
            Sin imagen
          </div>

          <div
            v-if="showNewBadge || categoryLabel"
            class="absolute left-4 top-4 flex flex-wrap gap-2"
          >
            <span
              v-if="showNewBadge"
              class="rounded bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-900 backdrop-blur-sm"
            >
              Novedad
            </span>
            <span
              v-else-if="categoryLabel"
              class="rounded bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-900 backdrop-blur-sm"
            >
              {{ categoryLabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Info -->
      <div class="flex flex-col justify-center lg:col-span-5">
        <div class="mb-6">
          <h1 class="mb-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {{ product.title }}
          </h1>
          <p class="text-xl text-slate-600 sm:text-2xl">
            {{ formattedPrice }}
          </p>
        </div>

        <p
          v-if="hasShortDescription"
          class="mb-8 text-base leading-relaxed text-slate-600 sm:text-lg"
        >
          {{ shortDescriptionText }}
        </p>
        <p
          v-else-if="!hasLongDescription"
          class="mb-8 text-base text-slate-500"
        >
          Este producto aún no tiene descripción.
        </p>

        <ProductVariantSelector
          v-if="hasVariants"
          :groups="variantTypeGroups"
          :is-option-selected="isOptionSelected"
          @select="selectOption"
        />

        <div class="mb-10 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            class="flex flex-1 items-center justify-center gap-2 rounded-md px-8 py-4 text-sm font-semibold uppercase tracking-wider text-white transition-colors"
            :class="
              canAddToCart
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'cursor-not-allowed bg-slate-400'
            "
            :disabled="!canAddToCart"
            @click="addToCart"
          >
            <span>Añadir al carrito</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              class="h-[18px] w-[18px]"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 6h15l-1.5 9h-12z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 6 5 3H2"
              />
              <circle
                cx="9"
                cy="20"
                r="1"
              />
              <circle
                cx="18"
                cy="20"
                r="1"
              />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Añadir a favoritos"
            class="flex items-center justify-center rounded-md border border-slate-300 py-4 text-slate-700 transition-colors hover:border-slate-500 sm:w-16"
            :class="wishlisted ? 'border-rose-300 text-rose-600' : ''"
            @click="wishlisted = !wishlisted"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              :fill="wishlisted ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.8"
              class="h-5 w-5"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 21s-6.5-4.35-9-8.5C1.5 9 3.5 6 6.5 6c1.7 0 3.1 1 3.9 2.2C11.4 7 12.8 6 14.5 6 17.5 6 19.5 9 18 12.5 15.5 16.65 12 21 12 21z"
              />
            </svg>
          </button>
        </div>

        <ProductInfoAccordion :items="accordionItems" />
      </div>
    </article>

    <ProductFeaturedProducts
      v-for="(block, index) in featuredProductBlocks"
      :key="block.id || `featured-products-${index}`"
      :title="block.title as string"
      :block-name="block.blockName"
      :products="block.products"
    />
  </div>
</template>
