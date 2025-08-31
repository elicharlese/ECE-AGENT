"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Smile } from "lucide-react"

// Custom emoji data structure
interface CustomEmoji {
  id: string
  name: string
  character: string
  keywords: string[]
}

const customEmojiCategories = {
  Expressions: [
    { id: "sparkle-smile", name: "Sparkle Smile", character: "✨😊", keywords: ["happy", "sparkle", "joy"] },
    { id: "mind-blown", name: "Mind Blown", character: "🤯✨", keywords: ["amazed", "wow", "shocked"] },
    { id: "heart-eyes-star", name: "Star Eyes", character: "🤩💫", keywords: ["love", "star", "amazing"] },
    { id: "cool-sunglasses", name: "Cool Vibes", character: "😎🔥", keywords: ["cool", "awesome", "fire"] },
    { id: "thinking-deep", name: "Deep Thought", character: "🤔💭", keywords: ["thinking", "pondering", "idea"] },
    { id: "party-face", name: "Party Time", character: "🥳🎉", keywords: ["party", "celebration", "fun"] },
    { id: "sleepy-moon", name: "Sleepy Moon", character: "😴🌙", keywords: ["tired", "sleep", "night"] },
    { id: "coffee-energy", name: "Coffee Boost", character: "☕⚡", keywords: ["energy", "coffee", "awake"] },
    { id: "rainbow-happy", name: "Rainbow Joy", character: "😄🌈", keywords: ["happy", "colorful", "joy"] },
    { id: "rocket-excited", name: "Rocket Excited", character: "🚀😆", keywords: ["excited", "launch", "energy"] },
    { id: "zen-peace", name: "Zen Peace", character: "😌🧘", keywords: ["calm", "peaceful", "zen"] },
    { id: "fire-love", name: "Fire Love", character: "😍🔥", keywords: ["love", "passion", "hot"] },
  ],
  Reactions: [
    { id: "thumbs-sparkle", name: "Sparkle Thumbs", character: "👍✨", keywords: ["good", "approve", "nice"] },
    { id: "heart-pulse", name: "Heart Pulse", character: "💖💓", keywords: ["love", "heart", "pulse"] },
    { id: "laugh-tears", name: "Laugh Tears", character: "😂💧", keywords: ["funny", "laugh", "tears"] },
    { id: "surprised-bolt", name: "Shocked Bolt", character: "😮⚡", keywords: ["surprised", "shock", "wow"] },
    { id: "sad-rain", name: "Sad Rain", character: "😢🌧️", keywords: ["sad", "cry", "rain"] },
    { id: "angry-fire", name: "Angry Fire", character: "😡🔥", keywords: ["angry", "mad", "fire"] },
    { id: "clap-star", name: "Star Clap", character: "👏⭐", keywords: ["applause", "good", "star"] },
    { id: "wave-sparkle", name: "Sparkle Wave", character: "👋✨", keywords: ["hello", "wave", "greeting"] },
    { id: "peace-rainbow", name: "Rainbow Peace", character: "✌️🌈", keywords: ["peace", "rainbow", "good"] },
    { id: "muscle-lightning", name: "Power Muscle", character: "💪⚡", keywords: ["strong", "power", "energy"] },
    { id: "brain-gear", name: "Smart Brain", character: "🧠⚙️", keywords: ["smart", "thinking", "genius"] },
    { id: "eyes-magnify", name: "Eagle Eyes", character: "👀🔍", keywords: ["watching", "looking", "focus"] },
  ],
  Activities: [
    { id: "code-laptop", name: "Code Master", character: "💻⚡", keywords: ["coding", "programming", "tech"] },
    { id: "art-palette", name: "Art Creator", character: "🎨✨", keywords: ["art", "creative", "design"] },
    { id: "music-note", name: "Music Vibes", character: "🎵🎧", keywords: ["music", "sound", "audio"] },
    { id: "game-controller", name: "Game On", character: "🎮🔥", keywords: ["gaming", "play", "fun"] },
    { id: "book-wisdom", name: "Book Wisdom", character: "📚💡", keywords: ["reading", "learning", "smart"] },
    { id: "camera-snap", name: "Photo Snap", character: "📸✨", keywords: ["photo", "camera", "capture"] },
    { id: "workout-strong", name: "Workout Power", character: "🏋️💪", keywords: ["exercise", "strong", "fitness"] },
    { id: "travel-plane", name: "Travel Mode", character: "✈️🌍", keywords: ["travel", "adventure", "world"] },
    { id: "food-yum", name: "Food Love", character: "🍕❤️", keywords: ["food", "delicious", "yum"] },
    { id: "dance-party", name: "Dance Party", character: "💃🕺", keywords: ["dance", "party", "fun"] },
    { id: "sleep-zzz", name: "Sleep Time", character: "😴💤", keywords: ["sleep", "tired", "rest"] },
    { id: "work-focus", name: "Work Focus", character: "💼🎯", keywords: ["work", "focus", "business"] },
  ],
  Objects: [
    { id: "diamond-shine", name: "Diamond Shine", character: "💎✨", keywords: ["valuable", "precious", "shine"] },
    { id: "key-unlock", name: "Key Unlock", character: "🔑🔓", keywords: ["unlock", "access", "open"] },
    { id: "trophy-gold", name: "Gold Trophy", character: "🏆🥇", keywords: ["winner", "champion", "success"] },
    { id: "gift-surprise", name: "Gift Surprise", character: "🎁🎉", keywords: ["gift", "present", "surprise"] },
    { id: "clock-time", name: "Time Keeper", character: "⏰⚡", keywords: ["time", "urgent", "fast"] },
    { id: "phone-ring", name: "Phone Ring", character: "📱📞", keywords: ["call", "phone", "contact"] },
    { id: "mail-send", name: "Mail Send", character: "📧✈️", keywords: ["email", "message", "send"] },
    { id: "light-idea", name: "Bright Idea", character: "💡⚡", keywords: ["idea", "smart", "innovation"] },
    { id: "shield-protect", name: "Shield Guard", character: "🛡️⚔️", keywords: ["protect", "safe", "guard"] },
    { id: "rocket-launch", name: "Rocket Launch", character: "🚀🌟", keywords: ["launch", "start", "fast"] },
    { id: "crown-royal", name: "Royal Crown", character: "👑✨", keywords: ["royal", "king", "queen"] },
    { id: "target-hit", name: "Target Hit", character: "🎯💥", keywords: ["target", "goal", "success"] },
  ],
  Nature: [
    { id: "sun-bright", name: "Bright Sun", character: "☀️✨", keywords: ["sunny", "bright", "day"] },
    { id: "moon-stars", name: "Moon Stars", character: "🌙⭐", keywords: ["night", "stars", "peaceful"] },
    { id: "rainbow-magic", name: "Magic Rainbow", character: "🌈✨", keywords: ["colorful", "magic", "beautiful"] },
    { id: "tree-grow", name: "Growing Tree", character: "🌳🌱", keywords: ["nature", "growth", "green"] },
    { id: "flower-bloom", name: "Flower Bloom", character: "🌸🌺", keywords: ["beautiful", "bloom", "spring"] },
    { id: "ocean-wave", name: "Ocean Wave", character: "🌊🏄", keywords: ["ocean", "wave", "surf"] },
    { id: "mountain-peak", name: "Mountain Peak", character: "🏔️⛰️", keywords: ["mountain", "high", "adventure"] },
    { id: "fire-flame", name: "Fire Flame", character: "🔥💥", keywords: ["hot", "fire", "energy"] },
    { id: "snow-flake", name: "Snow Flake", character: "❄️⛄", keywords: ["cold", "winter", "snow"] },
    { id: "lightning-storm", name: "Lightning Storm", character: "⚡🌩️", keywords: ["power", "storm", "electric"] },
    { id: "earth-globe", name: "Earth Globe", character: "🌍🌎", keywords: ["world", "earth", "global"] },
    { id: "butterfly-fly", name: "Butterfly Fly", character: "🦋✨", keywords: ["beautiful", "transform", "fly"] },
  ],
}

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState("Expressions")
  const [searchTerm, setSearchTerm] = useState("")

  // Filter emojis based on search term
  const getFilteredEmojis = () => {
    if (!searchTerm) {
      return customEmojiCategories[selectedCategory as keyof typeof customEmojiCategories]
    }

    const allEmojis = Object.values(customEmojiCategories).flat()
    return allEmojis.filter(
      (emoji) =>
        emoji.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emoji.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
          <Smile className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        {/* Search bar */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search custom emojis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category tabs */}
        {!searchTerm && (
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto p-2 gap-1 scrollbar-hide">
              {Object.keys(customEmojiCategories).map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  size="sm"
                  className="text-xs whitespace-nowrap min-w-fit"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Emoji grid */}
        <div className="p-3 h-64 overflow-y-auto">
          <div className="grid grid-cols-6 gap-2">
            {getFilteredEmojis().map((emoji) => (
              <button
                key={emoji.id}
                className="text-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg p-2 transition-colors group relative"
                onClick={() => onEmojiSelect(emoji.character)}
                title={emoji.name}
              >
                <div className="text-center">{emoji.character}</div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {emoji.name}
                </div>
              </button>
            ))}
          </div>

          {/* No results message */}
          {searchTerm && getFilteredEmojis().length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Smile className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No emojis found for &quot;{searchTerm}&quot;</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
