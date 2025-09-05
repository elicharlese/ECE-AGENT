"use client"

import { useState, useMemo } from "react"
import { Button } from '@/libs/design-system'
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { Input } from '@/libs/design-system'
import { Search, Filter, TrendingUp, Star, Eye, Zap, Crown, Target } from "lucide-react"

export interface AppDiscovery {
  id: string
  name: string
  description: string
  category: string
  developer: string
  rating: number
  downloads: string
  size: string
  lastUpdated: Date
  isInstalled: boolean
  isFeatured: boolean
  isNew: boolean
  isTrending: boolean
  tags: string[]
  screenshots: string[]
  reviews: AppReview[]
  analytics: AppAnalytics
  compatibility: string[]
  permissions: string[]
  price?: string
  isFree: boolean
}

export interface AppReview {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  timestamp: Date
  helpful: number
  verified: boolean
}

export interface AppAnalytics {
  totalDownloads: number
  activeUsers: number
  retentionRate: number
  averageSessionTime: number
  crashRate: number
  updateFrequency: number
  popularityScore: number
  engagementScore: number
}

export interface DiscoveryFilters {
  category: string
  rating: number
  price: "all" | "free" | "paid"
  compatibility: string[]
  features: string[]
  sortBy: "popularity" | "rating" | "downloads" | "recent" | "name"
  showOnly: "all" | "featured" | "new" | "trending"
}

const mockApps: AppDiscovery[] = [
  {
    id: "smart-assistant-pro",
    name: "Smart Assistant Pro",
    description: "Advanced AI assistant with natural language processing and task automation",
    category: "agents",
    developer: "AI Labs Pro",
    rating: 4.9,
    downloads: "500K+",
    size: "15.2 MB",
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isInstalled: false,
    isFeatured: true,
    isNew: false,
    isTrending: true,
    tags: ["AI", "Assistant", "Productivity", "Natural Language"],
    screenshots: ["/placeholder.svg?height=300&width=200"],
    reviews: [
      {
        id: "rev-1",
        userId: "user-1",
        userName: "Alex Chen",
        rating: 5,
        comment: "Incredible AI assistant! Saves me hours every day.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        helpful: 23,
        verified: true,
      },
    ],
    analytics: {
      totalDownloads: 523847,
      activeUsers: 89234,
      retentionRate: 87.5,
      averageSessionTime: 12.3,
      crashRate: 0.02,
      updateFrequency: 2.1,
      popularityScore: 95,
      engagementScore: 92,
    },
    compatibility: ["web", "mobile", "desktop"],
    permissions: ["Internet Access", "Calendar Access", "Contact Access"],
    price: "$9.99/mo",
    isFree: false,
  },
  {
    id: "secure-vote-plus",
    name: "Secure Vote Plus",
    description: "Enterprise-grade secure voting with advanced cryptographic protocols",
    category: "mpc",
    developer: "CryptoSec Enterprise",
    rating: 4.7,
    downloads: "50K+",
    size: "8.9 MB",
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isInstalled: true,
    isFeatured: true,
    isNew: false,
    isTrending: false,
    tags: ["Security", "Voting", "Cryptography", "Enterprise"],
    screenshots: ["/placeholder.svg?height=300&width=200"],
    reviews: [],
    analytics: {
      totalDownloads: 52341,
      activeUsers: 8934,
      retentionRate: 94.2,
      averageSessionTime: 8.7,
      crashRate: 0.01,
      updateFrequency: 1.5,
      popularityScore: 78,
      engagementScore: 88,
    },
    compatibility: ["web", "desktop"],
    permissions: ["Network Access", "Cryptographic Operations"],
    price: "$49.99",
    isFree: false,
  },
  {
    id: "ai-image-creator",
    name: "AI Image Creator",
    description: "Generate stunning images with advanced AI models and creative tools",
    category: "ai-tools",
    developer: "CreativeAI Studio",
    rating: 4.8,
    downloads: "1M+",
    size: "45.6 MB",
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isInstalled: false,
    isFeatured: false,
    isNew: true,
    isTrending: true,
    tags: ["AI", "Image Generation", "Creative", "Art"],
    screenshots: ["/placeholder.svg?height=300&width=200"],
    reviews: [],
    analytics: {
      totalDownloads: 1234567,
      activeUsers: 234567,
      retentionRate: 76.8,
      averageSessionTime: 18.9,
      crashRate: 0.05,
      updateFrequency: 3.2,
      popularityScore: 89,
      engagementScore: 85,
    },
    compatibility: ["web", "mobile", "desktop"],
    permissions: ["Internet Access", "File System Access"],
    isFree: true,
  },
  {
    id: "team-calculator",
    name: "Team Calculator",
    description: "Collaborative calculator with real-time sharing and advanced functions",
    category: "utilities",
    developer: "MathTools Inc",
    rating: 4.4,
    downloads: "250K+",
    size: "3.2 MB",
    lastUpdated: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    isInstalled: true,
    isFeatured: false,
    isNew: false,
    isTrending: false,
    tags: ["Calculator", "Collaboration", "Math", "Utilities"],
    screenshots: ["/placeholder.svg?height=300&width=200"],
    reviews: [],
    analytics: {
      totalDownloads: 267834,
      activeUsers: 45678,
      retentionRate: 68.3,
      averageSessionTime: 5.4,
      crashRate: 0.03,
      updateFrequency: 1.8,
      popularityScore: 65,
      engagementScore: 72,
    },
    compatibility: ["web", "mobile"],
    permissions: ["Internet Access"],
    isFree: true,
  },
]

