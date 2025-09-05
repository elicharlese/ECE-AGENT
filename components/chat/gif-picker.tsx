"use client"

import { useState, useEffect } from "react"
import { Button, Input, ScrollArea, Popover, PopoverContent, PopoverTrigger } from '@/libs/design-system';
import { ImageIcon, Search, Loader2, Zap } from "lucide-react"

interface GifData {
  id: string
  title: string
  url: string
  preview_url: string
  width: number
  height: number
}

interface GifPickerProps {
  onGifSelect: (gif: GifData) => void
}

export function GifPicker({ onGifSelect }: GifPickerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [gifs, setGifs] = useState<GifData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("trending")

  // Mock GIF data for demonstration (in real app, would use Giphy/Tenor API)
  const mockGifs: GifData[] = [
    {
      id: "1",
      title: "Happy Dance",
      url: "/placeholder.svg?height=200&width=200",
      preview_url: "/placeholder.svg?height=100&width=100",
      width: 200,
      height: 200,
    },
    {
      id: "2",
      title: "Thumbs Up",
      url: "/placeholder.svg?height=150&width=200",
      preview_url: "/placeholder.svg?height=75&width=100",
      width: 200,
      height: 150,
    },
    {
      id: "3",
      title: "Mind Blown",
      url: "/placeholder.svg?height=180&width=180",
      preview_url: "/placeholder.svg?height=90&width=90",
      width: 180,
      height: 180,
    },
    {
      id: "4",
      title: "Celebration",
      url: "/placeholder.svg?height=220&width=200",
      preview_url: "/placeholder.svg?height=110&width=100",
      width: 200,
      height: 220,
    },
    {
      id: "5",
      title: "Laughing",
      url: "/placeholder.svg?height=160&width=200",
      preview_url: "/placeholder.svg?height=80&width=100",
      width: 200,
      height: 160,
    },
    {
      id: "6",
      title: "High Five",
      url: "/placeholder.svg?height=180&width=200",
      preview_url: "/placeholder.svg?height=90&width=100",
      width: 200,
      height: 180,
    },
    {
      id: "7",
      title: "Thinking",
      url: "/placeholder.svg?height=170&width=170",
      preview_url: "/placeholder.svg?height=85&width=85",
      width: 170,
      height: 170,
    },
    {
      id: "8",
      title: "Shocked",
      url: "/placeholder.svg?height=190&width=200",
      preview_url: "/placeholder.svg?height=95&width=100",
      width: 200,
      height: 190,
    },
  ]

  const categories = [
    { id: "trending", name: "Trending", icon: Zap },
    { id: "reactions", name: "Reactions", icon: ImageIcon },
    { id: "emotions", name: "Emotions", icon: ImageIcon },
    { id: "animals", name: "Animals", icon: ImageIcon },
    { id: "sports", name: "Sports", icon: ImageIcon },
  ]

  // Simulate API search
  const searchGifs = async (query: string, category = "trending") => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    let filteredGifs = mockGifs

    if (query) {
      filteredGifs = mockGifs.filter((gif) => gif.title.toLowerCase().includes(query.toLowerCase()))
    }

    // Add category-specific filtering logic here
    if (category === "reactions") {
      filteredGifs = filteredGifs.filter((gif) =>
        ["thumbs up", "mind blown", "celebration", "high five"].some((reaction) =>
          gif.title.toLowerCase().includes(reaction),
        ),
      )
    }

    setGifs(filteredGifs)
    setLoading(false)
  }

  // Load trending GIFs on mount
  useEffect(() => {
    searchGifs("", selectedCategory)
  }, [selectedCategory])

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        searchGifs(searchTerm, selectedCategory)
      } else {
        searchGifs("", selectedCategory)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
          aria-label="Open GIF picker"
        >
          <ImageIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        {/* Header with search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search GIFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto p-2 gap-1 scrollbar-hide">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                className="text-xs whitespace-nowrap min-w-fit flex items-center gap-1"
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="h-3 w-3" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* GIF grid */}
        <div className="p-3 h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                <p className="text-sm text-gray-500">Loading GIFs...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {gifs.map((gif) => (
                <button
                  key={gif.id}
                  className="relative group rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all duration-200"
                  onClick={() => onGifSelect(gif)}
                  title={gif.title}
                >
                  <img
                    src={gif.preview_url || "/placeholder.svg"}
                    alt={gif.title}
                    className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                      {gif.title}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {!loading && gifs.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No GIFs found</p>
              {searchTerm && <p className="text-sm">Try a different search term</p>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 text-center">Powered by GIF Search • {gifs.length} results</p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
