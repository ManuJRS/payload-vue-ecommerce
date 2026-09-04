<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Product } from '@/services/payloadService'
import {
  formatProductPrice,
  getProductCategoryLabel,
  getProductImageUrl,
  getProductPath,
  isNewProduct,
} from '@/utils/product'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  addToCart: [product: Product]
}>()

const imageUrl = () => getProductImageUrl(props.product)
const categoryLabel = () => getProductCategoryLabel(props.product)
const isNew = () => isNewProduct(props.product)
const isLowStock = () =>
  typeof props.product.inventory === 'number' &&
  props.product.inventory > 0 &&
  props.product.inventory <= 10
</script>

<template>
  <article class="group relative flex flex-col rounded-sm bg-white transition-shadow duration-300 hover:shadow-lg">
    <RouterLink
      :to="getProductPath(product.slug)"
      class="relative mb-4 aspect-[3/4] overflow-hidden rounded-sm bg-slate-100"
    >
      <img
        v-if="imageUrl()"
        :src="imageUrl()!"
        :alt="product.title"
        class="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
      >
      <div
        v-else
        class="flex h-full items-center justify-center text-sm text-slate-400"
      >
        Sin imagen
      </div>

      <div
        class="absolute inset-0 flex items-end justify-center bg-black/0 p-4 transition-opacity duration-300 group-hover:bg-black/10"
      >
        <button
          type="button"
          class="w-full translate-y-4 bg-white/95 px-4 py-3 text-sm font-medium text-black opacity-0 transition-all duration-300 hover:bg-slate-900 hover:text-white group-hover:translate-y-0 group-hover:opacity-100"
          @click.prevent="emit('addToCart', product)"
        >
          Añadir al carrito
        </button>
      </div>

      <div
        v-if="isNew() || isLowStock()"
        class="absolute left-3 top-3"
      >
        <span
          v-if="isNew()"
          class="rounded-sm bg-white/90 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900"
        >
          Nuevo
        </span>
        <span
          v-else-if="isLowStock()"
          class="rounded-sm bg-white/90 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900"
        >
          Pocos en stock
        </span>
      </div>
    </RouterLink>

    <div class="flex flex-col gap-1 px-1">
      <h3 class="truncate text-base font-medium text-slate-900">
        {{ product.title }}
      </h3>
      <p
        v-if="categoryLabel()"
        class="text-sm text-slate-500"
      >
        {{ categoryLabel() }}
      </p>
      <p class="mt-1 font-medium text-slate-900">
        {{ formatProductPrice(product.priceInUSD) }}
      </p>
    </div>
  </article>
</template>
