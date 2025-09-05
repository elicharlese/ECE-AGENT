'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Smile, Search, Clock, Heart, ThumbsUp, Laugh, Frown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Emoji {
  emoji: string
  name: string
  category: string
}

const EMOJI_CATEGORIES = {
  recent: '🕐',
  smileys: '😀',
  people: '👥',
  animals: '🐾',
  food: '🍔',
  activities: '⚽',
  travel: '✈️',
  objects: '💡',
  symbols: '❤️',
  flags: '🏳️',
}

// Common emojis for quick access
const QUICK_EMOJIS = ['👍', '❤️', '😂', '😊', '😍', '🎉', '🔥', '👏', '💯', '✨']

const DEFAULT_EMOJIS: Emoji[] = [
  // Smileys & Emotion
  { emoji: '😀', name: 'grinning', category: 'smileys' },
  { emoji: '😃', name: 'smiley', category: 'smileys' },
  { emoji: '😄', name: 'smile', category: 'smileys' },
  { emoji: '😁', name: 'grin', category: 'smileys' },
  { emoji: '😅', name: 'sweat_smile', category: 'smileys' },
  { emoji: '😂', name: 'joy', category: 'smileys' },
  { emoji: '🤣', name: 'rofl', category: 'smileys' },
  { emoji: '😊', name: 'blush', category: 'smileys' },
  { emoji: '😇', name: 'innocent', category: 'smileys' },
  { emoji: '🙂', name: 'slightly_smiling_face', category: 'smileys' },
  { emoji: '😉', name: 'wink', category: 'smileys' },
  { emoji: '😍', name: 'heart_eyes', category: 'smileys' },
  { emoji: '🥰', name: 'smiling_face_with_hearts', category: 'smileys' },
  { emoji: '😘', name: 'kissing_heart', category: 'smileys' },
  { emoji: '😗', name: 'kissing', category: 'smileys' },
  { emoji: '😙', name: 'kissing_smiling_eyes', category: 'smileys' },
  { emoji: '😚', name: 'kissing_closed_eyes', category: 'smileys' },
  { emoji: '😋', name: 'yum', category: 'smileys' },
  { emoji: '😛', name: 'stuck_out_tongue', category: 'smileys' },
  { emoji: '😜', name: 'stuck_out_tongue_winking_eye', category: 'smileys' },
  { emoji: '🤪', name: 'zany_face', category: 'smileys' },
  { emoji: '😝', name: 'stuck_out_tongue_closed_eyes', category: 'smileys' },
  { emoji: '🤑', name: 'money_mouth_face', category: 'smileys' },
  { emoji: '🤗', name: 'hugs', category: 'smileys' },
  { emoji: '🤭', name: 'hand_over_mouth', category: 'smileys' },
  { emoji: '🤫', name: 'shushing_face', category: 'smileys' },
  { emoji: '🤔', name: 'thinking', category: 'smileys' },
  { emoji: '🤐', name: 'zipper_mouth_face', category: 'smileys' },
  { emoji: '🤨', name: 'raised_eyebrow', category: 'smileys' },
  { emoji: '😐', name: 'neutral_face', category: 'smileys' },
  // Add more emojis as needed...
  // Gestures
  { emoji: '👍', name: 'thumbsup', category: 'people' },
  { emoji: '👎', name: 'thumbsdown', category: 'people' },
  { emoji: '👌', name: 'ok_hand', category: 'people' },
  { emoji: '✌️', name: 'v', category: 'people' },
  { emoji: '🤞', name: 'crossed_fingers', category: 'people' },
  { emoji: '🤟', name: 'love_you_gesture', category: 'people' },
  { emoji: '🤘', name: 'metal', category: 'people' },
  { emoji: '🤙', name: 'call_me_hand', category: 'people' },
  { emoji: '👈', name: 'point_left', category: 'people' },
  { emoji: '👉', name: 'point_right', category: 'people' },
  { emoji: '👆', name: 'point_up_2', category: 'people' },
  { emoji: '👇', name: 'point_down', category: 'people' },
  { emoji: '☝️', name: 'point_up', category: 'people' },
  { emoji: '✋', name: 'hand', category: 'people' },
  { emoji: '🤚', name: 'raised_back_of_hand', category: 'people' },
  { emoji: '🖐', name: 'raised_hand_with_fingers_splayed', category: 'people' },
  { emoji: '🖖', name: 'vulcan_salute', category: 'people' },
  { emoji: '👋', name: 'wave', category: 'people' },
  { emoji: '🤏', name: 'pinching_hand', category: 'people' },
  { emoji: '👏', name: 'clap', category: 'people' },
  { emoji: '🙌', name: 'raised_hands', category: 'people' },
  { emoji: '👐', name: 'open_hands', category: 'people' },
  { emoji: '🤲', name: 'palms_up_together', category: 'people' },
  { emoji: '🤝', name: 'handshake', category: 'people' },
  { emoji: '🙏', name: 'pray', category: 'people' },
  // Hearts & Symbols
  { emoji: '❤️', name: 'heart', category: 'symbols' },
  { emoji: '🧡', name: 'orange_heart', category: 'symbols' },
  { emoji: '💛', name: 'yellow_heart', category: 'symbols' },
  { emoji: '💚', name: 'green_heart', category: 'symbols' },
  { emoji: '💙', name: 'blue_heart', category: 'symbols' },
  { emoji: '💜', name: 'purple_heart', category: 'symbols' },
  { emoji: '🖤', name: 'black_heart', category: 'symbols' },
  { emoji: '💔', name: 'broken_heart', category: 'symbols' },
  { emoji: '❣️', name: 'heavy_heart_exclamation', category: 'symbols' },
  { emoji: '💕', name: 'two_hearts', category: 'symbols' },
  { emoji: '💖', name: 'sparkling_heart', category: 'symbols' },
  { emoji: '💗', name: 'heartpulse', category: 'symbols' },
  { emoji: '💘', name: 'cupid', category: 'symbols' },
  { emoji: '💝', name: 'gift_heart', category: 'symbols' },
  { emoji: '✨', name: 'sparkles', category: 'symbols' },
  { emoji: '⭐', name: 'star', category: 'symbols' },
  { emoji: '🌟', name: 'star2', category: 'symbols' },
  { emoji: '💫', name: 'dizzy', category: 'symbols' },
  { emoji: '💥', name: 'boom', category: 'symbols' },
  { emoji: '💯', name: '100', category: 'symbols' },
  { emoji: '🔥', name: 'fire', category: 'symbols' },
  { emoji: '⚡', name: 'zap', category: 'symbols' },
  { emoji: '🎉', name: 'tada', category: 'activities' },
  { emoji: '🎊', name: 'confetti_ball', category: 'activities' },
]

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  onClose?: () => void
  recentEmojis?: string[]
}

