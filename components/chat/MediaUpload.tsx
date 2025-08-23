'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image, Film, Music, File } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MediaFile {
  id: string
  file: File
  preview?: string
  type: 'image' | 'video' | 'audio' | 'document' | 'other'
  uploading: boolean
  progress: number
  error?: string
}

interface MediaUploadProps {
  onUpload: (files: File[]) => Promise<void>
  maxFileSize?: number // in MB
  acceptedTypes?: string[]
  multiple?: boolean
}

export function MediaUpload({
  onUpload,
  maxFileSize = 10,
  acceptedTypes,
  multiple = true,
}: MediaUploadProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileType = (file: File): MediaFile['type'] => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    if (file.type.includes('pdf') || file.type.includes('document')) return 'document'
    return 'other'
  }

  const processFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles)
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > maxFileSize * 1024 * 1024) {
        console.error(`File ${file.name} exceeds max size of ${maxFileSize}MB`)
        return false
      }
      if (acceptedTypes && !acceptedTypes.some(type => file.type.match(type))) {
        console.error(`File ${file.name} has unsupported type`)
        return false
      }
      return true
    })

    // Create media file objects
    const mediaFiles: MediaFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: getFileType(file),
      uploading: true,
      progress: 0,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))

    setFiles(prev => [...prev, ...mediaFiles])

    // Upload files
    try {
      await onUpload(validFiles)
      setFiles(prev => prev.map(f => 
        mediaFiles.find(mf => mf.id === f.id) 
          ? { ...f, uploading: false, progress: 100 }
          : f
      ))
    } catch (error) {
      setFiles(prev => prev.map(f => 
        mediaFiles.find(mf => mf.id === f.id)
          ? { ...f, uploading: false, error: 'Upload failed' }
          : f
      ))
    }
  }, [maxFileSize, acceptedTypes, onUpload])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files)
    }
  }, [processFiles])

  const removeFile = (id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />
      case 'video': return <Film className="h-4 w-4" />
      case 'audio': return <Music className="h-4 w-4" />
      case 'document': return <FileText className="h-4 w-4" />
      default: return <File className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          'hover:border-primary/50 cursor-pointer',
          dragActive && 'border-primary bg-primary/5'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes?.join(',')}
          onChange={handleChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
          <p className="text-sm font-medium">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max {maxFileSize}MB per file
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-2 border rounded-lg"
            >
              {/* Preview or Icon */}
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.file.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-accent rounded">
                  {getFileIcon(file.type)}
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Progress or Status */}
              {file.uploading ? (
                <div className="w-20">
                  <div className="h-1 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              ) : file.error ? (
                <span className="text-xs text-red-500">{file.error}</span>
              ) : (
                <span className="text-xs text-green-500">✓</span>
              )}

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(file.id)
                }}
                className="p-1 hover:bg-accent rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Inline Media Upload Button for Message Composer
export function MediaUploadButton({ onUpload }: { onUpload: (files: File[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files))
      e.target.value = '' // Reset input
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 hover:bg-accent rounded-md transition-colors"
        aria-label="Upload media"
      >
        <Upload className="h-4 w-4" />
      </button>
    </>
  )
}
