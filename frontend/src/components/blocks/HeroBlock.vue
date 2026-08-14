<script setup lang="ts">
import { computed } from 'vue'
import type { LexicalRichText, MediaRef, PageHero } from '@/types/blocks'
import { lexicalToHtml, lexicalToPlainText } from '@/utils/lexical'
import { getMediaUrl } from '@/utils/media'

const props = withDefaults(
  defineProps<{
    heading?: string | null
    subheading?: string | null
    title?: string | null
    type?: PageHero['type']
    richText?: LexicalRichText
    content?: LexicalRichText
    media?: number | MediaRef
    blockName?: string | null
    style?: string | null
  }>(),
  {
    heading: null,
    subheading: null,
    title: null,
    type: 'lowImpact',
    richText: null,
    content: null,
    media: null,
    blockName: null,
    style: null,
  },
)

const sourceRichText = computed(() => props.richText || props.content)

const resolvedHeading = computed(
  () =>
    props.heading ||
    props.title ||
    props.blockName ||
    lexicalToPlainText(sourceRichText.value) ||
    'Bienvenido',
)

const resolvedSubheading = computed(() => {
  if (props.subheading) return props.subheading
  if (props.heading || props.title) return lexicalToPlainText(sourceRichText.value)
  return 'Explora productos, colecciones y contenido administrado desde Payload CMS.'
})

const richTextHtml = computed(() => lexicalToHtml(sourceRichText.value))
const mediaUrl = computed(() => getMediaUrl(props.media))
const isMedium = computed(() => props.type === 'medium')
const heroHeightClass = computed(() => (isMedium.value ? 'min-h-[50vh]' : 'min-h-svh'))
</script>

<template>
  <section
    class="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-emerald-950 text-white"
    :class="heroHeightClass"
  >
    <div
      v-if="mediaUrl"
      class="absolute inset-0"
      aria-hidden="true"
    >
      <img :src="mediaUrl" :alt="resolvedHeading" class="h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-indigo-950/70 to-emerald-900/40" />
    </div>

    <div
      class="relative z-10 mx-auto flex w-full max-w-6xl flex-col justify-end gap-4 px-6 py-16 sm:px-10 sm:py-24"
      :class="heroHeightClass"
    >
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
        Payload Commerce
      </p>
      <h1 class="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
        {{ resolvedHeading }}
      </h1>
      <p class="max-w-2xl text-base text-slate-200 sm:text-lg">
        {{ resolvedSubheading }}
      </p>
      <div
        v-if="richTextHtml && (heading || title || blockName)"
        class="prose-cms max-w-2xl text-slate-200 [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_p]:text-slate-200"
        v-html="richTextHtml"
      />
    </div>
  </section>
</template>
