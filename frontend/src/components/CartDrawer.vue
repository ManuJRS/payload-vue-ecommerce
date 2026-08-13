<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const open = defineModel<boolean>('open', { default: false })

const cart = useCartStore()

const formattedSubtotal = computed(() =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(cart.subtotal / 100),
)

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100)

const close = () => {
  open.value = false
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}

watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50"
      :class="open ? 'pointer-events-auto' : 'pointer-events-none'"
      aria-live="polite"
    >
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <button
          v-if="open"
          type="button"
          class="absolute inset-0 bg-slate-900/40"
          aria-label="Cerrar carrito"
          @click="close"
        />
      </Transition>

      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-250 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <aside
          v-if="open"
          class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
        >
          <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 id="cart-drawer-title" class="text-lg font-semibold text-slate-900">
                Tu carrito
              </h2>
              <p class="text-sm text-slate-500">
                {{ cart.itemCount }} artículo{{ cart.itemCount === 1 ? '' : 's' }}
              </p>
            </div>

            <button
              type="button"
              class="rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              @click="close"
            >
              Cerrar
            </button>
          </div>

          <div class="flex-1 overflow-y-auto px-5 py-4">
            <p
              v-if="cart.items.length === 0"
              class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500"
            >
              Tu carrito está vacío.
            </p>

            <ul
              v-else
              class="flex flex-col gap-4"
            >
              <li
                v-for="item in cart.items"
                :key="item.id"
                class="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
              >
                <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                  <img
                    v-if="item.imageUrl"
                    :src="item.imageUrl"
                    :alt="item.title"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-full items-center justify-center text-[10px] text-slate-500"
                  >
                    Sin imagen
                  </div>
                </div>

                <div class="flex min-w-0 flex-1 flex-col gap-2">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <RouterLink
                        v-if="item.slug"
                        :to="`/productos/${item.slug}`"
                        class="block truncate font-medium text-slate-900 hover:text-indigo-700"
                        @click="close"
                      >
                        {{ item.title }}
                      </RouterLink>
                      <p
                        v-else
                        class="truncate font-medium text-slate-900"
                      >
                        {{ item.title }}
                      </p>
                      <p class="text-sm text-indigo-700">
                        {{ formatPrice(item.price) }}
                      </p>
                    </div>

                    <button
                      type="button"
                      class="text-xs font-medium text-rose-600 hover:text-rose-500"
                      @click="cart.removeFromCart(item.id)"
                    >
                      Quitar
                    </button>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="h-8 w-8 rounded-full border border-slate-300 text-slate-700 transition hover:bg-white"
                      aria-label="Disminuir cantidad"
                      @click="cart.updateQuantity(item.id, item.quantity - 1)"
                    >
                      −
                    </button>
                    <span class="min-w-8 text-center text-sm font-medium text-slate-900">
                      {{ item.quantity }}
                    </span>
                    <button
                      type="button"
                      class="h-8 w-8 rounded-full border border-slate-300 text-slate-700 transition hover:bg-white"
                      aria-label="Aumentar cantidad"
                      @click="cart.updateQuantity(item.id, item.quantity + 1)"
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="border-t border-slate-200 px-5 py-4">
            <div class="mb-4 flex items-center justify-between text-sm">
              <span class="text-slate-600">Subtotal</span>
              <span class="text-base font-semibold text-slate-900">
                {{ formattedSubtotal }}
              </span>
            </div>

            <div class="flex flex-col gap-2">
              <button
                type="button"
                class="rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                :disabled="cart.items.length === 0"
              >
                Continuar al checkout
              </button>
              <button
                v-if="cart.items.length > 0"
                type="button"
                class="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                @click="cart.clearCart()"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </aside>
      </Transition>
    </div>
  </Teleport>
</template>
