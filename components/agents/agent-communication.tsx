"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Button,
  ScrollArea,
  Textarea
} from '@/libs/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'

// TODO: Replace deprecated components: ScrollArea
// 
// TODO: Replace deprecated components: ScrollArea
// import { ScrollArea } from '@/components/ui/scroll-area'

// TODO: Replace deprecated components: Textarea
// 
// TODO: Replace deprecated components: Textarea
// import { Textarea } from '@/components/ui/textarea'
import { Bot, Send, MessageSquare, Users, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react"

export interface AgentMessage {
  id: string
  fromAgentId: string
  toAgentId?: string
  content: string
  type: "request" | "response" | "broadcast" | "system"
  priority: "low" | "medium" | "high" | "urgent"
  timestamp: Date
  status: "pending" | "delivered" | "processed" | "failed"
  metadata?: Record<string, any>
}

export interface AgentCommunicationProps {
  agents: Array<{ id: string; name: string; status: string }>
  onSendMessage: (message: Omit<AgentMessage, "id" | "timestamp" | "status">) => void
}

export function AgentCommunication({ agents, onSendMessage }: AgentCommunicationProps) {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string>("")
  const [messageContent, setMessageContent] = useState("")
  const [messageType, setMessageType] = useState<AgentMessage["type"]>("request")
  const [priority, setPriority] = useState<AgentMessage["priority"]>("medium")

  // Mock messages for demonstration
  useEffect(() => {
    const mockMessages: AgentMessage[] = [
      {
        id: "1",
        fromAgentId: "assistant-1",
        toAgentId: "code-1",
        content: "Can you help me generate a React component for the user's request?",
        type: "request",
        priority: "medium",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: "processed",
      },
      {
        id: "2",
        fromAgentId: "code-1",
        toAgentId: "assistant-1",
        content: "I've generated the component. Here's the code structure...",
        type: "response",
        priority: "medium",
        timestamp: new Date(Date.now() - 4 * 60 * 1000),
        status: "delivered",
      },
      {
        id: "3",
        fromAgentId: "research-1",
        content: "Market analysis complete. Found 15 relevant data points for the AI trends report.",
        type: "broadcast",
        priority: "high",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        status: "delivered",
      },
      {
        id: "4",
        fromAgentId: "system",
        content: "Agent collaboration session started. 3 agents are now connected.",
        type: "system",
        priority: "low",
        timestamp: new Date(Date.now() - 1 * 60 * 1000),
        status: "delivered",
      },
    ]
    setMessages(mockMessages)
  }, [])

  const handleSendMessage = useCallback(() => {
    if (!messageContent.trim()) return

    const newMessage: Omit<AgentMessage, "id" | "timestamp" | "status"> = {
      fromAgentId: "user",
      toAgentId: selectedAgent || undefined,
      content: messageContent,
      type: messageType,
      priority,
    }

    onSendMessage(newMessage)

    // Add to local state for immediate feedback
    const fullMessage: AgentMessage = {
      ...newMessage,
      id: Date.now().toString(),
      timestamp: new Date(),
      status: "pending",
    }

    setMessages((prev) => [...prev, fullMessage])
    setMessageContent("")
  }, [messageContent, selectedAgent, messageType, priority, onSendMessage])

  const getStatusIcon = (status: AgentMessage["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-500" />
      case "delivered":
        return <CheckCircle className="h-3 w-3 text-blue-500" />
      case "processed":
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case "failed":
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <Clock className="h-3 w-3 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: AgentMessage["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-blue-500"
      case "low":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAgentName = (agentId: string) => {
    if (agentId === "user") return "You"
    if (agentId === "system") return "System"
    const agent = agents.find((a) => a.id === agentId)
    return agent?.name || agentId
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Agent Communication Hub
            <Badge variant="secondary" className="ml-2">
              {messages.length} Messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Message History */}
          <div>
            <label className="text-sm font-medium mb-2 block">Message History</label>
            <ScrollArea className="h-64 w-full border rounded-md p-3">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="border-l-2 border-gray-200 pl-3 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="font-medium text-sm">{getAgentName(message.fromAgentId)}</span>
                        {message.toAgentId && (
                          <>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{getAgentName(message.toAgentId)}</span>
                          </>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {message.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(message.priority)}`} />
                        {getStatusIcon(message.status)}
                        <span className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 ml-6">{message.content}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Send Message */}
          <div className="space-y-3 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Target Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">Broadcast to All</option>
                  {agents
                    .filter((agent) => agent.status !== "offline")
                    .map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Message Type</label>
                <select
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as AgentMessage["type"])}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="request">Request</option>
                  <option value="response">Response</option>
                  <option value="broadcast">Broadcast</option>
                  <option value="system">System</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as AgentMessage["priority"])}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Message Content</label>
              <div className="flex gap-2 mt-1">
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Enter your message to agents..."
                  className="flex-1 text-sm"
                  rows={2}
                />
                <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Agents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {agents
              .filter((agent) => agent.status === "active")
              .map((agent) => (
                <Badge key={agent.id} variant="outline" className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {agent.name}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
