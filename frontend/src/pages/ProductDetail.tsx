import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProductStore } from '@/store/productStore'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { reviewService, mediaService } from '@/services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react'
import ReviewForm from '@/components/ReviewForm'
import MediaGallery from '@/components/MediaGallery'
import type { Review, ProductRating, ProductMedia } from '@/types'

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { currentProduct, isLoading, error, fetchProductById } = useProductStore()
  const { addToCart } = useCartStore()

  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState<ProductRating | null>(null)
  const [productMedia, setProductMedia] = useState<ProductMedia[]>([])
  const [addingToCart, setAddingToCart] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [loadingMedia, setLoadingMedia] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProductById(Number(id))
      loadReviews()
      loadRating()
      loadMedia()
    }
  }, [id, fetchProductById])

  const loadReviews = async () => {
    if (!id) return
    setLoadingReviews(true)
    try {
      const response = await reviewService.getProductReviews(Number(id))
      setReviews(response.content)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoadingReviews(false)
    }
  }

  const loadRating = async () => {
    if (!id) return
    try {
      const ratingData = await reviewService.getProductRating(Number(id))
      setRating(ratingData)
    } catch (error) {
      console.error('Failed to load rating:', error)
    }
  }

  const loadMedia = async () => {
    if (!id) return
    setLoadingMedia(true)
    try {
      const mediaData = await mediaService.getProductMedia(Number(id))
      setProductMedia(mediaData)
    } catch (error) {
      console.error('Failed to load product media:', error)
      // It's okay if media fails to load - product might not have media yet
      setProductMedia([])
    } finally {
      setLoadingMedia(false)
    }
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      navigate('/login')
      return
    }

    if (!currentProduct) return

    setAddingToCart(true)
    try {
      await addToCart({ productId: currentProduct.id, quantity })
      alert('Product added to cart!')
      setQuantity(1)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Loading product...</p>
      </div>
    )
  }

  if (error || !currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Product not found'}</p>
          <Link to="/products">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </Link>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Product Media Gallery */}
        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
          {loadingMedia ? (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading media...</p>
            </div>
          ) : (
            <MediaGallery product={currentProduct} media={productMedia} />
          )}
        </div>

        {/* Product Info */}
        <div>
          <Badge variant="secondary" className="mb-4">
            {currentProduct.categoryName}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{currentProduct.name}</h1>

          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(rating.averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {rating.averageRating.toFixed(1)} ({rating.totalReviews} reviews)
              </span>
            </div>
          )}

          <p className="text-3xl font-bold mb-6">${currentProduct.price.toFixed(2)}</p>

          <p className="text-muted-foreground mb-6">{currentProduct.description}</p>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Quantity</label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={addingToCart || !isAuthenticated}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {addingToCart ? 'Adding to Cart...' : 'Add to Cart'}
          </Button>

          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please <Link to="/login" className="text-primary underline">login</Link> to add items to cart
            </p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {/* Review Submission Form - Only show if authenticated and haven't reviewed */}
        {isAuthenticated && user && currentProduct && !reviews.some(r => r.user.username === user.username) && (
          <ReviewForm
            productId={currentProduct.id}
            productName={currentProduct.name}
            onSuccess={() => {
              loadReviews()
              loadRating()
              alert('Review submitted successfully!')
            }}
          />
        )}

        {/* Notice if user already reviewed */}
        {isAuthenticated && user && reviews.some(r => r.user.username === user.username) && (
          <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded mb-6">
            You have already reviewed this product. Thank you for your feedback!
          </div>
        )}

        {/* Login prompt if not authenticated */}
        {!isAuthenticated && (
          <div className="bg-muted px-4 py-3 rounded mb-6">
            <Link to="/login" className="text-primary underline">Login</Link> to write a review
          </div>
        )}

        {loadingReviews ? (
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{review.user.username}</CardTitle>
                      {review.isVerifiedPurchase && (
                        <Badge variant="secondary" className="mt-1">Verified Purchase</Badge>
                      )}
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <p>{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
