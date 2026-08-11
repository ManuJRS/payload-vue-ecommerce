<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { payloadService } from '@/services/payloadService'
import { isExternalHref, resolveNavHref, type NavItem } from '@/utils/nav'

const navItems = ref<NavItem[]>([])
const error = ref<string | null>(null)
const year = new Date().getFullYear()

const loadFooter = async () => {
  try {
    const footer = await payloadService.getFooter()
    navItems.value = Array.isArray(footer.navItems) ? footer.navItems : []
    error.value = null
  } catch (err) {
    navItems.value = []
    error.value = err instanceof Error ? err.message : 'No se pudo cargar el footer.'
  }
}

onMounted(loadFooter)
</script>

<template>
  <footer class="mt-auto border-t border-slate-200 bg-white">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <RouterLink to="/" class="text-base font-semibold tracking-tight text-slate-900">
          Payload <span class="text-indigo-600">Vue</span> Shop
        </RouterLink>

        <nav class="flex flex-wrap items-center gap-2 text-sm text-slate-600">
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
        </nav>
      </div>

      <p
        v-if="error"
        class="text-xs text-rose-600"
      >
        {{ error }}
      </p>

      <p
        v-else-if="navItems.length === 0"
        class="text-xs text-slate-400"
      >
        Aún no hay enlaces en el footer. Configúralos en Payload → Globals → Footer.
      </p>

      <div class="border-t border-slate-100 pt-4 text-xs text-slate-500">
        © {{ year }} Payload Vue Shop. Todos los derechos reservados.
      </div>
    </div>
  </footer>
</template>
