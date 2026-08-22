<script setup lang="ts">
import { computed } from 'vue'
import type { MediaRef } from '@/types/blocks'
import { getMediaUrl } from '@/utils/media'

type CardItem = {
  id?: string | null
  title?: string | null
  description?: string | null
  svg?: number | MediaRef | null
}

const props = withDefaults(
  defineProps<{
    title?: string | null
    items?: CardItem[] | null
    blockName?: string | null
  }>(),
  {
    title: null,
    items: null,
    blockName: null,
  },
)

const heading = computed(() => props.title || props.blockName || null)

const resolveIconUrl = (svg?: number | MediaRef | null) => getMediaUrl(svg ?? null)
const resolveIconAlt = (item: CardItem) => {
  if (item.svg && typeof item.svg === 'object') {
    return item.svg.alt || item.title || 'Icono'
  }
  return item.title || 'Icono'
}

const cards = computed(() =>
  (props.items ?? []).filter(
    (item) => Boolean(item?.title || item?.description || resolveIconUrl(item?.svg)),
  ),
)
</script>

<template>
  <section
    v-if="heading || cards.length > 0"
    class="w-full bg-slate-100 py-16 sm:py-24"
  >
    <div class="mx-auto max-w-6xl px-6">
      <div
        v-if="heading"
        class="mb-12 text-center"
      >
        <h2 class="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {{ heading }}
        </h2>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <article
          v-for="(item, index) in cards"
          :key="item.id || index"
          class="flex flex-col items-start rounded-xl border border-slate-200/60 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
        >
          <div
            v-if="resolveIconUrl(item.svg)"
            class="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"
          >
            <img
              :src="resolveIconUrl(item.svg)!"
              :alt="resolveIconAlt(item)"
              class="h-6 w-6 object-contain"
            />
          </div>
          <h3
            v-if="item.title"
            class="mb-3 text-[20px] font-semibold leading-tight text-slate-900"
          >
            {{ item.title }}
          </h3>
          <p
            v-if="item.description"
            class="text-base leading-relaxed text-slate-600"
          >
            {{ item.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
