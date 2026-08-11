<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const cartLabel = computed(() => `${cart.itemCount} artículo${cart.itemCount === 1 ? '' : 's'}`)
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <RouterLink to="/" class="text-lg font-semibold tracking-tight text-slate-900">
          Payload <span class="text-indigo-600">Vue</span> Shop
        </RouterLink>

        <nav class="flex items-center gap-3 text-sm font-medium text-slate-600">
          <RouterLink
            to="/"
            class="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-indigo-700"
          >
            Inicio
          </RouterLink>
          <RouterLink
            to="/nosotros"
            class="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-indigo-700"
          >
            Nosotros
          </RouterLink>
          <span class="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
            Carrito · {{ cartLabel }}
          </span>
        </nav>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>
