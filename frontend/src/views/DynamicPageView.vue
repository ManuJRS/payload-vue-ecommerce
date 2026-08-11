<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BlockRenderer from '@/components/blocks/BlockRenderer.vue'
import HeroBlock from '@/components/blocks/HeroBlock.vue'
import { usePageBySlug } from '@/composables/usePageBySlug'
import { lexicalToPlainText } from '@/utils/lexical'

const route = useRoute()
const pageSlug = computed(() => String(route.params.slug || ''))

const { pageData, layout, hero, loading, error } = usePageBySlug(pageSlug)

const heroHeading = computed(
  () =>
    pageData.value?.title ||
    lexicalToPlainText(hero.value?.richText) ||
    pageSlug.value,
)
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
    <div
      v-if="loading"
      class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500"
    >
      Cargando página...
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700"
    >
      {{ error }}
    </div>

    <template v-else-if="pageData">
      <HeroBlock
        v-if="hero && hero.type !== 'none'"
        :heading="heroHeading"
        :type="hero.type"
        :rich-text="hero.richText"
        :media="hero.media"
      />

      <BlockRenderer
        v-if="layout.length > 0"
        :blocks="layout"
      />

      <div
        v-else
        class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500"
      >
        La página
        <strong class="text-slate-700">{{ pageData.title }}</strong>
        no tiene bloques en
        <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">layout</code>.
      </div>
    </template>
  </div>
</template>
