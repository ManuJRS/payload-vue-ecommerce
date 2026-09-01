<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { payloadService, type Category } from '@/services/payloadService'
import { useShopFilters } from '@/composables/useShopFilters'

const filters = useShopFilters()

const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const response = await payloadService.getCategories({ limit: 100, sort: 'title' })
    categories.value = response.docs
  } catch (err) {
    categories.value = []
    error.value = err instanceof Error ? err.message : 'No se pudieron cargar las categorías.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section>
    <button
      type="button"
      class="group mb-3 flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-slate-700"
    >
      <span>Categoría</span>
      <span class="text-slate-400 transition group-hover:text-slate-700">▾</span>
    </button>

    <p
      v-if="loading"
      class="pl-1 text-sm text-slate-500"
    >
      Cargando categorías...
    </p>

    <p
      v-else-if="error"
      class="pl-1 text-sm text-rose-600"
    >
      {{ error }}
    </p>

    <p
      v-else-if="categories.length === 0"
      class="pl-1 text-sm text-slate-500"
    >
      No hay categorías disponibles.
    </p>

    <div
      v-else
      class="space-y-2 pl-1"
    >
      <label
        v-for="category in categories"
        :key="category.id"
        class="group flex cursor-pointer items-center gap-3"
      >
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          :checked="filters.isDraftCategorySelected(category.id)"
          @change="filters.toggleDraftCategory(category.id)"
        >
        <span
          class="text-sm text-slate-500 transition group-hover:text-slate-900"
          :class="filters.isDraftCategorySelected(category.id) ? 'font-medium text-slate-900' : ''"
        >
          {{ category.title }}
        </span>
      </label>
    </div>
  </section>
  <hr class="border-slate-200">
</template>
