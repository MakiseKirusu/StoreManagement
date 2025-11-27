import api from './api'
import type { CartResponse, AddToCartRequest, CartItem } from '@/types'

class CartService {
  async getCart(): Promise<CartResponse> {
    const response = await api.get<CartResponse>('/api/cart')
    return response.data
  }

  async addToCart(data: AddToCartRequest): Promise<CartItem> {
    const response = await api.post<CartItem>('/api/cart/items', data)
    return response.data
  }

  async updateCartItem(productId: number, quantity: number): Promise<CartItem> {
    const response = await api.put<CartItem>(
      `/api/cart/items/${productId}`,
      null,
      { params: { quantity } }
    )
    return response.data
  }

  async removeFromCart(productId: number): Promise<void> {
    await api.delete(`/api/cart/items/${productId}`)
  }

  async clearCart(): Promise<void> {
    await api.delete('/api/cart')
  }
}

export default new CartService()
