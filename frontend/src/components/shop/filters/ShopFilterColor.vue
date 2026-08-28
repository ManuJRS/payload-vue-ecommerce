<script setup lang="ts">
const colors = [
  { label: 'Negro', class: 'bg-black' },
  { label: 'Blanco', class: 'bg-white ring-2 ring-slate-900 ring-offset-2' },
  { label: 'Azul marino', class: 'bg-[#1e3a8a]' },
  { label: 'Gris piedra', class: 'bg-[#78716c]' },
  { label: 'Verde bosque', class: 'bg-[#064e3b]' },
]
</script>

<template>
  <section>
    <button
      type="button"
      class="group mb-3 flex w-full items-center justify-between text-left text-xs font-semibold uppercase tracking-wider text-slate-700"
    >
      <span>Color</span>
      <span class="text-slate-400 transition group-hover:text-slate-700">▾</span>
    </button>
    <div class="mt-2 flex flex-wrap gap-3 pl-1">
      <button
        v-for="color in colors"
        :key="color.label"
        type="button"
        disabled
        :aria-label="color.label"
        class="h-6 w-6 rounded-full border border-slate-300 transition hover:ring-2 hover:ring-slate-300 hover:ring-offset-2"
        :class="color.class"
      />
    </div>
  </section>
</template>
