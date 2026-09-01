<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useShopFilters } from '@/composables/useShopFilters'

const emit = defineEmits<{
  apply: []
}>()

const filters = useShopFilters()

const handleApply = () => {
  filters.applyFilters()
  emit('apply')
}
</script>

<template>
  <aside class="flex w-full flex-shrink-0 flex-col lg:sticky lg:top-28 lg:z-10 lg:h-[calc(100vh-120px)] lg:w-64 lg:overflow-y-auto lg:border-r lg:border-slate-200 lg:pr-4 lg:pb-12">
    <nav class="mb-4 flex items-center gap-2 text-sm text-slate-500">
      <RouterLink
        to="/"
        class="transition hover:text-slate-900"
      >
        Inicio
      </RouterLink>
      <span aria-hidden="true">›</span>
      <span class="font-medium text-slate-900">Tienda</span>
    </nav>

    <div class="mb-6">
      <h2 class="mb-1 text-xl font-semibold text-slate-900">
        Filtros
      </h2>
      <p class="text-sm text-slate-500">
        Refina tu búsqueda
      </p>
    </div>

    <div class="space-y-6">
      <slot />
    </div>

    <div class="mt-8 border-t border-slate-200 pt-4">
      <button
        type="button"
        class="w-full rounded-md px-4 py-3 text-sm font-medium text-white transition"
        :class="
          filters.hasPendingChanges
            ? 'bg-slate-900 hover:bg-slate-800'
            : 'cursor-default bg-slate-400'
        "
        @click="handleApply"
      >
        Aplicar filtros
      </button>
    </div>
  </aside>
</template>
