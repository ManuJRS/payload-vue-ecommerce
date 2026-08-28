<script setup lang="ts">
const sizes = ['S', 'M', 'L', 'XL']
const selectedSize = 'M'
</script>

<template>
  <section>
    <button
      type="button"
      class="group mb-3 flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-slate-700"
    >
      <span>Talla</span>
      <span class="text-slate-400 transition group-hover:text-slate-700">▾</span>
    </button>
    <div class="flex flex-wrap gap-2 pl-1">
      <button
        v-for="size in sizes"
        :key="size"
        type="button"
        disabled
        class="flex h-10 w-10 items-center justify-center rounded border text-sm transition"
        :class="
          size === selectedSize
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-slate-300 text-slate-700'
        "
      >
        {{ size }}
      </button>
    </div>
  </section>
  <hr class="border-slate-200">
</template>
