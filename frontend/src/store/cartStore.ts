import { create } from 'zustand'
import { cartService } from '@/services'
import type { CartResponse, AddToCartRequest } from '@/types'

interface CartState {
  cart: CartResponse | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchCart: () => Promise<void>
  addToCart: (data: AddToCartRequest) => Promise<void>
  updateQuantity: (productId: number, quantity: number) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  clearCart: () => Promise<void>
  clearError: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null })
    try {
      const cart = await cartService.getCart()
      set({ cart, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch cart',
        isLoading: false,
      })
    }
  },

  addToCart: async (data: AddToCartRequest) => {
    set({ isLoading: true, error: null })
    try {
      await cartService.addToCart(data)
      // Refresh cart after adding
      await get().fetchCart()
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to add to cart',
        isLoading: false,
      })
      throw error
    }
  },

  updateQuantity: async (productId: number, quantity: number) => {
    set({ isLoading: true, error: null })
    try {
      await cartService.updateCartItem(productId, quantity)
      await get().fetchCart()
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update quantity',
        isLoading: false,
      })
      throw error
    }
  },

  removeItem: async (productId: number) => {
    set({ isLoading: true, error: null })
    try {
      await cartService.removeFromCart(productId)
      await get().fetchCart()
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to remove item',
        isLoading: false,
      })
      throw error
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null })
    try {
      await cartService.clearCart()
      set({ cart: null, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to clear cart',
        isLoading: false,
      })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
