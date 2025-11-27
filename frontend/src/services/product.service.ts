import api from './api'
import type { Product, Category, PaginatedResponse, ProductSearchParams, Inventory } from '@/types'

class ProductService {
  async getAllProducts(params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    const { page = 0, size = 20, sort = 'name,asc', ...filters } = params
    const response = await api.get<PaginatedResponse<Product>>('/api/public/products', {
      params: { page, size, sort, ...filters },
    })
    return response.data
  }

  async getProductById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/api/public/products/${id}`)
    return response.data
  }

  async searchProducts(keyword: string, params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    const { page = 0, size = 20, sort = 'name,asc' } = params
    const response = await api.get<PaginatedResponse<Product>>('/api/public/products/search', {
      params: { keyword, page, size, sort },
    })
    return response.data
  }

  async getAllCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>('/api/public/categories')
    return response.data
  }

  // Alias methods for consistency with store calls
  async getProducts(params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    return this.getAllProducts(params)
  }

  async getCategories(): Promise<Category[]> {
    return this.getAllCategories()
  }

  async getProductsByCategory(categoryId: number, params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    const { page = 0, size = 20, sort = 'name,asc' } = params
    const response = await api.get<PaginatedResponse<Product>>(`/api/public/categories/${categoryId}/products`, {
      params: { page, size, sort },
    })
    return response.data
  }

  async getProductsByPriceRange(minPrice: number, maxPrice: number, params: ProductSearchParams = {}): Promise<PaginatedResponse<Product>> {
    const { page = 0, size = 20, sort = 'name,asc' } = params
    const response = await api.get<PaginatedResponse<Product>>('/api/public/products', {
      params: { page, size, sort, minPrice, maxPrice },
    })
    return response.data
  }

  async getProductInventory(productId: number): Promise<Inventory> {
    const response = await api.get<Inventory>(`/api/public/products/${productId}/inventory`)
    return response.data
  }

  // Admin endpoints
  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await api.post<Product>('/api/admin/products', data)
    return response.data
  }

  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const response = await api.put<Product>(`/api/admin/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/api/admin/products/${id}`)
  }

  async updateInventory(productId: number, quantity: number): Promise<Inventory> {
    const response = await api.put<Inventory>(
      `/api/admin/products/${productId}/inventory`,
      null,
      { params: { quantity } }
    )
    return response.data
  }

  async addStock(productId: number, quantity: number): Promise<Inventory> {
    const response = await api.post<Inventory>(
      `/api/admin/products/${productId}/inventory/add`,
      null,
      { params: { quantity } }
    )
    return response.data
  }

  async removeStock(productId: number, quantity: number): Promise<Inventory> {
    const response = await api.post<Inventory>(
      `/api/admin/products/${productId}/inventory/remove`,
      null,
      { params: { quantity } }
    )
    return response.data
  }

  // Category management endpoints (Admin)
  async createCategory(name: string): Promise<Category> {
    const response = await api.post<Category>('/api/admin/categories', { name })
    return response.data
  }

  async updateCategory(id: number, name: string): Promise<Category> {
    const response = await api.put<Category>(`/api/admin/categories/${id}`, { name })
    return response.data
  }

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/api/admin/categories/${id}`)
  }
}

export default new ProductService()
