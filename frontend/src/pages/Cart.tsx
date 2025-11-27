import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function Cart() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { cart, isLoading, error, fetchCart, updateQuantity, removeItem, clearCart } = useCartStore()

  const [updatingItem, setUpdatingItem] = useState<number | null>(null)
  const [removingItem, setRemovingItem] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [isAuthenticated, navigate, fetchCart])

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setUpdatingItem(productId)
    try {
      await updateQuantity(productId, newQuantity)
    } catch (error) {
      console.error('Failed to update quantity:', error)
    } finally {
      setUpdatingItem(null)
    }
  }

  const handleRemoveItem = async (productId: number) => {
    if (!confirm('Remove this item from cart?')) return

    setRemovingItem(productId)
    try {
      await removeItem(productId)
    } catch (error) {
      console.error('Failed to remove item:', error)
    } finally {
      setRemovingItem(null)
    }
  }

  const handleClearCart = async () => {
    if (!confirm('Clear all items from cart?')) return

    try {
      await clearCart()
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  const handleCheckout = () => {
    if (!cart || cart.cart.items.length === 0) {
      alert('Your cart is empty')
      return
    }
    navigate('/checkout')
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Loading cart...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Link to="/products">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
      </div>
    )
  }

  const isEmpty = !cart || cart.cart.items.length === 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {isEmpty ? 'Your cart is empty' : `${cart.itemCount} item(s) in your cart`}
        </p>
      </div>

      {isEmpty ? (
        <div className="text-center py-12">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl font-semibold mb-2">Your cart is empty</p>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.cart.items.map((item) => (
              <Card key={item.product.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product.id}`}>
                        <h3 className="font-semibold hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.product.categoryName}
                      </p>
                      <p className="text-lg font-bold mt-2">
                        ${item.product.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                          disabled={updatingItem === item.product.id || item.quantity <= 1}
                        >
                          -
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center"
                          disabled={updatingItem === item.product.id}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                          disabled={updatingItem === item.product.id}
                        >
                          +
                        </Button>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold">
                          Subtotal: ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveItem(item.product.id)}
                          disabled={removingItem === item.product.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex gap-4">
              <Link to="/products" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
              <Button variant="outline" className="flex-1" onClick={handleClearCart}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items ({cart.itemCount})</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
