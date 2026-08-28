<script setup lang="ts">
const categories = [
  'Ropa de Abrigo',
  'Prendas de Punto',
  'Camisas',
  'Pantalones',
  'Accesorios',
]
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
    <div class="space-y-2 pl-1">
      <label
        v-for="category in categories"
        :key="category"
        class="group flex cursor-pointer items-center gap-3"
      >
        <input
          type="checkbox"
          class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          :checked="category === 'Camisas'"
          disabled
        >
        <span
          class="text-sm transition"
          :class="category === 'Camisas' ? 'font-medium text-slate-900' : 'text-slate-500 group-hover:text-slate-900'"
        >
          {{ category }}
        </span>
      </label>
    </div>
  </section>
  <hr class="border-slate-200">
</template>
