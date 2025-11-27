import api from './api'
import type { Review, CreateReviewRequest, ProductRating, PaginatedResponse } from '@/types'

class ReviewService {
  async getProductReviews(productId: number, page = 0, size = 10): Promise<PaginatedResponse<Review>> {
    const response = await api.get<PaginatedResponse<Review>>(
      `/api/reviews/product/${productId}`,
      { params: { page, size } }
    )
    return response.data
  }

  async getProductRating(productId: number): Promise<ProductRating> {
    const response = await api.get<ProductRating>(`/api/reviews/product/${productId}/rating`)
    return response.data
  }

  async createReview(data: CreateReviewRequest): Promise<Review> {
    const response = await api.post<Review>('/api/reviews', data)
    return response.data
  }

  async getMyReviews(page = 0, size = 10): Promise<PaginatedResponse<Review>> {
    const response = await api.get<PaginatedResponse<Review>>('/api/reviews/my-reviews', {
      params: { page, size },
    })
    return response.data
  }

  async deleteReview(id: number): Promise<void> {
    await api.delete(`/api/reviews/${id}`)
  }
}

export default new ReviewService()
