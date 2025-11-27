import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X, Video as VideoIcon } from 'lucide-react'
import { mediaService } from '@/services'
import type { ProductMedia } from '@/types'

type VideoUploadProps = {
  productId: number
  onUploadSuccess: (media: ProductMedia) => void
  displayOrder?: number
}

export default function VideoUpload({ productId, onUploadSuccess, displayOrder = 0 }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
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
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a video file (MP4, WebM)')
      return
    }

    // Validate file size (50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('Video must be less than 50MB')
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
    setUploadProgress(0)

    try {
      // Simulate progress (since we don't have real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const media = await mediaService.uploadVideo(productId, file, '', displayOrder)

      clearInterval(progressInterval)
      setUploadProgress(100)

      onUploadSuccess(media)

      // Reset form
      setTimeout(() => {
        setFile(null)
        setPreview(null)
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload video')
      setUploadProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview(null)
    setError(null)
    setUploadProgress(0)
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
          accept="video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <video
                src={preview}
                controls
                className="max-h-48 rounded-lg"
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {file?.name} ({(file!.size / 1024 / 1024).toFixed(2)} MB)
              </p>

              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <Button type="button" onClick={handleUpload} disabled={uploading}>
                {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <VideoIcon className="h-16 w-16 mx-auto text-gray-400" />
            <div>
              <p className="text-lg font-medium">
                Drag and drop a video here
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
              Select Video
            </Button>
            <p className="text-xs text-muted-foreground">
              Supported: MP4, WebM (max 50MB)
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
