import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '@/store/productStore'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Products() {
  const { isAuthenticated } = useAuthStore()
  const { products, categories, pagination, isLoading, error, fetchProducts, fetchCategories, searchProducts, filterByCategory, clearFilters } = useProductStore()
  const { addToCart } = useCartStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [addingToCart, setAddingToCart] = useState<number | null>(null)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      searchProducts(searchTerm)
      setSelectedCategory(null)
    } else {
      clearFilters()
    }
  }

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId)
    setSearchTerm('')
    if (categoryId === null) {
      clearFilters()
    } else {
      filterByCategory(categoryId)
    }
  }

  const handlePageChange = (page: number) => {
    if (searchTerm) {
      searchProducts(searchTerm, page)
    } else if (selectedCategory) {
      filterByCategory(selectedCategory, page)
    } else {
      fetchProducts(page)
    }
  }

  const handleAddToCart = async (productId: number) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }

    setAddingToCart(productId)
    try {
      await addToCart({ productId, quantity: 1 })
      alert('Product added to cart!')
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingToCart(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Products</h1>
        <p className="text-muted-foreground">Browse our collection of quality products</p>
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
          {(searchTerm || selectedCategory !== null) && (
            <Button type="button" variant="outline" onClick={() => {
              setSearchTerm('')
              handleCategoryFilter(null)
            }}>
              Clear
            </Button>
          )}
        </div>
      </form>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryFilter(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryFilter(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <Card key={product.id} className="flex flex-col">
                <CardHeader>
                  {product.imageUrl && (
                    <div className="aspect-square mb-4 overflow-hidden rounded-md bg-muted">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardTitle className="line-clamp-2">{product.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit mt-2">
                    {product.categoryName}
                  </Badge>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description}
                  </p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Link to={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      className="flex-1"
                      onClick={() => handleAddToCart(product.id)}
                      disabled={addingToCart === product.id || !isAuthenticated}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {addingToCart === product.id ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
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
                    onClick={() => handlePageChange(i)}
                    className="min-w-[2.5rem]"
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
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
