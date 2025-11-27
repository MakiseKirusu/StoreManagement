import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { mediaService } from '@/services'
import type { ProductMedia } from '@/types'

type ImageUploadProps = {
  productId: number
  onUploadSuccess: (media: ProductMedia) => void
  displayOrder?: number
}

export default function ImageUpload({ productId, onUploadSuccess, displayOrder = 0 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP, GIF)')
      return
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setError(null)
    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const media = await mediaService.uploadImage(productId, file, '', displayOrder)
      onUploadSuccess(media)

      // Reset form
      setFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Drag-drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/10'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg"
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {file?.name} ({(file!.size / 1024).toFixed(1)} KB)
              </p>
              <Button type="button" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ImageIcon className="h-16 w-16 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium">
                Drag and drop an image here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Image
            </Button>
            <p className="text-xs text-muted-foreground">
              Supported: JPG, PNG, WebP, GIF (max 5MB)
            </p>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
