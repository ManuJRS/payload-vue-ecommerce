<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { HeroButton } from '@/types/blocks'
import { isExternalHref, resolveNavHref, type NavLink } from '@/utils/nav'

const props = withDefaults(
  defineProps<{
    title?: string | null
    description?: string | null
    button?: HeroButton | null
    blockName?: string | null
  }>(),
  {
    title: null,
    description: null,
    button: null,
    blockName: null,
  },
)

const heading = computed(() => props.title || props.blockName || null)

const buttonLink = computed((): NavLink | null => {
  const button = props.button
  if (!button?.label) return null
  if (!button.url && !button.reference) return null

  return {
    type: button.type ?? (button.reference ? 'reference' : 'custom'),
    newTab: button.newTab,
    url: button.url,
    label: button.label,
    reference: button.reference,
  }
})

const buttonHref = computed(() => (buttonLink.value ? resolveNavHref(buttonLink.value) : null))
</script>

<template>
  <section
    v-if="heading || description || buttonLink"
    class="my-8 w-full bg-black py-8 text-white"
  >
    <div
      class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row"
    >
      <div class="mb-0 text-center md:text-left">
        <h3
          v-if="heading"
          class="text-xl font-bold tracking-tight text-white sm:text-2xl"
        >
          {{ heading }}
        </h3>
        <p
          v-if="description"
          class="mt-1 text-base text-white/80"
        >
          {{ description }}
        </p>
      </div>

      <template v-if="buttonLink && buttonHref">
        <a
          v-if="isExternalHref(buttonHref)"
          :href="buttonHref"
          class="inline-flex h-10 items-center justify-center rounded bg-white px-6 text-sm font-medium !text-black transition-colors duration-200 hover:bg-slate-100"
          :target="buttonLink.newTab ? '_blank' : undefined"
          :rel="buttonLink.newTab ? 'noopener noreferrer' : undefined"
        >
          {{ buttonLink.label }}
        </a>
        <RouterLink
          v-else
          :to="buttonHref"
          class="inline-flex h-10 items-center justify-center rounded bg-white px-6 text-sm font-medium !text-black transition-colors duration-200 hover:bg-slate-100"
          :target="buttonLink.newTab ? '_blank' : undefined"
          :rel="buttonLink.newTab ? 'noopener noreferrer' : undefined"
        >
          {{ buttonLink.label }}
        </RouterLink>
      </template>
    </div>
  </section>
</template>
