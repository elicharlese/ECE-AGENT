'use client'

import React, { useState } from 'react'
import { X, Download, Maximize2, Play, Pause, Volume2, File } from 'lucide-react'
import { cn } from '@/lib/utils'

export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other'

interface MediaItem {
  id: string
  url: string
  type: MediaType
  name: string
  size?: number
  mimeType?: string
  thumbnail?: string
  duration?: number // for video/audio in seconds
}

interface MediaPreviewProps {
  media: MediaItem
  className?: string
  showControls?: boolean
  onClose?: () => void
  onDownload?: () => void
}

export function MediaPreview({
  media,
  className,
  showControls = true,
  onClose,
  onDownload,
}: MediaPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderMedia = () => {
    switch (media.type) {
      case 'image':
        return (
          <img
            src={media.url}
            alt={media.name}
            className="max-w-full max-h-full object-contain"
          />
        )
      
      case 'video':
        return (
          <video
            src={media.url}
            controls={showControls}
            className="max-w-full max-h-full"
            poster={media.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        )
      
      case 'audio':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <Volume2 className="h-16 w-16 mb-4 text-muted-foreground" />
            <p className="font-medium mb-2">{media.name}</p>
            {media.duration && (
              <p className="text-sm text-muted-foreground mb-4">
                {formatDuration(media.duration)}
              </p>
            )}
            <audio src={media.url} controls className="w-full max-w-sm">
              Your browser does not support the audio tag.
            </audio>
          </div>
        )
      
      case 'document':
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <File className="h-16 w-16 mb-4 text-muted-foreground" />
            <p className="font-medium mb-2">{media.name}</p>
            {media.size && (
              <p className="text-sm text-muted-foreground mb-4">
                {formatFileSize(media.size)}
              </p>
            )}
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Download
            </button>
          </div>
        )
      
      default:
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <File className="h-16 w-16 mb-4 text-muted-foreground" />
            <p className="font-medium mb-2">{media.name}</p>
            <p className="text-sm text-muted-foreground">
              Preview not available
            </p>
          </div>
        )
    }
  }

  return (
    <div className={cn('relative bg-background', className)}>
      {renderMedia()}
      
      {showControls && (
        <div className="absolute top-2 right-2 flex gap-2">
          {onDownload && (
            <button
              onClick={onDownload}
              className="p-2 bg-black/50 text-white rounded-md hover:bg-black/70 transition-colors"
              aria-label="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-black/50 text-white rounded-md hover:bg-black/70 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Thumbnail component for media in messages
export function MediaThumbnail({
  media,
  onClick,
  className,
}: {
  media: MediaItem
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative group cursor-pointer overflow-hidden rounded-lg',
        className
      )}
      onClick={onClick}
    >
      {media.type === 'image' && (
        <img
          src={media.thumbnail || media.url}
          alt={media.name}
          className="w-full h-full object-cover"
        />
      )}
      
      {media.type === 'video' && (
        <>
          <img
            src={media.thumbnail || ''}
            alt={media.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 bg-black/50 rounded-full group-hover:bg-black/70 transition-colors">
              <Play className="h-6 w-6 text-white" />
            </div>
          </div>
          {media.duration && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
              {formatDuration(media.duration)}
            </span>
          )}
        </>
      )}
      
      {media.type === 'audio' && (
        <div className="w-full h-full bg-accent flex items-center justify-center">
          <Volume2 className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      
      {(media.type === 'document' || media.type === 'other') && (
        <div className="w-full h-full bg-accent flex flex-col items-center justify-center p-4">
          <File className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-xs text-center truncate w-full">{media.name}</p>
        </div>
      )}
    </div>
  )
}

// Gallery view for multiple media items
export function MediaGallery({
  items,
  maxDisplay = 4,
  onItemClick,
}: {
  items: MediaItem[]
  maxDisplay?: number
  onItemClick?: (item: MediaItem, index: number) => void
}) {
  const displayItems = items.slice(0, maxDisplay)
  const remainingCount = items.length - maxDisplay

  const getGridClass = () => {
    switch (displayItems.length) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-2'
      case 3:
        return 'grid-cols-2'
      default:
        return 'grid-cols-2'
    }
  }

  return (
    <div className={cn('grid gap-1', getGridClass())}>
      {displayItems.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            'relative',
            displayItems.length === 3 && index === 0 && 'col-span-2'
          )}
        >
          <MediaThumbnail
            media={item}
            onClick={() => onItemClick?.(item, index)}
            className="w-full h-32"
          />
          
          {index === displayItems.length - 1 && remainingCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
              <span className="text-white text-xl font-medium">
                +{remainingCount}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Lightbox for full screen media viewing
export function MediaLightbox({
  media,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  currentIndex,
  totalCount,
}: {
  media: MediaItem
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  currentIndex?: number
  totalCount?: number
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-md transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation */}
      {onPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-md transition-colors"
        >
          ←
        </button>
      )}
      
      {onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-md transition-colors"
        >
          →
        </button>
      )}

      {/* Counter */}
      {currentIndex !== undefined && totalCount !== undefined && (
        <div className="absolute top-4 left-4 text-white">
          {currentIndex + 1} / {totalCount}
        </div>
      )}

      {/* Media */}
      <div className="max-w-[90vw] max-h-[90vh]">
        <MediaPreview
          media={media}
          showControls={true}
          onClose={onClose}
        />
      </div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
