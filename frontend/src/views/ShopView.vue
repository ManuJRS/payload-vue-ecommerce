<script setup lang="ts">
import { ref } from 'vue'
import ShopSidebar from '@/components/shop/ShopSidebar.vue'
import ShopProductGrid from '@/components/shop/ShopProductGrid.vue'
import ShopFilterCategory from '@/components/shop/filters/ShopFilterCategory.vue'
import ShopFilterPrice from '@/components/shop/filters/ShopFilterPrice.vue'
import { provideShopFilters } from '@/composables/useShopFilters'

provideShopFilters()

const mobileFiltersOpen = ref(false)

const handleApplyFilters = () => {
  mobileFiltersOpen.value = false
}
</script>

<template>
  <div class="relative mx-auto flex w-full max-w-6xl flex-grow px-6 py-8">
    <div class="absolute left-0 top-4 z-20 flex w-full justify-between px-6 lg:hidden">
      <button
        type="button"
        class="flex items-center gap-2 rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700"
        @click="mobileFiltersOpen = !mobileFiltersOpen"
      >
        <span aria-hidden="true">☰</span>
        <span>Filtros</span>
      </button>
    </div>

    <div
      v-if="mobileFiltersOpen"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      @click="mobileFiltersOpen = false"
    />

    <div class="flex w-full flex-col gap-8 lg:flex-row">
      <div
        class="fixed inset-y-0 left-0 z-40 w-[min(100%,20rem)] overflow-y-auto border-r border-slate-200 bg-white p-6 shadow-xl transition-transform duration-300 lg:static lg:z-auto lg:mr-8 lg:w-64 lg:translate-x-0 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
        :class="mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
      >
        <ShopSidebar @apply="handleApplyFilters">
          <ShopFilterCategory />
          <ShopFilterPrice />
        </ShopSidebar>
      </div>

      <ShopProductGrid />
    </div>
  </div>
</template>
