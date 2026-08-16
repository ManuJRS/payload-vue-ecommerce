<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import RichText from '@/components/RichText.vue'
import type { HeroButton, LexicalRichText, MediaRef } from '@/types/blocks'
import { lexicalToPlainText } from '@/utils/lexical'
import { getMediaUrl } from '@/utils/media'
import { isExternalHref, resolveNavHref, type NavLink } from '@/utils/nav'

const props = withDefaults(
  defineProps<{
    tag?: string | null
    title?: string | null
    description?: LexicalRichText | string | null
    button?: HeroButton | null
    media?: number | MediaRef
    imagePosition?: 'left' | 'right' | null
    blockName?: string | null
  }>(),
  {
    tag: null,
    title: null,
    description: null,
    button: null,
    media: null,
    imagePosition: 'left',
    blockName: null,
  },
)

const mediaUrl = computed(() => getMediaUrl(props.media))
const mediaAlt = computed(() => {
  if (props.media && typeof props.media === 'object') {
    return props.media.alt || props.title || 'Media'
  }
  return props.title || 'Media'
})

const hasDescription = computed(() => Boolean(lexicalToPlainText(props.description)))
const imageOnRight = computed(() => props.imagePosition === 'right')

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
    v-if="tag || title || hasDescription || mediaUrl || buttonLink"
    class="w-full bg-white py-16 sm:py-24"
  >
    <div class="mx-auto max-w-6xl px-6">
      <div class="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div
          class="overflow-hidden rounded-xl aspect-square shadow-lg md:aspect-[4/5]"
          :class="imageOnRight ? 'md:order-2' : 'md:order-1'"
        >
          <img
            v-if="mediaUrl"
            :src="mediaUrl"
            :alt="mediaAlt"
            class="h-full w-full object-cover"
          />
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-400"
          >
            Sin imagen
          </div>
        </div>

        <div
          class="flex flex-col justify-center"
          :class="imageOnRight ? 'md:order-1' : 'md:order-2'"
        >
          <span
            v-if="tag"
            class="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500"
          >
            {{ tag }}
          </span>

          <h2
            v-if="title"
            class="mb-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
          >
            {{ title }}
          </h2>

          <div
            v-if="hasDescription"
            class="prose-cms mb-8 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg [&_p:last-child]:mb-0"
          >
            <RichText :data="description" />
          </div>

          <template v-if="buttonLink && buttonHref">
            <a
              v-if="isExternalHref(buttonHref)"
              :href="buttonHref"
              class="group inline-flex items-center text-base font-medium text-slate-900 transition-colors hover:text-slate-600"
              :target="buttonLink.newTab ? '_blank' : undefined"
              :rel="buttonLink.newTab ? 'noopener noreferrer' : undefined"
            >
              {{ buttonLink.label }}
              <span
                aria-hidden="true"
                class="ml-2 transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </a>
            <RouterLink
              v-else
              :to="buttonHref"
              class="group inline-flex items-center text-base font-medium text-slate-900 transition-colors hover:text-slate-600"
              :target="buttonLink.newTab ? '_blank' : undefined"
              :rel="buttonLink.newTab ? 'noopener noreferrer' : undefined"
            >
              {{ buttonLink.label }}
              <span
                aria-hidden="true"
                class="ml-2 transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
