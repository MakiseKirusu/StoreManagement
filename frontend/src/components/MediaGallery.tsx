import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import type { ProductMedia, Product } from '@/types'

type MediaGalleryProps = {
  product: Product
  media: ProductMedia[]
}

export default function MediaGallery({ product, media }: MediaGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Combine product imageUrl with media for backward compatibility
  const allMedia: Array<ProductMedia | { type: 'fallback'; url: string }> = [
    ...media,
    ...(product.imageUrl && media.length === 0
      ? [{ type: 'fallback' as const, url: product.imageUrl }]
      : [])
  ]

  if (allMedia.length === 0) {
    return (
      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No media available</p>
      </div>
    )
  }

  const currentMedia = allMedia[currentIndex]
  const isFallback = 'type' in currentMedia && currentMedia.type === 'fallback'
  const mediaType = isFallback ? 'IMAGE' : (currentMedia as ProductMedia).mediaType

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="space-y-4">
      {/* Main Media Display */}
      <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
        {mediaType === 'IMAGE' ? (
          <img
            src={currentMedia.url}
            alt={isFallback ? product.name : (currentMedia as ProductMedia).altText || product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              src={currentMedia.url}
              controls
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20 group-hover:bg-black/10 transition-colors">
              <Play className="h-16 w-16 text-white/80" />
            </div>
          </div>
        )}

        {/* Navigation Arrows (if more than 1 media) */}
        {allMedia.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Media Counter */}
        {allMedia.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {allMedia.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation (if more than 1 media) */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allMedia.map((item, index) => {
            const isItemFallback = 'type' in item && item.type === 'fallback'
            const itemType = isItemFallback ? 'IMAGE' : (item as ProductMedia).mediaType

            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                {itemType === 'IMAGE' ? (
                  <img
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-black/80">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