interface MarketplaceDiscoveryProps {
  onInstallApp: (appId: string) => void
  onViewApp: (app: AppDiscovery) => void
}

export function MarketplaceDiscovery({ onInstallApp, onViewApp }: MarketplaceDiscoveryProps) {
  const [apps] = useState<AppDiscovery[]>(mockApps)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<DiscoveryFilters>({
    category: "all",
    rating: 0,
    price: "all",
    compatibility: [],
    features: [],
    sortBy: "popularity",
    showOnly: "all",
  })
  const [showFilters, setShowFilters] = useState(false)

  const filteredAndSortedApps = useMemo(() => {
    const filtered = apps.filter((app) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          app.developer.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category !== "all" && app.category !== filters.category) return false

      // Rating filter
      if (filters.rating > 0 && app.rating < filters.rating) return false

      // Price filter
      if (filters.price === "free" && !app.isFree) return false
      if (filters.price === "paid" && app.isFree) return false

      // Show only filter
      if (filters.showOnly === "featured" && !app.isFeatured) return false
      if (filters.showOnly === "new" && !app.isNew) return false
      if (filters.showOnly === "trending" && !app.isTrending) return false

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "popularity":
          return b.analytics.popularityScore - a.analytics.popularityScore
        case "rating":
          return b.rating - a.rating
        case "downloads":
          return b.analytics.totalDownloads - a.analytics.totalDownloads
        case "recent":
          return b.lastUpdated.getTime() - a.lastUpdated.getTime()
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [apps, searchQuery, filters])

  const recommendations = useMemo(() => {
    // Simple recommendation algorithm based on installed apps and ratings
    const installedCategories = apps.filter((app) => app.isInstalled).map((app) => app.category)
    return apps
      .filter((app) => !app.isInstalled && (installedCategories.includes(app.category) || app.isFeatured))
      .sort((a, b) => b.analytics.popularityScore - a.analytics.popularityScore)
      .slice(0, 4)
  }, [apps])

  const trendingApps = apps.filter((app) => app.isTrending).slice(0, 3)
  const featuredApps = apps.filter((app) => app.isFeatured).slice(0, 3)

  const categories = [
    { id: "all", name: "All Categories", count: apps.length },
    { id: "agents", name: "AI Agents", count: apps.filter((a) => a.category === "agents").length },
    { id: "mpc", name: "MPC", count: apps.filter((a) => a.category === "mpc").length },
    { id: "ai-tools", name: "AI Tools", count: apps.filter((a) => a.category === "ai-tools").length },
    { id: "utilities", name: "Utilities", count: apps.filter((a) => a.category === "utilities").length },
    { id: "games", name: "Games", count: apps.filter((a) => a.category === "games").length },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search apps, agents, tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Min Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price</label>
                  <select
                    value={filters.price}
                    onChange={(e) => setFilters((prev) => ({ ...prev, price: e.target.value as any }))}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="all">All Apps</option>
                    <option value="free">Free Only</option>
                    <option value="paid">Paid Only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full p-2 border rounded-md text-sm"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="rating">Rating</option>
                    <option value="downloads">Downloads</option>
                    <option value="recent">Recently Updated</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant={filters.showOnly === "all" ? "default" : "outline"}
          onClick={() => setFilters((prev) => ({ ...prev, showOnly: "all" }))}
        >
          All Apps
        </Button>
        <Button
          size="sm"
          variant={filters.showOnly === "featured" ? "default" : "outline"}
          onClick={() => setFilters((prev) => ({ ...prev, showOnly: "featured" }))}
        >
          <Crown className="h-3 w-3 mr-1" />
          Featured
        </Button>
        <Button
          size="sm"
          variant={filters.showOnly === "trending" ? "default" : "outline"}
          onClick={() => setFilters((prev) => ({ ...prev, showOnly: "trending" }))}
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          Trending
        </Button>
        <Button
          size="sm"
          variant={filters.showOnly === "new" ? "default" : "outline"}
          onClick={() => setFilters((prev) => ({ ...prev, showOnly: "new" }))}
        >
          <Zap className="h-3 w-3 mr-1" />
          New
        </Button>
      </div>

      {/* Discovery Sections */}
      {searchQuery === "" && filters.showOnly === "all" && (
        <div className="space-y-6">
          {/* Featured Apps */}
          {featuredApps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <h3 className="text-lg font-semibold">Featured Apps</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredApps.map((app) => (
                  <FeaturedAppCard key={app.id} app={app} onInstall={() => onInstallApp(app.id)} onView={onViewApp} />
                ))}
              </div>
            </div>
          )}

          {/* Trending Apps */}
          {trendingApps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Trending Now</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {trendingApps.map((app) => (
                  <TrendingAppCard key={app.id} app={app} onInstall={() => onInstallApp(app.id)} onView={onViewApp} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Recommended for You</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendations.map((app) => (
                  <RecommendationCard
                    key={app.id}
                    app={app}
                    onInstall={() => onInstallApp(app.id)}
                    onView={onViewApp}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {searchQuery ? `Search Results (${filteredAndSortedApps.length})` : "All Apps"}
          </h3>
          <div className="text-sm text-gray-500">
            Showing {filteredAndSortedApps.length} of {apps.length} apps
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedApps.map((app) => (
            <AppDiscoveryCard key={app.id} app={app} onInstall={() => onInstallApp(app.id)} onView={onViewApp} />
          ))}
        </div>
      </div>
    </div>
  )
}

function FeaturedAppCard({
  app,
  onInstall,
  onView,
}: {
  app: AppDiscovery
  onInstall: () => void
  onView: (app: AppDiscovery) => void
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <Badge variant="secondary" className="text-xs">
              Featured
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{app.rating}</span>
          </div>
        </div>
        <CardTitle className="text-lg">{app.name}</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300">{app.developer}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{app.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{app.downloads} downloads</span>
          <span>{app.size}</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onInstall} disabled={app.isInstalled} className="flex-1">
            {app.isInstalled ? "Installed" : "Install"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onView(app)}>
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TrendingAppCard({
  app,
  onInstall,
  onView,
}: {
  app: AppDiscovery
  onInstall: () => void
  onView: (app: AppDiscovery) => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="text-xs">
              Trending
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{app.rating}</span>
          </div>
        </div>
        <CardTitle className="text-sm">{app.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{app.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{app.downloads}</span>
          <span>Popularity: {app.analytics.popularityScore}</span>
        </div>
        <Button size="sm" onClick={onInstall} disabled={app.isInstalled} className="w-full">
          {app.isInstalled ? "Installed" : "Install"}
        </Button>
      </CardContent>
    </Card>
  )
}

function RecommendationCard({
  app,
  onInstall,
  onView,
}: {
  app: AppDiscovery
  onInstall: () => void
  onView: (app: AppDiscovery) => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            Recommended
          </Badge>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs">{app.rating}</span>
          </div>
        </div>
        <CardTitle className="text-sm">{app.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-1">{app.description}</p>
        <Button size="sm" onClick={onInstall} className="w-full">
          Install
        </Button>
      </CardContent>
    </Card>
  )
}

function AppDiscoveryCard({
  app,
  onInstall,
  onView,
}: {
  app: AppDiscovery
  onInstall: () => void
  onView: (app: AppDiscovery) => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onView(app)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-sm">{app.name}</CardTitle>
              {app.isFeatured && <Crown className="h-3 w-3 text-yellow-500" />}
              {app.isTrending && <TrendingUp className="h-3 w-3 text-green-500" />}
              {app.isNew && <Zap className="h-3 w-3 text-blue-500" />}
            </div>
            <p className="text-xs text-gray-500">{app.developer}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{app.rating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{app.description}</p>

        <div className="flex flex-wrap gap-1">
          {app.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {app.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{app.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{app.downloads}</span>
          <span>{app.size}</span>
          <span>{!app.isFree && app.price}</span>
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" onClick={onInstall} disabled={app.isInstalled} className="flex-1">
            {app.isInstalled ? "Installed" : "Install"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onView(app)}>
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
