import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { productService, orderService } from '@/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ShoppingBag, ListOrdered, AlertTriangle } from 'lucide-react'
import type { Product, Order } from '@/types'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/login')
      return
    }

    loadDashboardStats()
  }, [isAuthenticated, user, navigate])

  const loadDashboardStats = async () => {
    setIsLoading(true)
    try {
      // Fetch products to get total count
      const productsResponse = await productService.getProducts({ page: 0, size: 1 })

      // Fetch orders to get total count
      const ordersResponse = await orderService.getAllOrders({ page: 0, size: 1 })

      setStats({
        totalProducts: productsResponse.totalElements,
        totalOrders: ordersResponse.totalElements,
        pendingOrders: 0, // Would need a specific endpoint to count pending orders
        lowStockProducts: 0, // Would need a specific endpoint for low stock
      })
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || !user?.roles?.includes('ROLE_ADMIN')) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your store, products, orders, and customers
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active products in catalog
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time orders
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <ListOrdered className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Products need restocking
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/admin/products" className="block">
                  <Button className="w-full" variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Products
                  </Button>
                </Link>
                <Link to="/admin/products/new" className="block">
                  <Button className="w-full">
                    Add New Product
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/admin/categories">
                  <Button className="w-full" variant="outline">
                    <ListOrdered className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to="/admin/orders">
                  <Button className="w-full" variant="outline">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Manage Orders
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
