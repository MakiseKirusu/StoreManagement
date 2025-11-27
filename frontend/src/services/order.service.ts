import api from './api'
import type { Order, CheckoutRequest, PaginatedResponse, OrderStatus } from '@/types'

class OrderService {
  async checkout(data: CheckoutRequest): Promise<Order> {
    const response = await api.post<Order>('/api/orders/checkout', data)
    return response.data
  }

  async getOrderHistory(page = 0, size = 10): Promise<PaginatedResponse<Order>> {
    const response = await api.get<PaginatedResponse<Order>>('/api/orders', {
      params: { page, size },
    })
    return response.data
  }

  // Alias for consistency
  async getMyOrders(params: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Order>> {
    const { page = 0, size = 10 } = params
    return this.getOrderHistory(page, size)
  }

  async getOrderById(id: number): Promise<Order> {
    const response = await api.get<Order>(`/api/orders/${id}`)
    return response.data
  }

  async cancelOrder(id: number): Promise<Order> {
    const response = await api.post<Order>(`/api/orders/${id}/cancel`)
    return response.data
  }

  // Admin endpoints
  async getAllOrders(params: { page?: number; size?: number } = {}): Promise<PaginatedResponse<Order>> {
    const { page = 0, size = 20 } = params
    const response = await api.get<PaginatedResponse<Order>>('/api/admin/orders', {
      params: { page, size },
    })
    return response.data
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    const response = await api.put<Order>(
      `/api/admin/orders/${id}/status`,
      null,
      { params: { status } }
    )
    return response.data
  }
}

export default new OrderService()
