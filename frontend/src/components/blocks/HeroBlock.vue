<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { HeroButton, LexicalRichText, MediaRef, PageHero } from '@/types/blocks'
import { lexicalToPlainText } from '@/utils/lexical'
import { getMediaUrl } from '@/utils/media'
import { isExternalHref, resolveNavHref, type NavLink } from '@/utils/nav'

const props = withDefaults(
  defineProps<{
    heading?: string | null
    subheading?: string | null
    tag?: string | null
    title?: string | null
    description?: string | null
    type?: PageHero['type']
    richText?: LexicalRichText
    content?: LexicalRichText
    media?: number | MediaRef
    primaryButton?: HeroButton | null
    secondaryButton?: HeroButton | null
    links?: Array<{ id?: string | null; link?: NavLink | null }> | null
    blockName?: string | null
    style?: string | null
  }>(),
  {
    heading: null,
    subheading: null,
    tag: null,
    title: null,
    description: null,
    type: 'lowImpact',
    richText: null,
    content: null,
    media: null,
    primaryButton: null,
    secondaryButton: null,
    links: null,
    blockName: null,
    style: null,
  },
)

const sourceRichText = computed(() => props.richText || props.content)

const resolvedTag = computed(() => props.tag || null)

const resolvedTitle = computed(
  () =>
    props.title ||
    props.heading ||
    props.blockName ||
    lexicalToPlainText(sourceRichText.value) ||
    'Bienvenido',
)

const resolvedDescription = computed(
  () => props.description || props.subheading || lexicalToPlainText(sourceRichText.value) || null,
)

const mediaUrl = computed(() => getMediaUrl(props.media))
const isMedium = computed(() => props.type === 'medium')
const heroHeightClass = computed(() => (isMedium.value ? 'min-h-[50vh]' : 'min-h-svh'))

const toNavLink = (button?: HeroButton | null): NavLink | null => {
  const source = button?.label ? button : button?.link
  if (!source?.label) return null

  const hasTarget = Boolean(source.url) || Boolean(source.reference)
  if (!hasTarget) return null

  return {
    type: source.type ?? (source.reference ? 'reference' : 'custom'),
    newTab: source.newTab,
    url: source.url,
    label: source.label,
    reference: source.reference,
  }
}

const buttons = computed(() => {
  const fromFields = [toNavLink(props.primaryButton), toNavLink(props.secondaryButton)].filter(
    (link): link is NavLink => Boolean(link),
  )

  if (fromFields.length > 0) return fromFields

  return (props.links ?? [])
    .map((item) => item.link)
    .filter((link): link is NavLink => Boolean(link?.label))
})
</script>

<template>
  <section
    class="relative flex w-full items-center overflow-hidden bg-slate-100"
    :class="heroHeightClass"
  >
    <div
      v-if="mediaUrl"
      class="absolute inset-0 z-0"
      aria-hidden="true"
    >
      <div
        class="h-full w-full bg-cover bg-center bg-no-repeat opacity-60"
        :style="{ backgroundImage: `url('${mediaUrl}')` }"
        :data-alt="resolvedTitle"
      />
    </div>

    <div class="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 sm:px-10 sm:py-24">
      <div class="max-w-2xl rounded-xl border border-slate-200/60 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
        <span
          v-if="resolvedTag"
          class="mb-4 inline-block rounded-sm bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-slate-800"
        >
          {{ resolvedTag }}
        </span>

        <h1 class="mb-6 text-4xl font-semibold leading-tight tracking-tight text-slate-900 md:text-[64px]">
          {{ resolvedTitle }}
        </h1>

        <p
          v-if="resolvedDescription"
          class="mb-8 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg"
        >
          {{ resolvedDescription }}
        </p>

        <div
          v-if="buttons.length > 0"
          class="flex flex-col gap-4 sm:flex-row"
        >
          <template
            v-for="(button, index) in buttons"
            :key="`${button.label}-${index}`"
          >
            <a
              v-if="isExternalHref(resolveNavHref(button))"
              :href="resolveNavHref(button)"
              class="inline-flex h-12 items-center justify-center rounded px-8 text-sm font-medium transition-colors duration-200"
              :class="
                index === 0
                  ? 'bg-black !text-white hover:bg-slate-900 hover:!text-white'
                  : 'border border-slate-300 text-slate-900 hover:bg-slate-100'
              "
              :target="button.newTab ? '_blank' : undefined"
              :rel="button.newTab ? 'noopener noreferrer' : undefined"
            >
              {{ button.label }}
            </a>
            <RouterLink
              v-else
              :to="resolveNavHref(button)"
              class="inline-flex h-12 items-center justify-center rounded px-8 text-sm font-medium transition-colors duration-200"
              :class="
                index === 0
                  ? 'bg-black !text-white !font-bold hover:bg-slate-900 hover:!text-white'
                  : 'border border-slate-300 text-slate-900 hover:bg-slate-100'
              "
              :target="button.newTab ? '_blank' : undefined"
              :rel="button.newTab ? 'noopener noreferrer' : undefined"
            >
              {{ button.label }}
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>
