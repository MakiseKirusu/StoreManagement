import { create } from 'zustand'
import { authService } from '@/services'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types'

interface AuthState {
  user: {
    id: number
    username: string
    email: string
    roles: string[]
  } | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  checkAuth: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null })
    try {
      const response: AuthResponse = await authService.login(credentials)
      set({
        user: {
          id: response.id,
          username: response.username,
          email: response.email,
          roles: response.roles,
        },
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null })
    try {
      await authService.register(data)
      set({ isLoading: false })
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      })
      throw error
    }
  },

  logout: () => {
    authService.logout()
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    })
  },

  checkAuth: () => {
    const user = authService.getCurrentUser()
    const isAuthenticated = authService.isAuthenticated()
    set({ user, isAuthenticated })
  },

  clearError: () => set({ error: null }),
}))
