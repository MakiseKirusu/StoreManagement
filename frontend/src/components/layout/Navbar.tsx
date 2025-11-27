import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore, useCartStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, LogOut, User, Settings } from 'lucide-react'
import { useEffect } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { cart, fetchCart } = useCartStore()

  // Fetch cart on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    }
  }, [isAuthenticated, fetchCart])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const cartItemCount = cart?.itemCount || 0

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">JStore</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Products
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Orders
              </Link>
            )}
            {isAuthenticated && user?.roles?.includes('ROLE_ADMIN') && (
              <Link
                to="/admin"
                className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side - Cart & User */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Cart */}
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                  <span className="text-sm font-medium">{user?.username}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
