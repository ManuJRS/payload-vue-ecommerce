<script setup lang="ts">
import BlockRenderer from '@/components/blocks/BlockRenderer.vue'
import HeroBlock from '@/components/blocks/HeroBlock.vue'
import { usePageBySlug } from '@/composables/usePageBySlug'

const { pageData, layout, hero, loading, error } = usePageBySlug(() => 'home')
</script>

<template>
  <div class="flex w-full flex-col">
    <div
      v-if="loading"
      class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div class="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        Cargando inicio...
      </div>
    </div>

    <div
      v-else-if="error"
      class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
    >
      <div class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-700">
        {{ error }}
      </div>
    </div>

    <template v-else-if="pageData">
      <HeroBlock
        v-if="hero && hero.type !== 'none'"
        :type="hero.type"
        :tag="hero.tag"
        :title="hero.title"
        :description="hero.description"
        :media="hero.media"
        :primary-button="hero.primaryButton"
        :secondary-button="hero.secondaryButton"
      />

      <div class="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <BlockRenderer
          v-if="layout.length > 0"
          :blocks="layout"
        />

        <div
          v-else
          class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500"
        >
          La página home aún no tiene bloques en
          <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">layout</code>.
        </div>
      </div>
    </template>
  </div>
</template>
