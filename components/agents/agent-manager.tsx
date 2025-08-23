"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Bot, Play, Pause, Square, MessageSquare, Brain, Activity, Clock, Zap, AlertCircle } from "lucide-react"

export interface Agent {
  id: string
  name: string
  description: string
  type: "assistant" | "code" | "research" | "creative" | "custom"
  status: "active" | "idle" | "busy" | "offline" | "error"
  capabilities: string[]
  permissions: string[]
  memory: AgentMemory
  config: AgentConfig
  stats: AgentStats
  lastActive: Date
  createdAt: Date
}

export interface AgentMemory {
  conversations: ConversationMemory[]
  facts: string[]
  preferences: Record<string, any>
  context: Record<string, any>
}

export interface ConversationMemory {
  id: string
  userId: string
  messages: Array<{
    role: "user" | "agent"
    content: string
    timestamp: Date
  }>
  summary: string
}

export interface AgentConfig {
  personality: string
  responseStyle: "formal" | "casual" | "technical" | "creative"
  maxMemorySize: number
  autoLearn: boolean
  proactive: boolean
  collaborationMode: boolean
}

export interface AgentStats {
  totalInteractions: number
  successfulTasks: number
  averageResponseTime: number
  uptime: number
  errorCount: number
}

const mockAgents: Agent[] = [
  {
    id: "assistant-1",
    name: "Alex Assistant",
    description: "General-purpose AI assistant for daily tasks and questions",
    type: "assistant",
    status: "active",
    capabilities: ["Natural Language Processing", "Task Management", "Information Retrieval", "Scheduling"],
    permissions: ["Calendar Access", "Contact Access", "Internet Access"],
    memory: {
      conversations: [],
      facts: ["User prefers morning meetings", "Works in tech industry"],
      preferences: { timezone: "UTC-8", language: "en" },
      context: { currentProject: "Chat App Development" },
    },
    config: {
      personality: "Helpful and professional with a friendly tone",
      responseStyle: "casual",
      maxMemorySize: 1000,
      autoLearn: true,
      proactive: true,
      collaborationMode: true,
    },
    stats: {
      totalInteractions: 1247,
      successfulTasks: 1198,
      averageResponseTime: 1.2,
      uptime: 99.2,
      errorCount: 12,
    },
    lastActive: new Date(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "code-1",
    name: "CodeMaster",
    description: "Specialized coding assistant for development tasks",
    type: "code",
    status: "idle",
    capabilities: ["Code Generation", "Bug Detection", "Code Review", "Documentation", "Architecture Design"],
    permissions: ["File System Access", "Internet Access", "Repository Access"],
    memory: {
      conversations: [],
      facts: ["User prefers TypeScript", "Uses React and Next.js"],
      preferences: { codeStyle: "functional", framework: "react" },
      context: { currentLanguage: "typescript" },
    },
    config: {
      personality: "Technical expert with clear explanations",
      responseStyle: "technical",
      maxMemorySize: 2000,
      autoLearn: true,
      proactive: false,
      collaborationMode: true,
    },
    stats: {
      totalInteractions: 856,
      successfulTasks: 823,
      averageResponseTime: 2.1,
      uptime: 97.8,
      errorCount: 8,
    },
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "research-1",
    name: "DataExplorer",
    description: "Research and data analysis specialist",
    type: "research",
    status: "busy",
    capabilities: ["Data Analysis", "Web Scraping", "Report Generation", "Trend Analysis", "Market Research"],
    permissions: ["Internet Access", "File System Access", "External APIs", "Database Access"],
    memory: {
      conversations: [],
      facts: ["User interested in AI trends", "Focuses on tech industry data"],
      preferences: { reportFormat: "detailed", visualizations: true },
      context: { currentResearch: "AI Market Analysis" },
    },
    config: {
      personality: "Analytical and thorough researcher",
      responseStyle: "formal",
      maxMemorySize: 3000,
      autoLearn: true,
      proactive: true,
      collaborationMode: false,
    },
    stats: {
      totalInteractions: 432,
      successfulTasks: 401,
      averageResponseTime: 5.7,
      uptime: 94.5,
      errorCount: 15,
    },
    lastActive: new Date(Date.now() - 30 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: "legal-1",
    name: "LegalAdvisor",
    description: "Specialized legal research and document analysis assistant",
    type: "custom",
    status: "idle",
    capabilities: [
      "Legal Research",
      "Document Analysis",
      "Contract Review",
      "Compliance Check",
      "Case Law Search",
      "Legal Writing",
    ],
    permissions: ["Internet Access", "File System Access", "Legal Database Access", "Document Scanner"],
    memory: {
      conversations: [],
      facts: ["User works in corporate law", "Specializes in contract law", "Prefers detailed legal citations"],
      preferences: { jurisdiction: "US Federal", citationStyle: "Bluebook", language: "en" },
      context: { currentCase: "Contract Dispute Analysis", practiceArea: "Corporate Law" },
    },
    config: {
      personality: "Professional, precise, and thorough legal expert",
      responseStyle: "formal",
      maxMemorySize: 5000,
      autoLearn: true,
      proactive: false,
      collaborationMode: true,
    },
    stats: {
      totalInteractions: 289,
      successfulTasks: 276,
      averageResponseTime: 8.3,
      uptime: 96.8,
      errorCount: 5,
    },
    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
  {
    id: "creator-1",
    name: "CreativeStudio",
    description: "AI creative assistant for design, content creation, and artistic projects",
    type: "creative",
    status: "active",
    capabilities: [
      "Design Generation",
      "Content Creation",
      "Brand Development",
      "Image Editing",
      "Creative Writing",
      "Color Theory",
      "Typography",
    ],
    permissions: ["File System Access", "Internet Access", "Media Library Access", "Design Tools Access"],
    memory: {
      conversations: [],
      facts: ["User prefers modern minimalist design", "Works on tech startup branding", "Likes bold color schemes"],
      preferences: { designStyle: "modern", colorPalette: "vibrant", typography: "sans-serif" },
      context: { currentProject: "Brand Identity Design", clientIndustry: "Technology" },
    },
    config: {
      personality: "Creative, inspiring, and detail-oriented design expert",
      responseStyle: "creative",
      maxMemorySize: 4000,
      autoLearn: true,
      proactive: true,
      collaborationMode: true,
    },
    stats: {
      totalInteractions: 756,
      successfulTasks: 721,
      averageResponseTime: 3.8,
      uptime: 98.1,
      errorCount: 9,
    },
    lastActive: new Date(Date.now() - 15 * 60 * 1000),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
]

interface AgentManagerProps {
  onAgentMessage: (agentId: string, message: string) => void
  onAgentAction: (agentId: string, action: string, data?: any) => void
}

export function AgentManager({ onAgentMessage, onAgentAction }: AgentManagerProps) {
  const [agents, setAgents] = useState<Agent[]>(mockAgents)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const handleAgentStart = useCallback(
    (agentId: string) => {
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId ? { ...agent, status: "active" as const, lastActive: new Date() } : agent,
        ),
      )
      onAgentAction(agentId, "start")
    },
    [onAgentAction],
  )

  const handleAgentStop = useCallback(
    (agentId: string) => {
      setAgents((prev) =>
        prev.map((agent) => (agent.id === agentId ? { ...agent, status: "offline" as const } : agent)),
      )
      onAgentAction(agentId, "stop")
    },
    [onAgentAction],
  )

  const handleAgentPause = useCallback(
    (agentId: string) => {
      setAgents((prev) => prev.map((agent) => (agent.id === agentId ? { ...agent, status: "idle" as const } : agent)))
      onAgentAction(agentId, "pause")
    },
    [onAgentAction],
  )

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "idle":
        return "bg-blue-500"
      case "offline":
        return "bg-gray-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return <Activity className="h-3 w-3" />
      case "busy":
        return <Zap className="h-3 w-3" />
      case "idle":
        return <Clock className="h-3 w-3" />
      case "offline":
        return <Square className="h-3 w-3" />
      case "error":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Bot className="h-3 w-3" />
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <Bot className="h-3 w-3 mr-1" />
          Agents ({agents.filter((a) => a.status === "active").length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Agents System
            <Badge variant="secondary" className="ml-2">
              {agents.length} Agents
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Active Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {agents.filter((a) => a.status === "active").length}
                  </div>
                  <p className="text-xs text-gray-500">Currently running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Total Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {agents.reduce((sum, agent) => sum + agent.stats.totalInteractions, 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {(
                      (agents.reduce((sum, agent) => sum + agent.stats.successfulTasks, 0) /
                        agents.reduce((sum, agent) => sum + agent.stats.totalInteractions, 0)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <p className="text-xs text-gray-500">Task completion</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Agent Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                        <div>
                          <div className="font-medium text-sm">{agent.name}</div>
                          <div className="text-xs text-gray-500">{agent.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {agent.status}
                        </Badge>
                        <div className="flex gap-1">
                          {agent.status === "offline" ? (
                            <Button size="sm" variant="outline" onClick={() => handleAgentStart(agent.id)}>
                              <Play className="h-3 w-3" />
                            </Button>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleAgentPause(agent.id)}>
                                <Pause className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleAgentStop(agent.id)}>
                                <Square className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelect={() => setSelectedAgent(agent)}
                  onStart={() => handleAgentStart(agent.id)}
                  onStop={() => handleAgentStop(agent.id)}
                  onPause={() => handleAgentPause(agent.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Agent Conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recent conversations</p>
                  <p className="text-xs">Agent conversations will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Global Agent Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Response Style</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="technical">Technical</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Memory Per Agent (MB)</label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-Learning</label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Enable agents to learn from interactions</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {selectedAgent && <AgentDetailModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}
      </DialogContent>
    </Dialog>
  )
}

function AgentCard({
  agent,
  onSelect,
  onStart,
  onStop,
  onPause,
}: {
  agent: Agent
  onSelect: () => void
  onStart: () => void
  onStop: () => void
  onPause: () => void
}) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <CardTitle className="text-sm">{agent.name}</CardTitle>
              <CardDescription className="text-xs">{agent.type}</CardDescription>
            </div>
          </div>
          <Badge variant={agent.status === "active" ? "default" : "secondary"} className="text-xs">
            {agent.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{agent.description}</p>

        <div className="flex flex-wrap gap-1">
          {agent.capabilities.slice(0, 2).map((capability, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {capability}
            </Badge>
          ))}
          {agent.capabilities.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{agent.capabilities.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{agent.stats.totalInteractions} interactions</span>
          <span>{agent.stats.uptime}% uptime</span>
        </div>

        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {agent.status === "offline" ? (
            <Button size="sm" variant="outline" onClick={onStart} className="flex-1 bg-transparent">
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={onPause}>
                <Pause className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={onStop}>
                <Square className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AgentDetailModal({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {agent.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="config">Config</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Description</label>
                <p className="text-sm text-gray-600 dark:text-gray-300">{agent.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Capabilities</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.capabilities.map((capability, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {capability}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Permissions</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.permissions.map((permission, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Facts ({agent.memory.facts.length})</label>
                <ScrollArea className="h-24 w-full border rounded-md p-2">
                  {agent.memory.facts.map((fact, index) => (
                    <div key={index} className="text-xs py-1">
                      • {fact}
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <div>
                <label className="text-sm font-medium">Context</label>
                <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                  <pre>{JSON.stringify(agent.memory.context, null, 2)}</pre>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Personality</label>
                <Textarea value={agent.config.personality} readOnly className="text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Response Style</label>
                  <Badge variant="outline">{agent.config.responseStyle}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Max Memory</label>
                  <Badge variant="outline">{agent.config.maxMemorySize} MB</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-lg font-bold">{agent.stats.totalInteractions}</div>
                  <p className="text-xs text-gray-500">Total Interactions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-lg font-bold">{agent.stats.successfulTasks}</div>
                  <p className="text-xs text-gray-500">Successful Tasks</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-lg font-bold">{agent.stats.averageResponseTime}s</div>
                  <p className="text-xs text-gray-500">Avg Response Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-lg font-bold">{agent.stats.uptime}%</div>
                  <p className="text-xs text-gray-500">Uptime</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
