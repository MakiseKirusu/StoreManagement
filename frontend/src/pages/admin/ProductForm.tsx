import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { productService, mediaService } from '@/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, X, Image as ImageIcon, Video } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'
import VideoUpload from '@/components/admin/VideoUpload'
import type { Category, Product, ProductMedia } from '@/types'

export default function ProductForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()

  // Debug logging
  console.log('ProductForm rendered - id from useParams:', id, 'type:', typeof id)
  console.log('Current URL:', window.location.href)

  const isEditMode = !!id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    stockQuantity: '',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [productMedia, setProductMedia] = useState<ProductMedia[]>([])
  const [imageUploadMethod, setImageUploadMethod] = useState<'url' | 'upload'>('url')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user?.roles?.includes('ROLE_ADMIN')) {
      navigate('/login')
      return
    }

    loadCategories()
    if (isEditMode && id) {
      loadProduct(Number(id))
      loadMedia(Number(id))
    }
  }, [isAuthenticated, user, navigate, isEditMode, id])

  const loadCategories = async () => {
    try {
      const data = await productService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadProduct = async (productId: number) => {
    setIsLoading(true)
    try {
      const product = await productService.getProductById(productId)
      const inventory = await productService.getProductInventory(productId)

      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        categoryId: product.categoryId.toString(),
        imageUrl: product.imageUrl || '',
        stockQuantity: inventory.stockQuantity.toString(),
      })
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load product')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMedia = async (productId: number) => {
    try {
      const media = await mediaService.getProductMedia(productId)
      setProductMedia(media)
    } catch (error) {
      console.error('Failed to load product media:', error)
      setProductMedia([])
    }
  }

  const handleDeleteMedia = async (mediaId: number) => {
    if (!confirm('Are you sure you want to delete this media?')) {
      return
    }

    try {
      await mediaService.deleteMedia(mediaId)
      setProductMedia(productMedia.filter(m => m.id !== mediaId))
      alert('Media deleted successfully!')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete media')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required')
      return
    }
    if (!formData.categoryId) {
      setError('Category is required')
      return
    }
    if (!formData.stockQuantity || parseInt(formData.stockQuantity) < 0) {
      setError('Valid stock quantity is required')
      return
    }

    setIsSubmitting(true)

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        imageUrl: formData.imageUrl.trim() || undefined,
      }

      if (isEditMode && id) {
        // Update existing product
        await productService.updateProduct(Number(id), productData)

        // Update inventory
        const currentInventory = await productService.getProductInventory(Number(id))
        const newQuantity = parseInt(formData.stockQuantity)
        if (currentInventory.stockQuantity !== newQuantity) {
          await productService.updateInventory(Number(id), newQuantity)
        }

        alert('Product updated successfully!')
      } else {
        // Create new product
        const newProduct = await productService.createProduct(productData)

        // Set initial inventory
        await productService.updateInventory(newProduct.id, parseInt(formData.stockQuantity))

        alert('Product created successfully!')
      }

      navigate('/admin/products')
    } catch (error: any) {
      setError(error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated || !user?.roles?.includes('ROLE_ADMIN')) {
    return null
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Loading product...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/admin/products">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </Link>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock Quantity *</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="0"
                required
              />
            </div>

            {/* Product Image Section */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Product Media</Label>
                {isEditMode && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={imageUploadMethod === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageUploadMethod('url')}
                    >
                      URL
                    </Button>
                    <Button
                      type="button"
                      variant={imageUploadMethod === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImageUploadMethod('upload')}
                    >
                      Upload Files
                    </Button>
                  </div>
                )}
              </div>

              {/* URL Input Method */}
              {(!isEditMode || imageUploadMethod === 'url') && (
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (Legacy)</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter a URL to an image, or leave blank for no image
                  </p>
                  {formData.imageUrl && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-2">Image Preview:</p>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* File Upload Method (only in edit mode) */}
              {isEditMode && imageUploadMethod === 'upload' && (
                <div className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      <Label>Upload Images</Label>
                    </div>
                    <ImageUpload
                      productId={Number(id)}
                      onUploadSuccess={(media) => {
                        setProductMedia([...productMedia, media])
                      }}
                      displayOrder={productMedia.length}
                    />
                  </div>

                  {/* Video Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <Label>Upload Videos</Label>
                    </div>
                    <VideoUpload
                      productId={Number(id)}
                      onUploadSuccess={(media) => {
                        setProductMedia([...productMedia, media])
                      }}
                      displayOrder={productMedia.length}
                    />
                  </div>

                  {/* Uploaded Media Preview */}
                  {productMedia.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Media ({productMedia.length})</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {productMedia.map((media) => (
                          <div key={media.id} className="relative group">
                            {media.mediaType === 'IMAGE' ? (
                              <img
                                src={media.url}
                                alt={media.altText || 'Product media'}
                                className="w-full h-32 object-cover rounded border"
                              />
                            ) : (
                              <div className="w-full h-32 bg-gray-100 rounded border flex items-center justify-center">
                                <Video className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(media.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              {media.mediaType} #{media.displayOrder + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    💡 Tip: Save the product first, then upload images and videos using the buttons above.
                  </p>
                </div>
              )}

              {!isEditMode && (
                <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                  💡 Create the product first, then you can upload multiple images and videos in edit mode.
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/admin/products')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? (isEditMode ? 'Updating...' : 'Creating...')
                  : (isEditMode ? 'Update Product' : 'Create Product')
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
