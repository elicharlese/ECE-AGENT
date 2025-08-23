"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bot,
  MessageSquare,
  Zap,
  Play,
  Settings,
  Link,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Code,
  Calculator,
} from "lucide-react"

export interface AgentIntegration {
  id: string
  agentId: string
  agentName: string
  chatId: string
  status: "active" | "inactive" | "processing" | "error"
  capabilities: AgentCapability[]
  triggers: AgentTrigger[]
  workflows: AgentWorkflow[]
  context: AgentContext
  settings: AgentSettings
}

export interface AgentCapability {
  id: string
  name: string
  description: string
  type: "app-launch" | "message-analysis" | "content-generation" | "computation" | "automation"
  appIds?: string[]
  parameters?: Record<string, any>
}

export interface AgentTrigger {
  id: string
  name: string
  type: "keyword" | "mention" | "app-event" | "schedule" | "user-action"
  condition: string
  action: string
  enabled: boolean
}

export interface AgentWorkflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  status: "idle" | "running" | "completed" | "failed"
  lastRun?: Date
}

export interface WorkflowStep {
  id: string
  type: "message" | "app-launch" | "computation" | "wait" | "condition"
  action: string
  parameters?: Record<string, any>
  status: "pending" | "running" | "completed" | "failed"
}

export interface AgentContext {
  currentChat: string
  recentMessages: Array<{
    id: string
    content: string
    sender: string
    timestamp: Date
  }>
  activeApps: string[]
  userPreferences: Record<string, any>
  sessionData: Record<string, any>
}

export interface AgentSettings {
  autoRespond: boolean
  proactiveMode: boolean
  learningEnabled: boolean
  privacyMode: "full" | "limited" | "minimal"
  responseDelay: number
  maxActionsPerHour: number
}

