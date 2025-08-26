"use client"

import { useState } from "react"
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
  ChevronLeft,
  Settings,
  Plus,
  Clock,
  Star,
} from "lucide-react"

interface AgentSidebarProps {
  selectedAgentId?: string
  onSelectAgent: (agentId: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function AgentSidebar({ selectedAgentId, onSelectAgent, collapsed, onToggleCollapse }: AgentSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const agents = [
    {
      id: "smart-assistant",
      name: "Smart Assistant",
      icon: Brain,
      status: "online",
      lastMessage: "How can I help you today?",
      timestamp: "2:34 PM",
      unread: 0,
      color: "bg-indigo-500",
      description: "General AI helper for any task",
    },
    {
      id: "code-companion",
      name: "Code Companion",
      icon: Zap,
      status: "online",
      lastMessage: "Ready to help with coding!",
      timestamp: "1:15 PM",
      unread: 2,
      color: "bg-orange-500",
      description: "Programming and development assistant",
    },
    {
      id: "creative-writer",
      name: "Creative Writer",
      icon: Sparkles,
      status: "online",
      lastMessage: "Let's create something amazing",
      timestamp: "12:45 PM",
      unread: 0,
      color: "bg-pink-500",
      description: "Writing and content creation",
    },
    {
      id: "legal-assistant",
      name: "Legal Assistant",
      icon: Scale,
      status: "online",
      lastMessage: "Legal research completed",
      timestamp: "Yesterday",
      unread: 1,
      color: "bg-blue-600",
      description: "Legal research and document analysis",
    },
    {
      id: "designer-agent",
      name: "Designer Agent",
      icon: Palette,
      status: "away",
      lastMessage: "Design concepts ready for review",
      timestamp: "Yesterday",
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

  if (collapsed) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-800 flex flex-col items-center py-4">
        <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="mb-4">
          <Bot className="h-5 w-5" />
        </Button>
        <div className="flex flex-col gap-2">
          {agents.slice(0, 4).map((agent) => (
            <Button
              key={agent.id}
              variant={selectedAgentId === agent.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onSelectAgent(agent.id)}
              className="w-10 h-10 p-0 relative"
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
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white dark:bg-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          {/* Removed branding text */}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
            <Star className="h-3 w-3" />
            Favorites
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
            <Clock className="h-3 w-3" />
            Recent
          </Button>
        </div>
      </div>

      {/* Agent List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`
                w-full p-3 rounded-lg mb-2 text-left transition-all duration-200
                hover:bg-gray-50 dark:hover:bg-gray-700
                ${
                  selectedAgentId === agent.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
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
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">{agent.name}</h3>
                    <div className="flex items-center gap-1">
                      {agent.unread > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          {agent.unread}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">{agent.timestamp}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-1">{agent.lastMessage}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{agent.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* No results */}
        {filteredAgents.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No agents found</p>
            {searchTerm && <p className="text-sm">Try a different search term</p>}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{filteredAgents.length} agents</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>All systems online</span>
          </div>
        </div>
      </div>
    </div>
  )
}
