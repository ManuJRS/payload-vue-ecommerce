<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  useArchiveItems,
  type ArchiveDocRef,
  type ArchiveSource,
} from '@/composables/useArchiveItems'
import type { Product } from '@/services/payloadService'

const props = withDefaults(
  defineProps<{
    title?: string | null
    populateBy?: 'collection' | 'selection' | null
    relationTo?: 'products' | 'categories' | null
    limit?: number | null
    categories?: ArchiveSource['categories']
    selectedDocs?: ArchiveDocRef[] | null
    products?: Array<number | Product> | null
    blockName?: string | null
  }>(),
  {
    title: null,
    populateBy: 'collection',
    relationTo: 'products',
    limit: 10,
    categories: null,
    selectedDocs: null,
    products: null,
    blockName: null,
  },
)

const source = computed<ArchiveSource>(() => ({
  title: props.title,
  populateBy: props.populateBy,
  relationTo: props.relationTo,
  limit: props.limit,
  categories: props.categories,
  selectedDocs: props.selectedDocs,
  products: props.products,
}))

const { items, loading, error } = useArchiveItems(source)

const heading = computed(() => props.title || props.blockName || 'Shop by Category')
const emptyMessage = computed(() =>
  props.relationTo === 'categories'
    ? 'No hay categorías para este archive.'
    : 'No hay productos para este archive.',
)

const tileClass = (index: number) => {
  if (index === 0) return 'md:col-span-2 md:row-span-2'
  if (index === 1) return 'md:col-span-2 md:row-span-1'
  return 'md:col-span-1 md:row-span-1'
}

const titleClass = (index: number) => {
  if (index === 0) return 'mb-2 text-3xl font-semibold text-white'
  return 'mb-1 text-[20px] font-semibold text-white'
}
</script>

<template>
  <section class="w-full bg-white py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-6">
      <h2 class="mb-8 text-center text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {{ heading }}
      </h2>

      <p
        v-if="loading"
        class="text-center text-sm text-slate-500"
      >
        Cargando...
      </p>
      <p
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700"
      >
        {{ error }}
      </p>
      <p
        v-else-if="items.length === 0"
        class="text-center text-sm text-slate-500"
      >
        {{ emptyMessage }}
      </p>

      <div
        v-else
        class="grid auto-rows-[250px] grid-cols-1 gap-6 md:grid-cols-4"
      >
        <RouterLink
          v-for="(item, index) in items"
          :key="`${item.kind}-${item.id}`"
          :to="item.href"
          class="group relative overflow-hidden rounded-xl"
          :class="tileClass(index)"
        >
          <div class="absolute inset-0 z-10 bg-black/20 transition-colors duration-300 group-hover:bg-black/10" />
          <img
            v-if="item.imageUrl"
            :src="item.imageUrl"
            :alt="item.title"
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-slate-200 text-sm text-slate-500"
          >
            Sin imagen
          </div>
          <div
            class="absolute z-20"
            :class="index === 0 ? 'bottom-8 left-8' : 'bottom-6 left-6'"
          >
            <h3 :class="titleClass(index)">
              {{ item.title }}
            </h3>
            <span
              v-if="index === 0"
              class="mt-2 inline-block rounded-sm bg-slate-900/40 px-4 py-2 text-sm text-white backdrop-blur-sm transition-colors group-hover:bg-slate-900/60"
            >
              {{ item.kind === 'category' ? 'Explorar categoría' : 'Explorar' }}
            </span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
