'use client'

import { useState, useEffect } from 'react'
import {
  Bot,
  Search,
  Plus,
  Settings,
  ChevronRight,
  ChevronDown,
  Star,
  Clock,
  Zap,
  Brain,
  MessageSquare,
  Code,
  Database,
  Shield,
  Sparkles,
  Filter,
  MoreVertical,
  Info,
  Play,
  Pause,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { agentService } from '@/services/agent-service'
import { useToast } from '@/hooks/use-toast'

interface Agent {
  id: string
  name: string
  description: string
  category: 'assistant' | 'developer' | 'creative' | 'analyst' | 'custom'
  icon: React.ReactNode
  status: 'active' | 'idle' | 'disabled'
  capabilities: string[]
  lastUsed?: Date
  isFavorite?: boolean
  usage?: number
}

const categoryIcons = {
  assistant: <MessageSquare className="w-4 h-4" />,
  developer: <Code className="w-4 h-4" />,
  creative: <Sparkles className="w-4 h-4" />,
  analyst: <Database className="w-4 h-4" />,
  custom: <Bot className="w-4 h-4" />
}

const defaultAgents: Agent[] = [
  {
    id: 'general-assistant',
    name: 'General Assistant',
    description: 'Helps with general tasks, questions, and conversation',
    category: 'assistant',
    icon: <Brain className="w-5 h-5" />,
    status: 'active',
    capabilities: ['Natural Language', 'Task Management', 'Information Lookup'],
    isFavorite: true,
    usage: 150
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Specialized in programming, debugging, and code review',
    category: 'developer',
    icon: <Code className="w-5 h-5" />,
    status: 'idle',
    capabilities: ['Code Generation', 'Debugging', 'Code Review', 'Documentation'],
    usage: 89
  },
  {
    id: 'creative-writer',
    name: 'Creative Writer',
    description: 'Assists with creative writing, storytelling, and content creation',
    category: 'creative',
    icon: <Sparkles className="w-5 h-5" />,
    status: 'idle',
    capabilities: ['Story Writing', 'Content Creation', 'Editing'],
    usage: 45
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyzes data, creates visualizations, and provides insights',
    category: 'analyst',
    icon: <Database className="w-5 h-5" />,
    status: 'idle',
    capabilities: ['Data Analysis', 'Visualization', 'Statistical Analysis'],
    usage: 67
  },
  {
    id: 'security-expert',
    name: 'Security Expert',
    description: 'Focuses on security best practices and vulnerability assessment',
    category: 'developer',
    icon: <Shield className="w-5 h-5" />,
    status: 'disabled',
    capabilities: ['Security Audit', 'Best Practices', 'Vulnerability Assessment'],
    usage: 23
  }
]

interface EnhancedAgentSidebarProps {
  conversationId?: string
  onAgentSelect?: (agent: Agent) => void
  onClose?: () => void
  className?: string
}

export function EnhancedAgentSidebar({
  conversationId,
  onAgentSelect,
  onClose,
  className
}: EnhancedAgentSidebarProps) {
  const [agents, setAgents] = useState<Agent[]>(defaultAgents)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['all']))
  const { toast } = useToast()

  // Filter agents based on search and category
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group agents by category
  const groupedAgents = filteredAgents.reduce((acc, agent) => {
    if (!acc[agent.category]) {
      acc[agent.category] = []
    }
    acc[agent.category].push(agent)
    return acc
  }, {} as Record<string, Agent[]>)

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent)
    onAgentSelect?.(agent)
    
    // Update agent status
    setAgents(prev => prev.map(a => ({
      ...a,
      status: a.id === agent.id ? 'active' : 'idle',
      lastUsed: a.id === agent.id ? new Date() : a.lastUsed
    })))

    toast({
      title: `${agent.name} activated`,
      description: 'Agent is now ready to assist you',
    })
  }

  const toggleFavorite = (agentId: string) => {
    setAgents(prev => prev.map(a => 
      a.id === agentId ? { ...a, isFavorite: !a.isFavorite } : a
    ))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1) + 's'
  }

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-gray-900", className)}>
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-lg">AI Agents</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Plus className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="available" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 px-4">
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>

        {/* Available Agents */}
        <TabsContent value="available" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {Object.keys(categoryIcons).map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="gap-1"
                  >
                    {categoryIcons[category as keyof typeof categoryIcons]}
                    {getCategoryLabel(category)}
                  </Button>
                ))}
              </div>

              {/* Agents List */}
              {selectedCategory === 'all' ? (
                // Show grouped by category
                Object.entries(groupedAgents).map(([category, categoryAgents]) => (
                  <div key={category}>
                    <button
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-2 w-full text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 hover:text-gray-900 dark:hover:text-white"
                    >
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      {categoryIcons[category as keyof typeof categoryIcons]}
                      {getCategoryLabel(category)}
                      <Badge variant="secondary" className="ml-auto">
                        {categoryAgents.length}
                      </Badge>
                    </button>
                    {expandedCategories.has(category) && (
                      <div className="space-y-2 ml-6">
                        {categoryAgents.map(agent => (
                          <AgentCard
                            key={agent.id}
                            agent={agent}
                            isSelected={selectedAgent?.id === agent.id}
                            onSelect={() => handleAgentSelect(agent)}
                            onToggleFavorite={() => toggleFavorite(agent.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                // Show filtered agents
                <div className="space-y-2">
                  {filteredAgents.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgent?.id === agent.id}
                      onSelect={() => handleAgentSelect(agent)}
                      onToggleFavorite={() => toggleFavorite(agent.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Favorites */}
        <TabsContent value="favorites" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {agents.filter(a => a.isFavorite).map(agent => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  isSelected={selectedAgent?.id === agent.id}
                  onSelect={() => handleAgentSelect(agent)}
                  onToggleFavorite={() => toggleFavorite(agent.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Recent */}
        <TabsContent value="recent" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
              {agents
                .filter(a => a.lastUsed)
                .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
                .map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isSelected={selectedAgent?.id === agent.id}
                    onSelect={() => handleAgentSelect(agent)}
                    onToggleFavorite={() => toggleFavorite(agent.id)}
                  />
                ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <div className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {selectedAgent.icon}
              <div>
                <h3 className="font-medium">{selectedAgent.name}</h3>
                <p className="text-xs text-gray-500">Active in conversation</p>
              </div>
            </div>
            <Badge variant={selectedAgent.status === 'active' ? 'default' : 'secondary'}>
              {selectedAgent.status}
            </Badge>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1">
              <Settings className="w-3 h-3 mr-1" />
              Configure
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Agent Card Component
function AgentCard({
  agent,
  isSelected,
  onSelect,
  onToggleFavorite
}: {
  agent: Agent
  isSelected: boolean
  onSelect: () => void
  onToggleFavorite: () => void
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border transition-all cursor-pointer",
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg",
            agent.status === 'active' 
              ? "bg-green-100 dark:bg-green-900/30" 
              : agent.status === 'disabled'
              ? "bg-gray-100 dark:bg-gray-700"
              : "bg-gray-100 dark:bg-gray-800"
          )}>
            {agent.icon}
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-sm">{agent.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
              {agent.description}
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}>
              <Star className={cn(
                "w-4 h-4 mr-2",
                agent.isFavorite && "fill-yellow-500 text-yellow-500"
              )} />
              {agent.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Info className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1 mb-2">
        {agent.capabilities.slice(0, 2).map((cap, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {cap}
          </Badge>
        ))}
        {agent.capabilities.length > 2 && (
          <Badge variant="secondary" className="text-xs">
            +{agent.capabilities.length - 2}
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        {agent.usage && (
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {agent.usage} uses
          </div>
        )}
        {agent.lastUsed && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(agent.lastUsed).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Status Badge */}
      {agent.status === 'disabled' && (
        <Badge variant="outline" className="mt-2 text-xs">
          Disabled
        </Badge>
      )}
    </div>
  )
}
