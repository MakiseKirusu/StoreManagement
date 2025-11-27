import api from './api'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types'

class AuthService {
  async register(data: RegisterRequest): Promise<{ message: string }> {
    const response = await api.post('/api/auth/register', data)
    return response.data
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data)
    const authData = response.data

    // Store token and user in localStorage
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', JSON.stringify({
      id: authData.id,
      username: authData.username,
      email: authData.email,
      roles: authData.roles,
    }))

    return authData
  }

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser()
    return user?.roles?.includes(role) || false
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN')
  }
}

export default new AuthService()
