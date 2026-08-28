<script setup lang="ts">
const price = 500
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
      <input
        type="range"
        min="0"
        max="1000"
        :value="price"
        disabled
        class="h-1 w-full cursor-not-allowed appearance-none rounded-lg bg-slate-200 accent-slate-900"
      >
      <div class="mt-2 flex justify-between text-xs text-slate-500">
        <span>$0</span>
        <span>$1000+</span>
      </div>
    </div>
  </section>
  <hr class="border-slate-200">
</template>