const mockIntegrations: AgentIntegration[] = [
  {
    id: "integration-1",
    agentId: "assistant-1",
    agentName: "Alex Assistant",
    chatId: "chat-1",
    status: "active",
    capabilities: [
      {
        id: "cap-1",
        name: "Smart App Launcher",
        description: "Automatically launch relevant apps based on conversation context",
        type: "app-launch",
        appIds: ["calculator", "event-planner", "tic-tac-toe"],
      },
      {
        id: "cap-2",
        name: "Message Analysis",
        description: "Analyze messages for intent and sentiment",
        type: "message-analysis",
      },
      {
        id: "cap-3",
        name: "Content Generation",
        description: "Generate helpful responses and suggestions",
        type: "content-generation",
      },
    ],
    triggers: [
      {
        id: "trigger-1",
        name: "Calculator Trigger",
        type: "keyword",
        condition: "calculate|math|compute",
        action: "launch-calculator",
        enabled: true,
      },
      {
        id: "trigger-2",
        name: "Event Planning",
        type: "keyword",
        condition: "meeting|event|schedule",
        action: "launch-event-planner",
        enabled: true,
      },
      {
        id: "trigger-3",
        name: "Agent Mention",
        type: "mention",
        condition: "@alex",
        action: "respond-directly",
        enabled: true,
      },
    ],
    workflows: [
      {
        id: "workflow-1",
        name: "Smart Meeting Setup",
        description: "Automatically create events when meeting requests are detected",
        steps: [
          {
            id: "step-1",
            type: "message",
            action: "analyze-meeting-request",
            status: "completed",
          },
          {
            id: "step-2",
            type: "app-launch",
            action: "open-event-planner",
            parameters: { prefill: true },
            status: "completed",
          },
          {
            id: "step-3",
            type: "message",
            action: "suggest-meeting-details",
            status: "running",
          },
        ],
        status: "running",
        lastRun: new Date(Date.now() - 5 * 60 * 1000),
      },
    ],
    context: {
      currentChat: "chat-1",
      recentMessages: [
        {
          id: "msg-1",
          content: "Can we schedule a team meeting for next week?",
          sender: "user-1",
          timestamp: new Date(),
        },
      ],
      activeApps: ["event-planner"],
      userPreferences: { timezone: "UTC-8", language: "en" },
      sessionData: { meetingContext: true },
    },
    settings: {
      autoRespond: true,
      proactiveMode: true,
      learningEnabled: true,
      privacyMode: "limited",
      responseDelay: 1000,
      maxActionsPerHour: 50,
    },
  },
  {
    id: "integration-2",
    agentId: "code-1",
    agentName: "CodeMaster",
    chatId: "chat-1",
    status: "inactive",
    capabilities: [
      {
        id: "cap-4",
        name: "Code Analysis",
        description: "Analyze and review code snippets in messages",
        type: "message-analysis",
      },
      {
        id: "cap-5",
        name: "Development Tools",
        description: "Launch development-related apps and tools",
        type: "app-launch",
        appIds: ["calculator", "text-editor"],
      },
    ],
    triggers: [
      {
        id: "trigger-4",
        name: "Code Keywords",
        type: "keyword",
        condition: "code|bug|debug|function",
        action: "analyze-code",
        enabled: false,
      },
    ],
    workflows: [],
    context: {
      currentChat: "chat-1",
      recentMessages: [],
      activeApps: [],
      userPreferences: {},
      sessionData: {},
    },
    settings: {
      autoRespond: false,
      proactiveMode: false,
      learningEnabled: true,
      privacyMode: "full",
      responseDelay: 2000,
      maxActionsPerHour: 20,
    },
  },
  {
    id: "integration-3",
    agentId: "legal-1",
    agentName: "LegalAdvisor",
    chatId: "chat-1",
    status: "inactive",
    capabilities: [
      {
        id: "cap-6",
        name: "Legal Document Analysis",
        description: "Analyze legal documents and contracts for key terms and risks",
        type: "message-analysis",
      },
      {
        id: "cap-7",
        name: "Legal Research",
        description: "Perform comprehensive legal research and case law analysis",
        type: "content-generation",
      },
      {
        id: "cap-8",
        name: "Compliance Check",
        description: "Check documents and processes for regulatory compliance",
        type: "automation",
      },
    ],
    triggers: [
      {
        id: "trigger-5",
        name: "Legal Keywords",
        type: "keyword",
        condition: "contract|legal|law|compliance|regulation|clause",
        action: "analyze-legal-content",
        enabled: true,
      },
      {
        id: "trigger-6",
        name: "Document Upload",
        type: "user-action",
        condition: "document-upload",
        action: "review-legal-document",
        enabled: true,
      },
    ],
    workflows: [
      {
        id: "workflow-2",
        name: "Contract Review Process",
        description: "Automated contract analysis and risk assessment",
        steps: [
          {
            id: "step-1",
            type: "message",
            action: "extract-contract-terms",
            status: "pending",
          },
          {
            id: "step-2",
            type: "computation",
            action: "analyze-legal-risks",
            status: "pending",
          },
          {
            id: "step-3",
            type: "message",
            action: "generate-review-summary",
            status: "pending",
          },
        ],
        status: "idle",
      },
    ],
    context: {
      currentChat: "chat-1",
      recentMessages: [],
      activeApps: [],
      userPreferences: { jurisdiction: "US Federal", practiceArea: "Corporate" },
      sessionData: {},
    },
    settings: {
      autoRespond: true,
      proactiveMode: false,
      learningEnabled: true,
      privacyMode: "full",
      responseDelay: 3000,
      maxActionsPerHour: 15,
    },
  },
  {
    id: "integration-4",
    agentId: "creator-1",
    agentName: "CreativeStudio",
    chatId: "chat-1",
    status: "active",
    capabilities: [
      {
        id: "cap-9",
        name: "Design Generation",
        description: "Generate creative designs and visual concepts",
        type: "content-generation",
      },
      {
        id: "cap-10",
        name: "Brand Analysis",
        description: "Analyze brand elements and provide design recommendations",
        type: "message-analysis",
      },
      {
        id: "cap-11",
        name: "Creative Tools",
        description: "Launch design and creative applications",
        type: "app-launch",
        appIds: ["image-editor", "color-picker", "font-selector"],
      },
    ],
    triggers: [
      {
        id: "trigger-7",
        name: "Design Keywords",
        type: "keyword",
        condition: "design|create|brand|logo|color|layout|visual",
        action: "provide-creative-assistance",
        enabled: true,
      },
      {
        id: "trigger-8",
        name: "Image Upload",
        type: "user-action",
        condition: "image-upload",
        action: "analyze-design-elements",
        enabled: true,
      },
    ],
    workflows: [
      {
        id: "workflow-3",
        name: "Brand Identity Creation",
        description: "Complete brand identity development process",
        steps: [
          {
            id: "step-1",
            type: "message",
            action: "gather-brand-requirements",
            status: "completed",
          },
          {
            id: "step-2",
            type: "app-launch",
            action: "open-design-tools",
            parameters: { template: "brand-kit" },
            status: "running",
          },
          {
            id: "step-3",
            type: "message",
            action: "present-design-concepts",
            status: "pending",
          },
        ],
        status: "running",
        lastRun: new Date(Date.now() - 10 * 60 * 1000),
      },
    ],
    context: {
      currentChat: "chat-1",
      recentMessages: [
        {
          id: "msg-2",
          content: "I need help creating a modern logo for my tech startup",
          sender: "user-1",
          timestamp: new Date(),
        },
      ],
      activeApps: ["design-studio"],
      userPreferences: { designStyle: "modern", industry: "technology" },
      sessionData: { projectType: "logo-design", brandPersonality: "innovative" },
    },
    settings: {
      autoRespond: true,
      proactiveMode: true,
      learningEnabled: true,
      privacyMode: "limited",
      responseDelay: 1500,
      maxActionsPerHour: 40,
    },
  },
]

