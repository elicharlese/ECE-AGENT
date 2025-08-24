'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
  Code,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Quote,
  AtSign,
  Hash,
  X,
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface RichMessageInputProps {
  onSendMessage: (message: string, attachments?: File[]) => void
  onTyping?: () => void
  onStopTyping?: () => void
  placeholder?: string
  disabled?: boolean
  showFormatting?: boolean
  showAttachments?: boolean
  showEmojis?: boolean
  showVoice?: boolean
  density?: 'compact' | 'comfortable' | 'airy'
  replyingTo?: {
    id: string
    author: string
    message: string
  }
  onCancelReply?: () => void
  className?: string
}

export function RichMessageInput({
  onSendMessage,
  onTyping,
  onStopTyping,
  placeholder = "Type a message...",
  disabled = false,
  showFormatting = true,
  showAttachments = true,
  showEmojis = true,
  showVoice = true,
  density = 'comfortable',
  replyingTo,
  onCancelReply,
  className
}: RichMessageInputProps) {
  const [message, setMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showFormattingBar, setShowFormattingBar] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Spacing tokens based on density preference
  const resolvedDensity = density ?? 'comfortable'
  const containerPadding = resolvedDensity === 'compact' ? 'py-3' : resolvedDensity === 'airy' ? 'py-5' : 'py-4'
  const rowGap = resolvedDensity === 'compact' ? 'gap-2' : resolvedDensity === 'airy' ? 'gap-4' : 'gap-3'
  const groupGap = rowGap
  const textareaMinH = resolvedDensity === 'compact' ? 'min-h-[40px]' : resolvedDensity === 'airy' ? 'min-h-[48px]' : 'min-h-[44px]'
  const textareaPadding = resolvedDensity === 'compact' ? 'px-3 py-2' : 'px-4 py-3'

  // Handle message send
  const handleSend = useCallback(() => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message.trim(), attachments)
      setMessage('')
      setAttachments([])
      if (onCancelReply) onCancelReply()
    }
  }, [message, attachments, onSendMessage, onCancelReply])

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (!isTyping && onTyping) {
      setIsTyping(true)
      onTyping()
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (onStopTyping) {
        setIsTyping(false)
        onStopTyping()
      }
    }, 2000)
  }, [isTyping, onTyping, onStopTyping])

  // Handle text input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    handleTyping()
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
    
    // Formatting shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          insertFormatting('**', '**')
          break
        case 'i':
          e.preventDefault()
          insertFormatting('*', '*')
          break
        case 'k':
          e.preventDefault()
          insertFormatting('[', '](url)')
          break
      }
    }
  }

  // Insert formatting around selected text
  const insertFormatting = (before: string, after: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = message.substring(start, end)
    const newText = 
      message.substring(0, start) +
      before +
      selectedText +
      after +
      message.substring(end)
    
    setMessage(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      )
    }, 0)
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // Handle emoji selection
  const handleEmojiSelect = (emoji: any) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newText = 
      message.substring(0, start) +
      emoji.native +
      message.substring(end)
    
    setMessage(newText)
    setShowEmojiPicker(false)
    
    // Focus back on textarea
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + emoji.native.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)
  }

  // Handle voice recording
  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording)
    // TODO: Implement actual voice recording
  }

  return (
    <div className={cn("bg-card border-t", className)}>
      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-accent border-b flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              Replying to <span className="font-semibold">{replyingTo.author}</span>
            </p>
            <p className="text-sm text-foreground truncate">
              {replyingTo.message}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancelReply}
            className="ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-accent border-b">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-card rounded-lg border border-border"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-primary" />
                ) : (
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAttachment(index)}
                  className="w-5 h-5 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formatting Toolbar */}
      {showFormatting && showFormattingBar && (
        <div className="px-4 py-2 bg-accent border-b">
          <div className={cn("flex items-center", groupGap)}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertFormatting('**', '**')}
                    className="w-8 h-8"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold (Cmd+B)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertFormatting('*', '*')}
                    className="w-8 h-8"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic (Cmd+I)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertFormatting('~~', '~~')}
                    className="w-8 h-8"
                  >
                    <Underline className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Strikethrough</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertFormatting('`', '`')}
                    className="w-8 h-8"
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Code</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertFormatting('[', '](url)')}
                    className="w-8 h-8"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Link (Cmd+K)</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertFormatting('- ', '')}
                    className="w-8 h-8"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertFormatting('1. ', '')}
                    className="w-8 h-8"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered List</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => insertFormatting('> ', '')}
                    className="w-8 h-8"
                  >
                    <Quote className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quote</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className={cn("px-4", containerPadding)}>
        <div className={cn("flex items-center", rowGap)}>
          {/* Action Buttons (Left) */}
          <div className={cn("flex items-center", groupGap)}>
            {showAttachments && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                      >
                        <Paperclip className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach files</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </>
            )}

            {showFormatting && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowFormattingBar(!showFormattingBar)}
                      disabled={disabled}
                      className={cn(showFormattingBar && "bg-accent")}
                    >
                      <Bold className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Text formatting</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Text Input */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn("flex-1 max-h-[220px] resize-none", textareaMinH, textareaPadding)}
            rows={1}
          />

          {/* Action Buttons (Right) */}
          <div className="flex items-center gap-2">
            {showEmojis && (
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                </PopoverContent>
              </Popover>
            )}

            {showVoice && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleVoiceRecording}
                      disabled={disabled}
                      className={cn(isRecording && "bg-destructive/10 text-destructive")}
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRecording ? 'Stop recording' : 'Record voice message'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <Button
              onClick={handleSend}
              disabled={disabled || (!message.trim() && attachments.length === 0)}
              size="icon"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
