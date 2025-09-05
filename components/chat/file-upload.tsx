"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button, Input, Progress, Popover, PopoverContent, PopoverTrigger } from '@/libs/design-system';
import { Paperclip, ImageIcon, Video, Music, FileText, Camera } from "lucide-react"

interface FileUploadProps {
  onFileSelect: (file: File, type: string) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadType, setUploadType] = useState<string>("")

  const handleFileSelect = (type: string, accept: string) => {
    setUploadType(type)
    if (fileInputRef.current) {
      fileInputRef.current.accept = accept
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file, uploadType)
    }
  }

  const uploadOptions = [
    { type: "image", label: "Photo", icon: ImageIcon, accept: "image/*" },
    { type: "video", label: "Video", icon: Video, accept: "video/*" },
    { type: "audio", label: "Audio", icon: Music, accept: "audio/*" },
    { type: "document", label: "Document", icon: FileText, accept: ".pdf,.doc,.docx,.txt" },
    { type: "camera", label: "Camera", icon: Camera, accept: "image/*" },
  ]

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-1">
            {uploadOptions.map((option) => (
              <Button
                key={option.type}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleFileSelect(option.type, option.accept)}
              >
                <option.icon className="h-4 w-4 mr-2" />
                {option.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
    </>
  )
}
