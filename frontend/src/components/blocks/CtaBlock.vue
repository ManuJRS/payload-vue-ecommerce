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
    class="relative w-full overflow-hidden bg-slate-50 py-16 sm:py-24"
  >
    <div
      class="pointer-events-none absolute inset-y-0 right-0 z-0 w-1/2 bg-gradient-to-l from-slate-200/80 to-transparent opacity-50"
    />

    <div class="relative z-10 mx-auto max-w-6xl px-6 text-center">
      <div
        class="mx-auto max-w-2xl rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm sm:p-12"
      >
        <h2
          v-if="heading"
          class="mb-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
        >
          {{ heading }}
        </h2>

        <p
          v-if="description"
          class="mb-8 text-base leading-relaxed text-slate-600 sm:text-lg"
        >
          {{ description }}
        </p>

        <template v-if="buttonLink && buttonHref">
          <a
            v-if="isExternalHref(buttonHref)"
            :href="buttonHref"
            class="inline-flex h-14 w-full items-center justify-center rounded-md bg-black px-10 text-sm font-medium !text-white !font-bold transition-colors duration-200 hover:bg-slate-900 hover:text-white sm:w-auto"
            :target="buttonLink.newTab ? '_blank' : undefined"
            :rel="buttonLink.newTab ? 'noopener noreferrer' : undefined"
          >
            {{ buttonLink.label }}
          </a>
          <RouterLink
            v-else
            :to="buttonHref"
            class="inline-flex h-14 w-full items-center justify-center rounded-md bg-black px-10 text-sm font-medium !text-white !font-bold transition-colors duration-200 hover:bg-slate-900 hover:text-white sm:w-auto"
            :target="buttonLink.newTab ? '_blank' : undefined"
            :rel="buttonLink.newTab ? 'noopener noreferrer' : undefined"
          >
            {{ buttonLink.label }}
          </RouterLink>
        </template>
      </div>
    </div>
  </section>
</template>
