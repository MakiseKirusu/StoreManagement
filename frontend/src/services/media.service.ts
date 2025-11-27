import api from './api'
import type { ProductMedia } from '@/types'

class MediaService {
  /**
   * Upload an image for a product
   */
  async uploadImage(
    productId: number,
    file: File,
    altText?: string,
    displayOrder?: number
  ): Promise<ProductMedia> {
    const formData = new FormData()
    formData.append('file', file)
    if (altText) formData.append('altText', altText)
    if (displayOrder !== undefined) formData.append('displayOrder', displayOrder.toString())

    const response = await api.post<ProductMedia>(
      `/api/admin/media/products/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }

  /**
   * Upload a video for a product
   */
  async uploadVideo(
    productId: number,
    file: File,
    altText?: string,
    displayOrder?: number
  ): Promise<ProductMedia> {
    const formData = new FormData()
    formData.append('file', file)
    if (altText) formData.append('altText', altText)
    if (displayOrder !== undefined) formData.append('displayOrder', displayOrder.toString())

    const response = await api.post<ProductMedia>(
      `/api/admin/media/products/${productId}/videos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  }

  /**
   * Get all media for a product
   */
  async getProductMedia(productId: number): Promise<ProductMedia[]> {
    const response = await api.get<ProductMedia[]>(`/api/admin/media/products/${productId}`)
    return response.data
  }

  /**
   * Update media metadata (alt text, display order)
   */
  async updateMedia(
    mediaId: number,
    data: { altText?: string; displayOrder?: number }
  ): Promise<ProductMedia> {
    const params = new URLSearchParams()
    if (data.altText !== undefined) params.append('altText', data.altText)
    if (data.displayOrder !== undefined) params.append('displayOrder', data.displayOrder.toString())

    const response = await api.put<ProductMedia>(
      `/api/admin/media/${mediaId}?${params.toString()}`
    )
    return response.data
  }

  /**
   * Delete a media file
   */
  async deleteMedia(mediaId: number): Promise<void> {
    await api.delete(`/api/admin/media/${mediaId}`)
  }
}

export default new MediaService()