export function EmojiPicker({ onSelect, onClose, recentEmojis = [] }: EmojiPickerProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('recent')
  const [filteredEmojis, setFilteredEmojis] = useState(DEFAULT_EMOJIS)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (search) {
      const filtered = DEFAULT_EMOJIS.filter(
        e => e.name.toLowerCase().includes(search.toLowerCase())
      )
      setFilteredEmojis(filtered)
    } else {
      setFilteredEmojis(DEFAULT_EMOJIS)
    }
  }, [search])

  const getCategoryEmojis = (category: string) => {
    if (category === 'recent') {
      return recentEmojis.length > 0 ? recentEmojis : QUICK_EMOJIS
    }
    return filteredEmojis.filter(e => e.category === category).map(e => e.emoji)
  }

  const handleEmojiClick = (emoji: string) => {
    onSelect(emoji)
    if (onClose) onClose()
  }

  return (
    <div className="w-80 bg-background border rounded-lg shadow-lg overflow-hidden">
      {/* Header with Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emojis..."
            className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
        {Object.entries(EMOJI_CATEGORIES).map(([key, icon]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={cn(
              'p-1.5 rounded hover:bg-accent transition-colors',
              activeCategory === key && 'bg-accent'
            )}
            aria-label={key}
          >
            <span className="text-lg">{icon}</span>
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="h-64 overflow-y-auto p-2">
        {activeCategory === 'recent' && recentEmojis.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            No recent emojis. Try these:
          </div>
        )}
        <div className="grid grid-cols-8 gap-0.5">
          {getCategoryEmojis(activeCategory).map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => handleEmojiClick(emoji)}
              className="p-1.5 text-xl hover:bg-accent rounded transition-colors"
              aria-label={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Reactions Bar */}
      <div className="p-2 border-t bg-accent/50">
        <div className="flex items-center justify-center gap-1">
          {QUICK_EMOJIS.slice(0, 8).map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleEmojiClick(emoji)}
              className="p-1 text-lg hover:bg-accent rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Emoji Picker Toggle Button
export function EmojiPickerButton({ onSelect }: { onSelect: (emoji: string) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-accent rounded-md transition-colors"
        aria-label="Open emoji picker"
      >
        <Smile className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-10 right-0 z-50"
        >
          <EmojiPicker
            onSelect={(emoji) => {
              onSelect(emoji)
              setIsOpen(false)
            }}
            onClose={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  )
}

// Message Reactions Component
export function MessageReactions({
  reactions,
  onAddReaction,
  onRemoveReaction,
  currentUserId,
}: {
  reactions: { emoji: string; users: string[] }[]
  onAddReaction: (emoji: string) => void
  onRemoveReaction: (emoji: string) => void
  currentUserId: string
}) {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {reactions.map((reaction) => {
        const hasReacted = reaction.users.includes(currentUserId)
        return (
          <button
            key={reaction.emoji}
            onClick={() => {
              if (hasReacted) {
                onRemoveReaction(reaction.emoji)
              } else {
                onAddReaction(reaction.emoji)
              }
            }}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm',
              'border transition-all hover:scale-105',
              hasReacted
                ? 'bg-primary/10 border-primary'
                : 'bg-accent border-transparent hover:border-gray-300'
            )}
          >
            <span>{reaction.emoji}</span>
            <span className="text-xs">{reaction.users.length}</span>
          </button>
        )
      })}
      
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="p-1 hover:bg-accent rounded-full transition-colors relative"
      >
        <Smile className="h-3.5 w-3.5" />
        
        {showPicker && (
          <div className="absolute bottom-8 left-0 z-50">
            <EmojiPicker
              onSelect={(emoji) => {
                onAddReaction(emoji)
                setShowPicker(false)
              }}
              onClose={() => setShowPicker(false)}
            />
          </div>
        )}
      </button>
    </div>
  )
}
