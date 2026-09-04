<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useCarouselProducts, type CarouselProductSource } from '@/composables/useCarouselProducts'
import RichText from '@/components/RichText.vue'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/services/payloadService'
import {
  formatProductPrice,
  getProductImageUrl,
  getProductPath,
  getProductShortDescription,
  hasProductShortDescription,
  isNewProduct,
  type ProductRef,
} from '@/utils/product'

const props = withDefaults(
  defineProps<{
    title?: string | null
    description?: string | null
    populateBy?: 'collection' | 'selection' | null
    limit?: number | null
    categories?: CarouselProductSource['categories']
    selectedDocs?: ProductRef[] | null
    populatedDocs?: ProductRef[] | null
    products?: Array<number | Product> | null
    blockName?: string | null
  }>(),
  {
    title: null,
    description: null,
    populateBy: 'collection',
    limit: 10,
    categories: null,
    selectedDocs: null,
    populatedDocs: null,
    products: null,
    blockName: null,
  },
)

const cart = useCartStore()
const scroller = ref<HTMLElement | null>(null)

const source = computed<CarouselProductSource>(() => ({
  populateBy: props.populateBy,
  limit: props.limit,
  categories: props.categories,
  selectedDocs: props.selectedDocs,
  populatedDocs: props.populatedDocs,
  products: props.products,
}))

const { products: carouselProducts, loading, error } = useCarouselProducts(source)

const heading = computed(() => props.title || props.blockName || 'Productos destacados')

type CarouselSlide = {
  key: string
  product: Product
  setIndex: number
}

/** Tres copias del listado para poder saltar al set central al llegar a un extremo. */
const loopSlides = computed<CarouselSlide[]>(() => {
  const products = carouselProducts.value
  if (products.length === 0) return []

  return [0, 1, 2].flatMap((setIndex) =>
    products.map((product) => ({
      key: `${setIndex}-${product.id}`,
      product,
      setIndex,
    })),
  )
})

const canLoop = computed(() => carouselProducts.value.length > 0)

const isDragging = ref(false)
const dragMoved = ref(false)
let dragStartX = 0
let dragScrollLeft = 0
let isJumping = false
let dragVelocity = 0
let lastPointerX = 0
let lastPointerTime = 0
let momentumFrame: number | null = null

const FRICTION = 0.92
const MIN_VELOCITY = 0.35
const SNAP_DURATION_MS = 420

const getGap = (el: HTMLElement) => {
  const styles = window.getComputedStyle(el)
  return Number.parseFloat(styles.columnGap || styles.gap || '0') || 0
}

const getCardStep = (el: HTMLElement) => {
  const card = el.querySelector<HTMLElement>('[data-carousel-card]')
  if (!card) return 320
  return card.offsetWidth + getGap(el)
}

const getSetWidth = (el: HTMLElement) => {
  const count = carouselProducts.value.length
  if (count === 0) return 0
  return getCardStep(el) * count
}

const cancelMomentum = () => {
  if (momentumFrame != null) {
    cancelAnimationFrame(momentumFrame)
    momentumFrame = null
  }
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

const animateScrollTo = (el: HTMLElement, target: number, duration = SNAP_DURATION_MS) =>
  new Promise<void>((resolve) => {
    cancelMomentum()
    let start = el.scrollLeft
    let distance = target - start
    if (Math.abs(distance) < 1) {
      el.scrollLeft = target
      resolve()
      return
    }

    const startTime = performance.now()

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const desired = start + distance * easeOutCubic(progress)
      el.scrollLeft = desired
      const beforeNormalize = el.scrollLeft
      normalizeInfiniteScroll()
      const jump = el.scrollLeft - beforeNormalize
      if (jump !== 0) {
        start += jump
      }

      if (progress < 1) {
        momentumFrame = requestAnimationFrame(step)
        return
      }

      momentumFrame = null
      normalizeInfiniteScroll()
      resolve()
    }

    momentumFrame = requestAnimationFrame(step)
  })

