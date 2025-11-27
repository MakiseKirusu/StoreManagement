import { useState } from 'react'
import { reviewService } from '@/services'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import type { CreateReviewRequest } from '@/types'

type ReviewFormProps = {
  productId: number
  productName: string
  onSuccess: () => void
}

export default function ReviewForm({ productId, productName, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!comment.trim()) {
      setError('Please write a review comment')
      return
    }

    setIsSubmitting(true)
    try {
      const reviewData: CreateReviewRequest = {
        productId,
        rating,
        comment: comment.trim(),
      }

      await reviewService.createReview(reviewData)

      // Reset form
      setRating(0)
      setComment('')

      // Notify parent component
      onSuccess()
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        'Failed to submit review. You may need to purchase this product first.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
        <CardDescription>
          Share your experience with {productName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Rating</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </span>
              )}
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Your Review
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell others what you think about this product..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
