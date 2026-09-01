<script setup lang="ts">
import { computed } from 'vue'
import { useShopFilters } from '@/composables/useShopFilters'

const filters = useShopFilters()

const bounds = computed(() => filters.priceBounds.value)

const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const minPercent = computed(() => {
  const { min, max } = bounds.value
  if (max <= min) return 0
  return ((filters.draftMinPrice.value - min) / (max - min)) * 100
})

const maxPercent = computed(() => {
  const { min, max } = bounds.value
  if (max <= min) return 100
  return ((filters.draftMaxPrice.value - min) / (max - min)) * 100
})

const updateMinPrice = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  filters.draftMinPrice.value = Math.min(value, filters.draftMaxPrice.value)
}

const updateMaxPrice = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value)
  filters.draftMaxPrice.value = Math.max(value, filters.draftMinPrice.value)
}
</script>

<template>
  <section>
    <button
      type="button"
      class="group mb-3 flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-slate-700"
    >
      <span>Rango de precio</span>
      <span class="text-slate-400 transition group-hover:text-slate-700">▾</span>
    </button>

    <div class="mt-4 px-1">
      <p class="mb-4 text-sm font-medium text-slate-700">
        {{ formatPrice(filters.draftMinPrice.value) }} – {{ formatPrice(filters.draftMaxPrice.value) }}
      </p>

      <div class="relative h-6">
        <div class="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-lg bg-slate-200" />
        <div
          class="absolute top-1/2 h-1 -translate-y-1/2 rounded-lg bg-slate-900"
          :style="{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }"
        />
        <input
          type="range"
          :min="bounds.min"
          :max="bounds.max"
          step="1"
          :value="filters.draftMinPrice.value"
          class="range-thumb pointer-events-none absolute inset-0 z-20 h-6 w-full appearance-none bg-transparent"
          @input="updateMinPrice"
        >
        <input
          type="range"
          :min="bounds.min"
          :max="bounds.max"
          step="1"
          :value="filters.draftMaxPrice.value"
          class="range-thumb pointer-events-none absolute inset-0 z-30 h-6 w-full appearance-none bg-transparent"
          @input="updateMaxPrice"
        >
      </div>

      <div class="mt-2 flex justify-between text-xs text-slate-500">
        <span>{{ formatPrice(bounds.min) }}</span>
        <span>{{ formatPrice(bounds.max) }}</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.range-thumb {
  pointer-events: none;
}

.range-thumb::-webkit-slider-thumb {
  pointer-events: auto;
  appearance: none;
  height: 1rem;
  width: 1rem;
  border-radius: 9999px;
  border: 2px solid #0f172a;
  background: #fff;
  cursor: pointer;
}

.range-thumb::-moz-range-thumb {
  pointer-events: auto;
  height: 1rem;
  width: 1rem;
  border-radius: 9999px;
  border: 2px solid #0f172a;
  background: #fff;
  cursor: pointer;
}
</style>
