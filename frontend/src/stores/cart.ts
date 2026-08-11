import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Product } from '@/services/payloadService'

export type CartItem = {
  /** Identificador de línea en el carrito (producto o producto+variante). */
  id: string
  productId: Product['id']
  title: string
  slug?: string | null
  price: number
  quantity: number
  imageUrl?: string | null
}

type AddToCartProduct = Pick<Product, 'id' | 'title' | 'slug' | 'priceInUSD'> & {
  imageUrl?: string | null
}

const getLineId = (productId: Product['id']) => String(productId)

export const useCartStore = defineStore(
  'cart',
  () => {
    const items = ref<CartItem[]>([])

    const itemCount = computed(() =>
      items.value.reduce((total, item) => total + item.quantity, 0),
    )

    const subtotal = computed(() =>
      items.value.reduce((total, item) => total + item.price * item.quantity, 0),
    )

    const addToCart = (product: AddToCartProduct, quantity = 1) => {
      if (quantity <= 0) return

      const lineId = getLineId(product.id)
      const existing = items.value.find((item) => item.id === lineId)

      if (existing) {
        existing.quantity += quantity
        return
      }

      items.value.push({
        id: lineId,
        productId: product.id,
        title: product.title,
        slug: product.slug ?? null,
        price: product.priceInUSD ?? 0,
        quantity,
        imageUrl: product.imageUrl ?? null,
      })
    }

    const removeFromCart = (productId: Product['id'] | string) => {
      const lineId = String(productId)
      items.value = items.value.filter((item) => item.id !== lineId)
    }

    const updateQuantity = (productId: Product['id'] | string, quantity: number) => {
      const lineId = String(productId)

      if (quantity <= 0) {
        removeFromCart(lineId)
        return
      }

      const item = items.value.find((entry) => entry.id === lineId)
      if (!item) return

      item.quantity = quantity
    }

    const clearCart = () => {
      items.value = []
    }

    return {
      items,
      itemCount,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }
  },
  {
    persist: {
      key: 'payload-vue-ecommerce-cart',
      pick: ['items'],
    },
  },
)