interface AgentIntegrationProps {
  chatId: string
  onAgentMessage: (agentId: string, message: string) => void
  onAppLaunch: (appId: string, agentId: string, context?: any) => void
  onWorkflowTrigger: (workflowId: string, agentId: string) => void
}

export function AgentIntegration({ chatId, onAgentMessage, onAppLaunch, onWorkflowTrigger }: AgentIntegrationProps) {
  const [integrations, setIntegrations] = useState<AgentIntegration[]>(
    mockIntegrations.filter((i) => i.chatId === chatId),
  )
  const [selectedIntegration, setSelectedIntegration] = useState<AgentIntegration | null>(null)
  const [isConfiguring, setIsConfiguring] = useState(false)

  const handleToggleAgent = useCallback((integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              status: integration.status === "active" ? "inactive" : "active",
            }
          : integration,
      ),
    )
  }, [])

  const handleTriggerWorkflow = useCallback(
    (workflowId: string, agentId: string) => {
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.agentId === agentId
            ? {
                ...integration,
                workflows: integration.workflows.map((workflow) =>
                  workflow.id === workflowId
                    ? { ...workflow, status: "running" as const, lastRun: new Date() }
                    : workflow,
                ),
              }
            : integration,
        ),
      )
      onWorkflowTrigger(workflowId, agentId)
    },
    [onWorkflowTrigger],
  )

  const handleToggleTrigger = useCallback((integrationId: string, triggerId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId
          ? {
              ...integration,
              triggers: integration.triggers.map((trigger) =>
                trigger.id === triggerId ? { ...trigger, enabled: !trigger.enabled } : trigger,
              ),
            }
          : integration,
      ),
    )
  }, [])

  // Simulate agent processing
  useEffect(() => {
    const interval = setInterval(() => {
      setIntegrations((prev) =>
        prev.map((integration) => {
          if (integration.status === "processing") {
            // Simulate completion
            return { ...integration, status: "active" }
          }
          return integration
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: AgentIntegration["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "inactive":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "processing":
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getCapabilityIcon = (type: AgentCapability["type"]) => {
    switch (type) {
      case "app-launch":
        return <Play className="h-4 w-4" />
      case "message-analysis":
        return <MessageSquare className="h-4 w-4" />
      case "content-generation":
        return <Bot className="h-4 w-4" />
      case "computation":
        return <Calculator className="h-4 w-4" />
      case "automation":
        return <Zap className="h-4 w-4" />
      default:
        return <Bot className="h-4 w-4" />
    }
  }

  const activeAgents = integrations.filter((i) => i.status === "active").length
  const totalCapabilities = integrations.reduce((sum, i) => sum + i.capabilities.length, 0)
  const activeTriggers = integrations.reduce((sum, i) => sum + i.triggers.filter((t) => t.enabled).length, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Link className="h-5 w-5" />
            AGENT - Agent Integration
          </h3>
          <div className="flex gap-2">
            <Badge variant="outline">{activeAgents} Active</Badge>
            <Badge variant="secondary">{totalCapabilities} Capabilities</Badge>
            <Badge variant="default">{activeTriggers} Triggers</Badge>
          </div>
        </div>
        <Button onClick={() => setIsConfiguring(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => (
          <AgentIntegrationCard
            key={integration.id}
            integration={integration}
            onToggle={() => handleToggleAgent(integration.id)}
            onSelect={() => setSelectedIntegration(integration)}
            onTriggerWorkflow={(workflowId) => handleTriggerWorkflow(workflowId, integration.agentId)}
          />
        ))}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Agent Integration Configuration</DialogTitle>
          </DialogHeader>
          <AgentConfigurationPanel
            integrations={integrations}
            onUpdateIntegration={(id, updates) => {
              setIntegrations((prev) =>
                prev.map((integration) => (integration.id === id ? { ...integration, ...updates } : integration)),
              )
            }}
            onToggleTrigger={handleToggleTrigger}
          />
        </DialogContent>
      </Dialog>

      {/* Integration Detail Modal */}
      {selectedIntegration && (
        <AgentIntegrationDetailModal
          integration={selectedIntegration}
          onClose={() => setSelectedIntegration(null)}
          onTriggerWorkflow={(workflowId) => handleTriggerWorkflow(workflowId, selectedIntegration.agentId)}
        />
      )}
    </div>
  )
}

function AgentIntegrationCard({
  integration,
  onToggle,
  onSelect,
  onTriggerWorkflow,
}: {
  integration: AgentIntegration
  onToggle: () => void
  onSelect: () => void
  onTriggerWorkflow: (workflowId: string) => void
}) {
  const getStatusIcon = (status: AgentIntegration["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "inactive":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "processing":
        return <Zap className="h-4 w-4 text-blue-500 animate-pulse" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const runningWorkflows = integration.workflows.filter((w) => w.status === "running").length
  const enabledTriggers = integration.triggers.filter((t) => t.enabled).length

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <div>
              <CardTitle className="text-sm">{integration.agentName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {integration.capabilities.length} capabilities
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {enabledTriggers} triggers
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(integration.status)}
            <Badge variant={integration.status === "active" ? "default" : "secondary"} className="text-xs">
              {integration.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {integration.capabilities.slice(0, 3).map((capability) => (
            <Badge key={capability.id} variant="outline" className="text-xs">
              {capability.name}
            </Badge>
          ))}
          {integration.capabilities.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{integration.capabilities.length - 3} more
            </Badge>
          )}
        </div>

        {runningWorkflows > 0 && (
          <div className="text-xs text-blue-600 dark:text-blue-400">
            {runningWorkflows} workflow{runningWorkflows > 1 ? "s" : ""} running
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Auto-respond: {integration.settings.autoRespond ? "On" : "Off"}</span>
          <span>Privacy: {integration.settings.privacyMode}</span>
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={onToggle} className="flex-1 bg-transparent">
            {integration.status === "active" ? "Deactivate" : "Activate"}
          </Button>
          <Button size="sm" variant="outline" onClick={onSelect}>
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AgentConfigurationPanel({
  integrations,
  onUpdateIntegration,
  onToggleTrigger,
}: {
  integrations: AgentIntegration[]
  onUpdateIntegration: (id: string, updates: Partial<AgentIntegration>) => void
  onToggleTrigger: (integrationId: string, triggerId: string) => void
}) {
  const [selectedIntegration, setSelectedIntegration] = useState<AgentIntegration | null>(integrations[0] || null)

  if (!selectedIntegration) return null

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {integrations.map((integration) => (
          <Button
            key={integration.id}
            size="sm"
            variant={selectedIntegration.id === integration.id ? "default" : "outline"}
            onClick={() => setSelectedIntegration(integration)}
          >
            {integration.agentName}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Auto-respond</span>
              <input
                type="checkbox"
                checked={selectedIntegration.settings.autoRespond}
                onChange={(e) =>
                  onUpdateIntegration(selectedIntegration.id, {
                    settings: { ...selectedIntegration.settings, autoRespond: e.target.checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Proactive mode</span>
              <input
                type="checkbox"
                checked={selectedIntegration.settings.proactiveMode}
                onChange={(e) =>
                  onUpdateIntegration(selectedIntegration.id, {
                    settings: { ...selectedIntegration.settings, proactiveMode: e.target.checked },
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Learning enabled</span>
              <input
                type="checkbox"
                checked={selectedIntegration.settings.learningEnabled}
                onChange={(e) =>
                  onUpdateIntegration(selectedIntegration.id, {
                    settings: { ...selectedIntegration.settings, learningEnabled: e.target.checked },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Privacy Mode</label>
              <select
                value={selectedIntegration.settings.privacyMode}
                onChange={(e) =>
                  onUpdateIntegration(selectedIntegration.id, {
                    settings: {
                      ...selectedIntegration.settings,
                      privacyMode: e.target.value as AgentSettings["privacyMode"],
                    },
                  })
                }
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="full">Full Privacy</option>
                <option value="limited">Limited Privacy</option>
                <option value="minimal">Minimal Privacy</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Triggers</h4>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {selectedIntegration.triggers.map((trigger) => (
                <div key={trigger.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="text-sm font-medium">{trigger.name}</div>
                    <div className="text-xs text-gray-500">{trigger.condition}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={trigger.enabled}
                    onChange={() => onToggleTrigger(selectedIntegration.id, trigger.id)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}

function AgentIntegrationDetailModal({
  integration,
  onClose,
  onTriggerWorkflow,
}: {
  integration: AgentIntegration
  onClose: () => void
  onTriggerWorkflow: (workflowId: string) => void
}) {
  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {integration.agentName} Integration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Badge variant="default">{integration.status}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Chat</label>
              <Badge variant="outline">{integration.chatId}</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Capabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {integration.capabilities.map((capability) => (
                <div key={capability.id} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Code className="h-4 w-4" />
                    <span className="font-medium text-sm">{capability.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300">{capability.description}</p>
                  <Badge variant="outline" className="text-xs mt-1">
                    {capability.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Active Workflows</h4>
            <div className="space-y-2">
              {integration.workflows.map((workflow) => (
                <div key={workflow.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{workflow.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={workflow.status === "running" ? "default" : "secondary"} className="text-xs">
                        {workflow.status}
                      </Badge>
                      {workflow.status === "idle" && (
                        <Button size="sm" variant="outline" onClick={() => onTriggerWorkflow(workflow.id)}>
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{workflow.description}</p>
                  <div className="flex items-center gap-2">
                    {workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            step.status === "completed"
                              ? "bg-green-500"
                              : step.status === "running"
                                ? "bg-blue-500"
                                : step.status === "failed"
                                  ? "bg-red-500"
                                  : "bg-gray-300"
                          }`}
                        />
                        {index < workflow.steps.length - 1 && <ArrowRight className="h-3 w-3 text-gray-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
