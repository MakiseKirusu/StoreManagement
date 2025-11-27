import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { productService } from '@/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import type { Product, PaginatedResponse } from '@/types'

export default function AdminProducts() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalItems: 0,
    pageSize: 20,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/login')
      return
    }

    fetchProducts()
  }, [isAuthenticated, user, navigate])

  const fetchProducts = async (page = 0, size = 20) => {
    setIsLoading(true)
    setError(null)
    try {
      const response: PaginatedResponse<Product> = await productService.getProducts({ page, size })
      setProducts(response.content)
      setPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        totalItems: response.totalElements,
        pageSize: response.size,
      })
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      fetchProducts()
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response: PaginatedResponse<Product> = await productService.searchProducts(searchTerm)
      setProducts(response.content)
      setPagination({
        currentPage: response.number,
        totalPages: response.totalPages,
        totalItems: response.totalElements,
        pageSize: response.size,
      })
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to search products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    setDeletingId(id)
    try {
      await productService.deleteProduct(id)
      alert('Product deleted successfully')
      fetchProducts(pagination.currentPage)
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  if (!isAuthenticated || !user?.roles?.includes('ROLE_ADMIN')) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
          </p>
        </div>
        <Link to="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
          {searchTerm && (
            <Button type="button" variant="outline" onClick={() => {
              setSearchTerm('')
              fetchProducts()
            }}>
              Clear
            </Button>
          )}
        </div>
      </form>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-xl font-semibold mb-2">No products found</p>
          <p className="text-muted-foreground mb-6">Start by adding your first product</p>
          <Link to="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Products Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Image</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Created</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded overflow-hidden bg-muted">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary">{product.categoryName}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold">${product.price.toFixed(2)}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/products/${product.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={deletingId === product.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchProducts(pagination.currentPage - 1)}
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
                    onClick={() => fetchProducts(i)}
                    className="min-w-[2.5rem]"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => fetchProducts(pagination.currentPage + 1)}
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
