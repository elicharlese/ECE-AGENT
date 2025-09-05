"use client"

import { useState } from "react"
import { Button } from '@/libs/design-system'
import { Dialog, DialogContent, DialogTrigger } from '@/libs/design-system'
import { Play, Download, X } from "lucide-react"

interface MediaPreviewProps {
  src: string
  type: "image" | "video" | "audio"
  alt?: string
  className?: string
}

export function MediaPreview({ src, type, alt, className }: MediaPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (type === "image") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div className={`cursor-pointer rounded-lg overflow-hidden ${className}`}>
            <img
              src={src || "/placeholder.svg"}
              alt={alt || "Image"}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
            />
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <div className="relative">
            <img
              src={src || "/placeholder.svg"}
              alt={alt || "Image"}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  const a = document.createElement("a")
                  a.href = src
                  a.download = alt || "image"
                  a.click()
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (type === "video") {
    return (
      <div className={`relative rounded-lg overflow-hidden bg-black ${className}`}>
        <video src={src} controls className="w-full h-full" preload="metadata">
          Your browser does not support the video tag.
        </video>
      </div>
    )
  }

  if (type === "audio") {
    return (
      <div className={`bg-gray-100 dark:bg-gray-700 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-full p-2">
            <Play className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1">
            <audio src={src} controls className="w-full">
              Your browser does not support the audio tag.
            </audio>
          </div>
        </div>
      </div>
    )
  }

  return null
}
