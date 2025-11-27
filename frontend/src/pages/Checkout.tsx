import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { orderService } from '@/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function Checkout() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { cart, fetchCart } = useCartStore()

  const [shippingAddress, setShippingAddress] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchCart()
  }, [isAuthenticated, navigate, fetchCart])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!shippingAddress.trim()) {
      setError('Please enter a shipping address')
      return
    }

    if (!cart || cart.cart.items.length === 0) {
      setError('Your cart is empty')
      return
    }

    setIsSubmitting(true)

    try {
      await orderService.checkout({ shippingAddress: shippingAddress.trim() })
      alert('Order placed successfully!')
      navigate('/orders')
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  if (!cart || cart.cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-xl font-semibold mb-2">Your cart is empty</p>
          <p className="text-muted-foreground mb-6">Add some products before checking out</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your order</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Shipping Address *</Label>
                  <textarea
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your complete shipping address"
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Please include street address, city, state, and postal code
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/cart')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Cart
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Payment Info Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  Payment processing is not implemented in this demo. Your order will be placed with a PENDING status.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.cart.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>$0.00</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
