// User & Auth Types
export type User = {
  id: number
  username: string
  email: string
  roles: Role[]
}

export type Role = {
  id: number
  name: string // 'ROLE_CUSTOMER' | 'ROLE_ADMIN' | 'ROLE_STAFF'
}

export type LoginRequest = {
  username: string
  password: string
}

export type RegisterRequest = {
  username: string
  password: string
  email: string
}

export type AuthResponse = {
  token: string
  type: string // 'Bearer'
  id: number
  username: string
  email: string
  roles: string[]
}

// Product Types
export type Product = {
  id: number
  name: string
  description: string
  price: number
  categoryId: number
  categoryName: string
  imageUrl?: string
  createdAt?: string
}

export type MediaType = 'IMAGE' | 'VIDEO'

export type ProductMedia = {
  id: number
  productId: number
  mediaType: MediaType
  url: string
  altText?: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export type Category = {
  id: number
  name: string
  description?: string
}

export type ProductSearchParams = {
  page?: number
  size?: number
  sort?: string
  name?: string
  minPrice?: number
  maxPrice?: number
  categoryId?: number
}

export type PaginatedResponse<T> = {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  numberOfElements: number
  first: boolean
  empty: boolean
}

// Cart Types
export type CartItem = {
  id: number
  product: Product
  quantity: number
  subtotal: number
}

export type Cart = {
  id: number
  items: CartItem[]
}

export type CartResponse = {
  cart: Cart
  itemCount: number
  total: number
}

export type AddToCartRequest = {
  productId: number
  quantity: number
}

// Order Types
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export type OrderItem = {
  id: number
  product: Product
  quantity: number
  price: number
  subtotal: number
}

export type Order = {
  id: number
  user: User
  shippingAddress: string
  totalPrice: number
  status: OrderStatus
  createdAt: string
  items: OrderItem[]
}

export type CheckoutRequest = {
  shippingAddress: string
  voucherCode?: string
}

// Review Types
export type Review = {
  id: number
  user: User
  product: Product
  rating: number // 1-5
  comment?: string
  isVerifiedPurchase: boolean
  createdAt: string
  updatedAt?: string
}

export type CreateReviewRequest = {
  productId: number
  rating: number
  comment?: string
}

export type ProductRating = {
  averageRating: number
  totalReviews: number
}

// Inventory Types
export type Inventory = {
  id: number
  productId: number
  quantity: number
  lastUpdated: string
}

// API Error Types
export type ApiError = {
  path: string
  error: string
  message: string
  timestamp: number[]
  status: number
}
