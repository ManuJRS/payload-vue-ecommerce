<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import type { PayloadBlock } from '@/types/blocks'
import ContentBlock from './ContentBlock.vue'
import FeaturedProductsBlock from './FeaturedProductsBlock.vue'
import HeroBlock from './HeroBlock.vue'
import MediaBlock from './MediaBlock.vue'

const props = withDefaults(
  defineProps<{
    blocks?: PayloadBlock[] | null
  }>(),
  {
    blocks: () => [],
  },
)

const blockMap: Record<string, Component> = {
  hero: HeroBlock,
  banner: HeroBlock,
  content: ContentBlock,
  contentBlock: ContentBlock,
  mediaBlock: MediaBlock,
  archive: FeaturedProductsBlock,
  carousel: FeaturedProductsBlock,
  threeItemGrid: FeaturedProductsBlock,
  featuredProducts: FeaturedProductsBlock,
}

const safeBlocks = computed(() =>
  Array.isArray(props.blocks) ? props.blocks.filter((block) => Boolean(block?.blockType)) : [],
)

const resolveBlock = (blockType?: string | null) => {
  if (!blockType) return null
  return blockMap[blockType] ?? null
}

const resolvedBlocks = computed(() =>
  safeBlocks.value.map((block, index) => ({
    block,
    index,
    component: resolveBlock(block.blockType),
  })),
)
</script>

<template>
  <div class="flex flex-col">
    <p
      v-if="resolvedBlocks.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500"
    >
      Esta página aún no tiene bloques de contenido publicados.
    </p>

    <template
      v-for="{ block, index, component } in resolvedBlocks"
      :key="block.id || `${block.blockType}-${index}`"
    >
      <component
        :is="component"
        v-if="component"
        v-bind="block"
      />

      <div
        v-else
        class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
      >
        Bloque sin mapear:
        <code class="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
          {{ block.blockType }}
        </code>
      </div>
    </template>
  </div>
</template>
