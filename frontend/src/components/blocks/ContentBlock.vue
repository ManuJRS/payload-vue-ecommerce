<script setup lang="ts">
import { computed } from 'vue'
import type { LexicalRichText } from '@/types/blocks'
import { lexicalToHtml } from '@/utils/lexical'

type ContentColumn = {
  id?: string | null
  size?: 'oneThird' | 'half' | 'twoThirds' | 'full' | null
  richText?: LexicalRichText
  enableLink?: boolean | null
  link?: {
    url?: string | null
    label?: string | null
    newTab?: boolean | null
  } | null
}

const props = withDefaults(
  defineProps<{
    columns?: ContentColumn[] | null
    richText?: LexicalRichText
    html?: string | null
    blockName?: string | null
  }>(),
  {
    columns: null,
    richText: null,
    html: null,
    blockName: null,
  },
)

const sizeClass = (size?: ContentColumn['size']) => {
  switch (size) {
    case 'oneThird':
      return 'md:col-span-4'
    case 'half':
      return 'md:col-span-6'
    case 'twoThirds':
      return 'md:col-span-8'
    case 'full':
    default:
      return 'md:col-span-12'
  }
}

const fallbackHtml = computed(() => props.html || lexicalToHtml(props.richText))
const hasColumns = computed(() => Boolean(props.columns?.length))
</script>

<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <p
      v-if="blockName"
      class="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600"
    >
      {{ blockName }}
    </p>

    <div v-if="hasColumns" class="grid grid-cols-1 gap-6 md:grid-cols-12">
      <article
        v-for="(column, index) in columns"
        :key="column.id || index"
        class="col-span-12"
        :class="sizeClass(column.size)"
      >
        <div
          class="prose-cms"
          v-html="lexicalToHtml(column.richText)"
        />
        <a
          v-if="column.enableLink && column.link?.url && column.link?.label"
          :href="column.link.url"
          class="mt-4 inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          :target="column.link.newTab ? '_blank' : undefined"
          :rel="column.link.newTab ? 'noopener noreferrer' : undefined"
        >
          {{ column.link.label }}
        </a>
      </article>
    </div>

    <div
      v-else-if="fallbackHtml"
      class="prose-cms"
      v-html="fallbackHtml"
    />

    <p v-else class="text-sm text-slate-500">
      Este bloque de contenido aún no tiene texto publicado.
    </p>
  </section>
</template>
