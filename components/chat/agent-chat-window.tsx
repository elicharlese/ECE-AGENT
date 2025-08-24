'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, Smile, Phone, Video, ArrowLeft, Bot, Sparkles, Zap, Shield, Code, Loader2 } from 'lucide-react'
import { useWebSocket } from '@/hooks/use-websocket'
import { agentService, Agent } from '@/services/agent-service'
import { AgentMCPIntegration } from '@/components/agents/AgentMCPIntegration'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { VideoCallUI } from '@/components/calls/video-call-ui'
import { AgentMenu } from '@/components/chat/AgentMenu'

interface AgentChatWindowProps {
  agentId?: string
  onToggleAgentSidebar?: () => void
  agentSidebarCollapsed?: boolean
}

export function AgentChatWindow({ agentId, onToggleAgentSidebar, agentSidebarCollapsed }: AgentChatWindowProps) {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [showMCPTools, setShowMCPTools] = useState(false)
  const { messages, sendMessage } = useWebSocket()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  useEffect(() => {
    if (agentId) {
      agentService.getAgent(agentId).then(setAgent)
    }
  }, [agentId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const agentInfo = agent || {
    id: agentId || 'ai-assistant',
    name: 'AI Assistant',
    avatar: '🤖',
    status: 'online' as const,
    capabilities: ['Smart Replies', 'Code Generation', 'Data Analysis', 'Task Automation'],
    description: 'AI-powered assistant'
  }

  const handleSend = async () => {
    if (message.trim() && agentId) {
      sendMessage(message, 'user')
      const userMessage = message
      setMessage('')
      
      // Simulate agent typing
      setIsTyping(true)
      
      try {
        const response = await agentService.sendMessage(
          agentId,
          userMessage,
          'agent-' + agentId
        )
        
        // Add agent response to messages
        sendMessage(response.content, 'ai')
      } catch (error) {
        console.error('Failed to get agent response:', error)
      } finally {
        setIsTyping(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleToolExecute = async (toolId: string, params: any) => {
    return agentService.executeMCPTool(toolId, params)
  }

  const showBackButton = agentSidebarCollapsed

  if (!agentId || !agentInfo) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        <Bot className="h-16 w-16 mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Agent Selected</h3>
        <p className="text-sm text-center max-w-md px-4">
          Select an AI agent from the sidebar to start a conversation and get specialized assistance.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div
        className={`flex items-center justify-between ${agentSidebarCollapsed ? "p-3" : "p-4"} border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0`}
      >
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={onToggleAgentSidebar}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className={`p-2 rounded-full ${agentInfo.capabilities[0] === 'Smart Replies' ? 'bg-indigo-500' : 'bg-orange-500'} text-white`}>
            <span className="text-2xl">{agentInfo.avatar}</span>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">{agentInfo.name}</h2>
            <p className="text-sm text-gray-500">
              {agentInfo.description || 'AI-powered assistant'} • 
              <span className={`font-medium ${
                agentInfo.status === 'online' ? 'text-green-600' : 
                agentInfo.status === 'busy' ? 'text-yellow-600' : 'text-gray-400'
              }`}>
                {agentInfo.status}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMCPTools(!showMCPTools)}
              className={`p-2 rounded-lg transition-colors ${
                showMCPTools ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
              title="Toggle MCP Tools"
            >
              <Zap className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setIsVideoOpen(true)}>
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <AgentMenu
              agentId={agentInfo.id}
              showMCPTools={showMCPTools}
              onToggleMCPTools={(v) => setShowMCPTools(!!v)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Agent Capabilities */}
      <div
        className={`${agentSidebarCollapsed ? "p-2" : "p-3"} border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}
      >
        <div className="flex flex-wrap gap-2">
          {agentInfo.capabilities.map((capability) => (
            <Button
              key={capability}
              variant="outline"
              size="sm"
              className={`bg-white dark:bg-gray-700 ${agentSidebarCollapsed ? "text-xs h-6" : "text-xs h-7"}`}
            >
              {capability}
            </Button>
          ))}
        </div>
      </div>

      {/* MCP Tools Panel */}
      {showMCPTools && agentId && (
        <div className="border-b bg-gray-50">
          <AgentMCPIntegration 
            agentId={agentId}
            onToolExecute={handleToolExecute}
          />
        </div>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3">
              {msg.sender === 'ai' ? (
                <div className="p-2 rounded-full bg-blue-500 text-white h-8 w-8 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
              ) : (
                <div className="p-2 rounded-full bg-gray-500 text-white h-8 w-8 flex items-center justify-center">
                  {msg.senderName?.[0] || 'U'}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {msg.sender === 'ai' ? agentInfo.name : msg.senderName || 'You'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`inline-block px-4 py-2 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}

          {/* Agent typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <div className="p-2 rounded-full bg-blue-500 text-white h-8 w-8 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-sm">{agentInfo.name} is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Ask ${agentInfo.name} anything...`}
              className="resize-none border-0 bg-gray-50 dark:bg-gray-700 rounded-2xl px-4 py-3 min-h-[44px] max-h-[120px] leading-5 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-600"
              rows={1}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isTyping}
            className="rounded-full min-w-[44px] h-[44px] p-0 bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Video Call Popout */}
      <VideoCallUI
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        contact={{ id: agentInfo.id, name: agentInfo.name, avatar: undefined }}
        callType="outgoing"
      />
    </div>
  )
}