const snapToNearestCard = (el: HTMLElement, extraOffset = 0) => {
  const step = getCardStep(el)
  if (step <= 0) return

  const target = Math.round((el.scrollLeft + extraOffset) / step) * step
  return animateScrollTo(el, target)
}

const centerOnMiddleSet = async () => {
  await nextTick()
  const el = scroller.value
  if (!el || !canLoop.value) return

  cancelMomentum()
  isJumping = true
  el.scrollLeft = getSetWidth(el)
  requestAnimationFrame(() => {
    isJumping = false
  })
}

const normalizeInfiniteScroll = () => {
  const el = scroller.value
  if (!el || !canLoop.value || isJumping) return

  const setWidth = getSetWidth(el)
  if (setWidth <= 0) return

  // Si estamos en el set inicial o final, saltamos al set central equivalente.
  if (el.scrollLeft <= setWidth * 0.05) {
    isJumping = true
    el.scrollLeft += setWidth
    if (isDragging.value) {
      dragScrollLeft += setWidth
    }
    requestAnimationFrame(() => {
      isJumping = false
    })
  } else if (el.scrollLeft >= setWidth * 1.95) {
    isJumping = true
    el.scrollLeft -= setWidth
    if (isDragging.value) {
      dragScrollLeft -= setWidth
    }
    requestAnimationFrame(() => {
      isJumping = false
    })
  }
}

const scrollByCard = (direction: -1 | 1) => {
  const el = scroller.value
  if (!el) return
  cancelMomentum()
  const target = el.scrollLeft + getCardStep(el) * direction
  void animateScrollTo(el, target)
}

const runMomentum = (el: HTMLElement) => {
  cancelMomentum()

  const tick = () => {
    if (Math.abs(dragVelocity) < MIN_VELOCITY) {
      momentumFrame = null
      void snapToNearestCard(el)
      return
    }

    el.scrollLeft += dragVelocity
    dragVelocity *= FRICTION
    normalizeInfiniteScroll()
    momentumFrame = requestAnimationFrame(tick)
  }

  momentumFrame = requestAnimationFrame(tick)
}

const onPointerDown = (event: PointerEvent) => {
  // Arrastre solo con mouse / pen; el touch nativo ya hace scroll.
  if (event.pointerType === 'touch') return
  const el = scroller.value
  if (!el) return

  cancelMomentum()
  isDragging.value = true
  dragMoved.value = false
  dragStartX = event.clientX
  dragScrollLeft = el.scrollLeft
  dragVelocity = 0
  lastPointerX = event.clientX
  lastPointerTime = performance.now()
  el.setPointerCapture(event.pointerId)
  el.classList.add('is-dragging')
}

const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return
  const el = scroller.value
  if (!el) return

  const now = performance.now()
  const delta = event.clientX - dragStartX
  if (Math.abs(delta) > 4) dragMoved.value = true

  const dt = Math.max(now - lastPointerTime, 1)
  // Velocidad en px/frame (~60fps) para la inercia al soltar.
  dragVelocity = ((lastPointerX - event.clientX) / dt) * 16
  lastPointerX = event.clientX
  lastPointerTime = now

  el.scrollLeft = dragScrollLeft - delta
  normalizeInfiniteScroll()
}

const endDrag = (event: PointerEvent) => {
  if (!isDragging.value) return
  const el = scroller.value
  isDragging.value = false
  el?.classList.remove('is-dragging')

  if (el?.hasPointerCapture(event.pointerId)) {
    el.releasePointerCapture(event.pointerId)
  }

  if (!el) return

  normalizeInfiniteScroll()

  if (Math.abs(dragVelocity) > MIN_VELOCITY) {
    runMomentum(el)
  } else if (dragMoved.value) {
    void snapToNearestCard(el)
  }
}

const onCardClick = (event: MouseEvent) => {
  // Evita navegar al producto si el usuario arrastró el carrusel.
  if (dragMoved.value) {
    event.preventDefault()
    event.stopPropagation()
    dragMoved.value = false
  }
}

