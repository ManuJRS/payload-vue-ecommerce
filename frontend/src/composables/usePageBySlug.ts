import { computed, ref, watch, type Ref } from 'vue'
import { payloadService, type Page } from '@/services/payloadService'
import type { PageHero, PayloadBlock } from '@/types/blocks'

export const usePageBySlug = (slugSource: Ref<string> | (() => string)) => {
  const pageData = ref<Page | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const slug = computed(() =>
    typeof slugSource === 'function' ? slugSource() : slugSource.value,
  )

  const layout = computed(() => (pageData.value?.layout as PayloadBlock[] | null | undefined) ?? [])
  const hero = computed(() => (pageData.value?.hero as PageHero | null | undefined) ?? null)

  const loadPage = async () => {
    const currentSlug = slug.value?.trim()
    if (!currentSlug) {
      pageData.value = null
      error.value = 'Slug de página no válido.'
      return
    }

    loading.value = true
    error.value = null

    try {
      pageData.value = await payloadService.getPageBySlug(currentSlug)
      if (!pageData.value) {
        error.value = `No se encontró la página “${currentSlug}”.`
      }
    } catch (err) {
      pageData.value = null
      error.value = err instanceof Error ? err.message : 'Error al cargar la página.'
    } finally {
      loading.value = false
    }
  }

  watch(slug, loadPage, { immediate: true })

  return {
    pageData,
    layout,
    hero,
    loading,
    error,
    loadPage,
  }
}
