<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import RichText from '@/components/RichText.vue'
import type { LexicalRichText } from '@/types/blocks'
import { lexicalToPlainText } from '@/utils/lexical'

export type ProductInfoAccordionItem = {
  id?: string | number | null
  title: string
  content: LexicalRichText
}

const props = defineProps<{
  items: ProductInfoAccordionItem[]
}>()

const openKey = ref<string | null>(null)

const visibleItems = computed(() =>
  props.items.filter(
    (item) => item.title?.trim() && Boolean(lexicalToPlainText(item.content)),
  ),
)

const getItemKey = (item: ProductInfoAccordionItem, index: number) =>
  String(item.id ?? `${item.title}-${index}`)

watch(
  visibleItems,
  (items) => {
    if (items.length === 0) {
      openKey.value = null
      return
    }

    const currentStillOpen = items.some((item, index) => getItemKey(item, index) === openKey.value)
    if (!currentStillOpen) {
      openKey.value = getItemKey(items[0], 0)
    }
  },
  { immediate: true },
)

const toggleItem = (key: string) => {
  openKey.value = openKey.value === key ? null : key
}
</script>

<template>
  <div
    v-if="visibleItems.length > 0"
    class="border-t border-slate-200"
  >
    <div
      v-for="(item, index) in visibleItems"
      :key="getItemKey(item, index)"
    >
      <button
        type="button"
        class="group flex w-full items-center justify-between border-b border-slate-200 py-4 text-left"
        @click="toggleItem(getItemKey(item, index))"
      >
        <span
          class="text-sm font-semibold uppercase tracking-wide text-slate-900 transition-colors group-hover:text-slate-600"
        >
          {{ item.title }}
        </span>
        <span
          class="text-lg leading-none text-slate-500 transition-colors group-hover:text-slate-700"
          aria-hidden="true"
        >
          {{ openKey === getItemKey(item, index) ? '−' : '+' }}
        </span>
      </button>
      <div
        v-if="openKey === getItemKey(item, index)"
        class="border-b border-slate-200 py-4 text-sm leading-relaxed text-slate-600 sm:text-base"
      >
        <div class="prose-cms [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          <RichText :data="item.content" />
        </div>
      </div>
    </div>
  </div>
</template>
