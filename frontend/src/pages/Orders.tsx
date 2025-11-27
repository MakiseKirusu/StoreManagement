import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { orderService } from '@/services'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Order, PaginatedResponse } from '@/types'

export default function Orders() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchOrders()
  }, [isAuthenticated, navigate])

  const fetchOrders = async (page = 0, size = 10) => {
    setIsLoading(true)
    setError(null)
    try {
      const response: PaginatedResponse<Order> = await orderService.getMyOrders({ page, size })
      setOrders(response.content)
      setPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        totalItems: response.totalElements,
        pageSize: response.size,
      })
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order?')) return

    setCancellingOrder(orderId)
    try {
      await orderService.cancelOrder(orderId)
      alert('Order cancelled successfully')
      fetchOrders(pagination.currentPage)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancellingOrder(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-500'
      case 'PROCESSING':
        return 'bg-blue-500'
      case 'SHIPPED':
        return 'bg-purple-500'
      case 'DELIVERED':
        return 'bg-green-500'
      case 'CANCELLED':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          View and manage your order history
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl font-semibold mb-2">No orders yet</p>
          <p className="text-muted-foreground mb-6">Start shopping to create your first order</p>
          <Button onClick={() => navigate('/products')}>Browse Products</Button>
        </div>
      ) : (
        <>
          <div className="space-y-6 mb-8">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Order #{order.id}
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">${order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Shipping Address */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-1">Shipping Address:</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Items:</p>
                    <div className="space-y-2">
                      {(order.items || []).map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center justify-between py-2 px-3 bg-muted rounded"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded bg-background flex items-center justify-center overflow-hidden">
                              {item.product.imageUrl ? (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {order.status === 'PENDING' && (
                    <div className="border-t mt-4 pt-4">
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrder === order.id}
                      >
                        {cancellingOrder === order.id ? 'Cancelling...' : 'Cancel Order'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchOrders(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => (
                  <Button
                    key={i}
                    variant={pagination.currentPage === i ? "default" : "outline"}
                    size="sm"
                    onClick={() => fetchOrders(i)}
                    className="min-w-[2.5rem]"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchOrders(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
