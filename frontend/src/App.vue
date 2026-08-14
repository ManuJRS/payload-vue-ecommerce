<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import CartDrawer from '@/components/CartDrawer.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import { useCartStore } from '@/stores/cart'
import { payloadService } from '@/services/payloadService'
import { isExternalHref, resolveNavHref, type NavItem } from '@/utils/nav'

const cart = useCartStore()
const navItems = ref<NavItem[]>([])
const navError = ref<string | null>(null)
const isCartOpen = ref(false)

const loadHeader = async () => {
  try {
    const header = await payloadService.getHeader()
    navItems.value = Array.isArray(header.navItems) ? header.navItems : []
    navError.value = null
  } catch (err) {
    navItems.value = []
    navError.value = err instanceof Error ? err.message : 'No se pudo cargar el menú.'
  }
}

onMounted(loadHeader)
</script>

<template>
  <div class="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-900">
    <header class="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <RouterLink to="/" class="text-lg font-semibold tracking-tight text-slate-900">
          Payload <span class="text-indigo-600">Vue</span> Shop
        </RouterLink>

        <nav class="flex flex-wrap items-center justify-end gap-3 text-sm font-medium text-slate-600">
          <template
            v-for="(item, index) in navItems"
            :key="item.id || `${item.link?.label}-${index}`"
          >
            <a
              v-if="item.link?.label && isExternalHref(resolveNavHref(item.link))"
              :href="resolveNavHref(item.link)"
              class="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-indigo-700"
              :target="item.link.newTab ? '_blank' : undefined"
              :rel="item.link.newTab ? 'noopener noreferrer' : undefined"
            >
              {{ item.link.label }}
            </a>

            <RouterLink
              v-else-if="item.link?.label"
              :to="resolveNavHref(item.link)"
              class="rounded-full px-3 py-1.5 transition hover:bg-slate-100 hover:text-indigo-700"
              :target="item.link.newTab ? '_blank' : undefined"
              :rel="item.link.newTab ? 'noopener noreferrer' : undefined"
            >
              {{ item.link.label }}
            </RouterLink>
          </template>

          <button
            type="button"
            class="relative rounded-full bg-emerald-600 px-3 py-1.5 font-medium text-white transition hover:bg-emerald-500"
            aria-label="Abrir carrito"
            @click="isCartOpen = true"
          >
            Carrito
            <span
              class="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-xs font-semibold text-emerald-700"
            >
              {{ cart.itemCount }}
            </span>
          </button>
        </nav>
      </div>

      <p
        v-if="navError"
        class="mx-auto max-w-6xl px-4 pb-3 text-xs text-rose-600 sm:px-6 lg:px-8"
      >
        {{ navError }}
      </p>
    </header>

    <main class="flex-1">
      <RouterView />
    </main>

    <SiteFooter />

    <CartDrawer v-model:open="isCartOpen" />
  </div>
</template>