const addProduct = (product: Product) => {
  cart.addToCart({
    id: product.id,
    title: product.title,
    slug: product.slug,
    priceInUSD: product.priceInUSD,
    imageUrl: getProductImageUrl(product),
  })
}

const onScroll = () => {
  normalizeInfiniteScroll()
}

watch(carouselProducts, () => {
  centerOnMiddleSet()
})

onMounted(() => {
  centerOnMiddleSet()
  window.addEventListener('resize', centerOnMiddleSet)
})

onBeforeUnmount(() => {
  cancelMomentum()
  window.removeEventListener('resize', centerOnMiddleSet)
})
</script>

<template>
  <section class="w-full border-y border-slate-200 bg-slate-50 py-16 sm:py-24">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <h2 class="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {{ heading }}
          </h2>
          <p
            v-if="description"
            class="mt-2 text-base text-slate-600"
          >
            {{ description }}
          </p>
        </div>
        <div class="hidden space-x-2 md:flex">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-900 transition-colors hover:bg-slate-100"
            aria-label="Anterior"
            @click="scrollByCard(-1)"
          >
            ←
          </button>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-900 transition-colors hover:bg-slate-100"
            aria-label="Siguiente"
            @click="scrollByCard(1)"
          >
            →
          </button>
        </div>
      </div>

      <p
        v-if="loading"
        class="text-sm text-slate-500"
      >
        Cargando productos...
      </p>
      <p
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
      >
        {{ error }}
      </p>
      <p
        v-else-if="carouselProducts.length === 0"
        class="text-sm text-slate-500"
      >
        No hay productos para este carousel.
      </p>

      <div
        v-else
        ref="scroller"
        class="carousel-scroller hide-scroll flex cursor-grab gap-6 overflow-x-auto pb-8 active:cursor-grabbing"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="endDrag"
        @pointercancel="endDrag"
        @scroll.passive="onScroll"
      >
        <article
          v-for="slide in loopSlides"
          :key="slide.key"
          data-carousel-card
          class="group relative min-w-[280px] rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md md:min-w-[320px]"
          @click.capture="onCardClick"
        >
          <div
            v-if="isNewProduct(slide.product)"
            class="absolute top-4 left-4 z-10"
          >
            <span class="rounded bg-slate-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
              New
            </span>
          </div>

          <RouterLink
            :to="getProductPath(slide.product.slug)"
            class="block aspect-[4/5] overflow-hidden rounded-t-lg bg-slate-100"
            draggable="false"
          >
            <img
              v-if="getProductImageUrl(slide.product)"
              :src="getProductImageUrl(slide.product)!"
              :alt="slide.product.title"
              draggable="false"
              class="pointer-events-none h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <div
              v-else
              class="flex h-full items-center justify-center text-sm text-slate-400"
            >
              Sin imagen
            </div>
          </RouterLink>

          <div class="p-6">
            <RouterLink
              :to="getProductPath(slide.product.slug)"
              class="mb-1 block text-[20px] leading-tight font-semibold text-slate-900"
              draggable="false"
            >
              {{ slide.product.title }}
            </RouterLink>
            <p
              v-if="hasProductShortDescription(slide.product)"
              class="prose-cms mb-4 line-clamp-3 text-base text-slate-500 [&_p:last-child]:mb-0"
            >
              <RichText :data="getProductShortDescription(slide.product)" />
            </p>
            <div class="flex items-center justify-between">
              <span class="text-base font-semibold text-slate-900">
                {{ formatProductPrice(slide.product.priceInUSD) }}
              </span>
              <button
                type="button"
                class="p-2 text-slate-900 transition-colors hover:text-slate-600"
                aria-label="Añadir al carrito"
                @click="addProduct(slide.product)"
              >
                +
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.carousel-scroller {
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
}

.carousel-scroller.is-dragging {
  user-select: none;
  cursor: grabbing;
}

.carousel-scroller.is-dragging a,
.carousel-scroller.is-dragging button {
  pointer-events: none;
}
</style>
