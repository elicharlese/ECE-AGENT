"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  Bot,
  Brain,
  Zap,
  Sparkles,
  Scale,
  Palette,
  Settings,
  Plus,
  Clock,
  Star,
  X,
} from "lucide-react"
import { CreateAgentDialog } from "@/components/agents/CreateAgentDialog"
import type { Agent } from "@/services/agent-service"
import { useAgentsQuery } from "@/hooks/use-agents"
import { useResponsiveLayout } from "@/hooks/use-responsive-layout"

interface AgentSidebarProps {
  selectedAgentId?: string
  onSelectAgent: (agentId: string) => void
  panelState: "expanded" | "minimized" | "collapsed"
  onSetPanelState: (state: "expanded" | "minimized" | "collapsed") => void
}

export function AgentSidebar({ selectedAgentId, onSelectAgent, panelState, onSetPanelState }: AgentSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [filterMode, setFilterMode] = useState<"all" | "favorites" | "recents">("all")
  const [favorites, setFavorites] = useState<string[]>([])
  const [recents, setRecents] = useState<Record<string, number>>({})
  const { data: userAgentsData, isLoading: loadingAgents } = useAgentsQuery()
  const { screenSize, orientation, isMobile } = useResponsiveLayout()
  const isSmallOverlay = isMobile || (screenSize === "tablet" && orientation === "portrait")

  // Pinned, always-available marketing/quick-access agents
  const agents = [
    {
      id: "smart-assistant",
      name: "Smart Assistant",
      icon: Brain,
      status: "online",
      lastMessage: "",
      timestamp: "",
      unread: 0,
      color: "bg-indigo-500",
      description: "General AI helper for any task",
    },
    {
      id: "code-companion",
      name: "Code Companion",
      icon: Zap,
      status: "online",
      lastMessage: "",
      timestamp: "",
      unread: 0,
      color: "bg-orange-500",
      description: "Programming and development assistant",
    },
    {
      id: "creative-writer",
      name: "Creative Writer",
      icon: Sparkles,
      status: "online",
      lastMessage: "",
      timestamp: "",
      unread: 0,
      color: "bg-pink-500",
      description: "Writing and content creation",
    },
    {
      id: "legal-assistant",
      name: "Legal Assistant",
      icon: Scale,
      status: "online",
      lastMessage: "",
      timestamp: "",
      unread: 0,
      color: "bg-blue-600",
      description: "Legal research and document analysis",
    },
    {
      id: "designer-agent",
      name: "Designer Agent",
      icon: Palette,
      status: "away",
      lastMessage: "",
      timestamp: "",
      unread: 0,
      color: "bg-purple-500",
      description: "Creative design and visual content",
    },
  ]

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredUserAgents: Agent[] = (userAgentsData ?? []).filter(
    (a: Agent) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Persisted favorites/recents helpers
  useEffect(() => {
    try {
      const fav = JSON.parse(localStorage.getItem("agentSidebar.favorites") || "[]")
      const rec = JSON.parse(localStorage.getItem("agentSidebar.recents") || "{}")
      if (Array.isArray(fav)) setFavorites(fav)
      if (rec && typeof rec === "object") setRecents(rec)
    } catch {}
  }, [])

  const saveFavorites = (next: string[]) => {
    setFavorites(next)
    try { localStorage.setItem("agentSidebar.favorites", JSON.stringify(next)) } catch {}
  }

  const toggleFavorite = (id: string) => {
    const set = new Set(favorites)
    if (set.has(id)) {
      set.delete(id)
    } else {
      set.add(id)
    }
    saveFavorites(Array.from(set))
  }

  const recordRecent = (id: string) => {
    const next = { ...recents, [id]: Date.now() }
    setRecents(next)
    try { localStorage.setItem("agentSidebar.recents", JSON.stringify(next)) } catch {}
  }

  const handleSelect = (id: string) => {
    recordRecent(id)
    onSelectAgent(id)
  }

  const applyFilterMode = <T extends { id: string }>(list: T[]): T[] => {
    if (filterMode === "favorites") {
      return list.filter((i) => favorites.includes(i.id))
    }
    if (filterMode === "recents") {
      const withTs = list
        .map((i) => ({ item: i, ts: recents[i.id] ?? 0 }))
        .filter((x) => x.ts > 0)
        .sort((a, b) => b.ts - a.ts)
        .map((x) => x.item)
      return withTs
    }
    return list
  }

  const displayAgents = applyFilterMode<typeof agents[number]>(filteredAgents)
  const displayUserAgents: Agent[] = applyFilterMode<Agent>(filteredUserAgents)

  // Demo gating: show pinned agents only in demo mode or when there are no user agents
  const hasAnyUserAgents = (userAgentsData?.length ?? 0) > 0
  const demoMode = (process.env.NEXT_PUBLIC_DEMO_MODE ?? "").toLowerCase() === "true"
  const shouldShowPinned = demoMode || !hasAnyUserAgents
  const pinnedToRender = shouldShowPinned ? displayAgents : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      default:
        return "bg-gray-400"
    }
  }

  if (panelState === "collapsed") {
    return null
  }

  if (panelState === "minimized") {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 flex flex-col items-center py-4">
        <Button variant="ghost" size="sm" onClick={() => onSetPanelState("expanded")} className="mb-3" aria-label="Expand agents sidebar">
          <Bot className="h-5 w-5" />
        </Button>
        {/* Collapsed quick actions + scrollable pinned agents */}
        <ScrollArea className="w-full flex-1 px-2" hideScrollbar>
          <div className="flex flex-col items-center gap-2 pb-2">
            {(pinnedToRender).map((agent) => (
              <Button
                key={agent.id}
                title={agent.name}
                aria-label={agent.name}
                variant={selectedAgentId === agent.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onSelectAgent(agent.id)}
                className={`w-10 h-10 p-0 relative ${selectedAgentId === agent.id ? "ring-2 ring-indigo-500" : ""}`}
              >
                <agent.icon className="h-4 w-4" />
                {agent.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {agent.unread}
                  </div>
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
        {/* Bottom actions (collapsed) */}
        <div className="w-full px-2 pt-2 border-t border-transparent flex items-center justify-center gap-2">
          <Button
            title="New Assistant"
            aria-label="New Assistant"
            variant="ghost"
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="w-10 h-10 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            title="Settings"
            aria-label="Settings"
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <CreateAgentDialog
          open={createOpen}
          onOpenChange={(o) => setCreateOpen(o)}
        />
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-transparent">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">AI Agents</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Moved quick-action icons to the header top-right */}
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => setShowSearch((s) => !s)}
            aria-label={showSearch ? "Hide search" : "Show search"}
            title={showSearch ? "Hide search" : "Search"}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant={filterMode === "favorites" ? "default" : "ghost"}
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => setFilterMode((m) => (m === "favorites" ? "all" : "favorites"))}
            aria-label="Favorites"
            title="Favorites"
          >
            <Star className={`h-4 w-4 ${filterMode === "favorites" ? "text-yellow-500" : ""}`} />
          </Button>
          <Button
            variant={filterMode === "recents" ? "default" : "ghost"}
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => setFilterMode((m) => (m === "recents" ? "all" : "recents"))}
            aria-label="Recents"
            title="Recents"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => setCreateOpen(true)}
            aria-label="New Assistant"
            title="New Assistant"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {isSmallOverlay && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Close agents sidebar"
              onClick={() => onSetPanelState("collapsed")}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Toolbar: show search input only when toggled */}
      <div className="p-2 border-b border-transparent">
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-transparent"
            />
          </div>
        )}
      </div>

      {/* Agent List: Pinned + My Agents */}
      <ScrollArea className="flex-1" hideScrollbar>
        <div className="p-2">
          {pinnedToRender.map((agent) => (
            <div
              key={agent.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(agent.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(agent.id) }
              }}
              className={`
                w-full p-3 rounded-lg mb-2 text-left transition-all duration-200
                hover:bg-gray-50 dark:hover:bg-gray-700
                ${
                  selectedAgentId === agent.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-transparent"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700"
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Agent Avatar */}
                <div className="relative">
                  <div className={`p-2 rounded-full ${agent.color} text-white`}>
                    <agent.icon className="h-4 w-4" />
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(
                      agent.status,
                    )}`}
                  />
                </div>

                {/* Agent Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{agent.name}</h3>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(agent.id) }}
                        className="text-xs text-gray-400 hover:text-yellow-500"
                        aria-label={favorites.includes(agent.id) ? "Unfavorite" : "Favorite"}
                        title={favorites.includes(agent.id) ? "Unfavorite" : "Favorite"}
                      >
                        <Star className={`h-3.5 w-3.5 ${favorites.includes(agent.id) ? "text-yellow-500" : ""}`} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      {agent.unread > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          {agent.unread}
                        </Badge>
                      )}
                      {agent.timestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{agent.timestamp}</span>
                      )}
                    </div>
                  </div>
                  {!!agent.lastMessage && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{agent.lastMessage}</p>
                  )}
                  {!!agent.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {/* My Agents */}
          {(loadingAgents || displayUserAgents.length > 0) && (
            <div className="mt-4">
              <div className="px-2 py-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">My Agents</div>
              {loadingAgents && (
                <div className="text-xs text-gray-500 px-2 py-2">Loading…</div>
              )}
              {displayUserAgents.map((a) => (
                <div
                  key={a.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(a.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSelect(a.id) } }}
                  className={`
                    w-full p-3 rounded-lg mb-2 text-left transition-all duration-200
                    hover:bg-gray-50 dark:hover:bg-gray-700
                    ${selectedAgentId === a.id ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" : ""}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Default icon */}
                    <div className="relative">
                      <div className={`p-2 rounded-full bg-gray-500 text-white`}>
                        <Bot className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">{a.name}</h3>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(a.id) }}
                            className="text-xs text-gray-400 hover:text-yellow-500"
                            aria-label={favorites.includes(a.id) ? "Unfavorite" : "Favorite"}
                            title={favorites.includes(a.id) ? "Unfavorite" : "Favorite"}
                          >
                            <Star className={`h-3.5 w-3.5 ${favorites.includes(a.id) ? "text-yellow-500" : ""}`} />
                          </button>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{a.status}</span>
                      </div>
                      {!!a.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-1">{a.description}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{a.capabilities?.length ? `${a.capabilities.length} capabilities` : "custom"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* No results */}
        {pinnedToRender.length === 0 && displayUserAgents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No agents found</p>
            {searchTerm && <p className="text-sm">Try a different search term</p>}
          </div>
        )}

        {/* My Agents zero state */}
        {!loadingAgents && displayUserAgents.length === 0 && (
          <div className="mt-4">
            <div className="px-2 py-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">My Agents</div>
            <div className="text-center py-6 text-sm text-gray-600 dark:text-gray-300">
              <Bot className="h-6 w-6 mx-auto mb-2 opacity-50" />
              <p>No custom agents yet.</p>
              <Button size="sm" className="mt-2" onClick={() => setCreateOpen(true)}>Create agent</Button>
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-transparent">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{pinnedToRender.length + displayUserAgents.length} agents</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>All systems online</span>
          </div>
        </div>
      </div>
      <CreateAgentDialog
        open={createOpen}
        onOpenChange={(o) => setCreateOpen(o)}
      />
    </div>
  )
}
