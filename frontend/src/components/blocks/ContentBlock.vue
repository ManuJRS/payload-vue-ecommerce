<script setup lang="ts">
import { computed } from 'vue'
import RichText from '@/components/RichText.vue'
import type { LexicalRichText } from '@/types/blocks'
import { lexicalToPlainText } from '@/utils/lexical'

const props = withDefaults(
  defineProps<{
    title?: string | null
    richText?: LexicalRichText | string | null
    description?: LexicalRichText | string | null
    blockName?: string | null
  }>(),
  {
    title: null,
    richText: null,
    description: null,
    blockName: null,
  },
)

const source = computed(() => props.richText || props.description)
const hasRichText = computed(() => Boolean(lexicalToPlainText(source.value)))
</script>

<template>
  <section
    v-if="title || hasRichText"
    class="w-full bg-white py-16 sm:py-24"
  >
    <div class="mx-auto max-w-6xl px-6 text-center">
      <div class="mx-auto max-w-3xl">
        <h2
          v-if="title"
          class="mb-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
        >
          {{ title }}
        </h2>
        <div
          v-if="hasRichText"
          class="prose-cms mx-auto max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg [&_p]:mx-auto [&_p:last-child]:mb-0"
        >
          <RichText :data="source" />
        </div>
      </div>
    </div>
  </section>
</template>
