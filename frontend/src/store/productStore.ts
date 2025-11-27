import { create } from 'zustand'
import { productService } from '@/services'
import type { Product, Category, PaginatedResponse } from '@/types'

interface ProductState {
  products: Product[]
  categories: Category[]
  currentProduct: Product | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    pageSize: number
  }
  filters: {
    categoryId?: number
    minPrice?: number
    maxPrice?: number
    search?: string
  }
  isLoading: boolean
  error: string | null

  // Actions
  fetchProducts: (page?: number, size?: number) => Promise<void>
  fetchCategories: () => Promise<void>
  fetchProductById: (id: number) => Promise<void>
  searchProducts: (keyword: string, page?: number, size?: number) => Promise<void>
  filterByCategory: (categoryId: number, page?: number, size?: number) => Promise<void>
  filterByPriceRange: (minPrice: number, maxPrice: number, page?: number, size?: number) => Promise<void>
  clearFilters: () => void
  setCurrentProduct: (product: Product | null) => void
  clearError: () => void
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  currentProduct: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    pageSize: 12,
  },
  filters: {},
  isLoading: false,
  error: null,

  fetchProducts: async (page = 0, size = 12) => {
    set({ isLoading: true, error: null })
    try {
      const response: PaginatedResponse<Product> = await productService.getProducts({ page, size })
      set({
        products: response.content,
        pagination: {
          currentPage: response.number,
          totalPages: response.totalPages,
          totalItems: response.totalElements,
          pageSize: response.size,
        },
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch products',
        isLoading: false,
      })
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await productService.getCategories()
      set({ categories })
    } catch (error: any) {
      console.error('Failed to fetch categories:', error)
    }
  },

  fetchProductById: async (id: number) => {
    set({ isLoading: true, error: null })
    try {
      const product = await productService.getProductById(id)
      set({ currentProduct: product, isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch product',
        isLoading: false,
      })
    }
  },

  searchProducts: async (keyword: string, page = 0, size = 12) => {
    set({ isLoading: true, error: null, filters: { search: keyword } })
    try {
      const response: PaginatedResponse<Product> = await productService.searchProducts(keyword, { page, size })
      set({
        products: response.content,
        pagination: {
          currentPage: response.number,
          totalPages: response.totalPages,
          totalItems: response.totalElements,
          pageSize: response.size,
        },
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to search products',
        isLoading: false,
      })
    }
  },

  filterByCategory: async (categoryId: number, page = 0, size = 12) => {
    set({ isLoading: true, error: null, filters: { categoryId } })
    try {
      const response: PaginatedResponse<Product> = await productService.getProductsByCategory(categoryId, { page, size })
      set({
        products: response.content,
        pagination: {
          currentPage: response.number,
          totalPages: response.totalPages,
          totalItems: response.totalElements,
          pageSize: response.size,
        },
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to filter products',
        isLoading: false,
      })
    }
  },

  filterByPriceRange: async (minPrice: number, maxPrice: number, page = 0, size = 12) => {
    set({ isLoading: true, error: null, filters: { ...get().filters, minPrice, maxPrice } })
    try {
      const response: PaginatedResponse<Product> = await productService.getProductsByPriceRange(minPrice, maxPrice, { page, size })
      set({
        products: response.content,
        pagination: {
          currentPage: response.number,
          totalPages: response.totalPages,
          totalItems: response.totalElements,
          pageSize: response.size,
        },
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to filter products',
        isLoading: false,
      })
    }
  },

  clearFilters: () => {
    set({ filters: {} })
    get().fetchProducts()
  },

  setCurrentProduct: (product: Product | null) => {
    set({ currentProduct: product })
  },

  clearError: () => set({ error: null }),
}))
