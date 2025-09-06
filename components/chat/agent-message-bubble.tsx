"use client"

import { useState } from "react"
import { Bot, Brain, Eye, EyeOff, Clock, Zap, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { Card, CardContent } from '@/libs/design-system'

interface AgentResponse {
  content: string
  agentMode: string
  confidence: number
  reasoningTrace: Array<{
    step: number
    reasoning: string
    action?: string
    result?: any
    timestamp: string
  }>
  examplesRetrieved: number
  toolsUsed: string[]
  suggestions: string[]
  interactionId: string
  metadata: {
    processingTime: number
    timestamp: string
    agentVersion: string
    modelUsed: string
  }
}

interface AgentMessageBubbleProps {
  message: {
    id: string
    content: string
    timestamp: Date
    senderId: string
    senderName: string
    type: "text" | "image" | "video" | "audio" | "document" | "system" | "gif" | "app"
    isOwn: boolean
  }
  agentResponse?: AgentResponse
  onUpdateMessage?: (id: string, content: string) => void
}

export function AgentMessageBubble({ message, agentResponse, onUpdateMessage }: AgentMessageBubbleProps) {
  const [showReasoning, setShowReasoning] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const getAgentModeColor = (mode: string) => {
    switch (mode) {
      case 'smart_assistant':
        return 'bg-indigo-500'
      case 'code_companion':
        return 'bg-orange-500'
      case 'creative_writer':
        return 'bg-pink-500'
      case 'legal_assistant':
        return 'bg-blue-600'
      case 'designer_agent':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getAgentModeName = (mode: string) => {
    switch (mode) {
      case 'smart_assistant':
        return 'Smart Assistant'
      case 'code_companion':
        return 'Code Companion'
      case 'creative_writer':
        return 'Creative Writer'
      case 'legal_assistant':
        return 'Legal Assistant'
      case 'designer_agent':
        return 'Designer Agent'
      default:
        return 'AGENT'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-3 w-3" />
    if (confidence >= 0.6) return <Clock className="h-3 w-3" />
    return <AlertCircle className="h-3 w-3" />
  }

  return (
    <div className={`flex ${message.isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${message.isOwn ? "order-2" : "order-1"}`}>
        {/* Message Header */}
        <div className={`flex items-center gap-2 mb-1 ${message.isOwn ? "justify-end" : "justify-start"}`}>
          {!message.isOwn && (
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded-full ${getAgentModeColor(agentResponse?.agentMode || 'smart_assistant')} text-white`}>
                <Bot className="h-3 w-3" />
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {agentResponse ? getAgentModeName(agentResponse.agentMode) : message.senderName}
              </span>
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>

        {/* Message Content */}
        <div
          className={`
            rounded-2xl px-4 py-3 text-sm leading-relaxed
            ${message.isOwn 
              ? "bg-blue-500 text-white" 
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            }
          `}
        >
          {message.content}
        </div>

        {/* AGENT Response Details */}
        {agentResponse && (
          <div className="mt-2 space-y-2">
            {/* Confidence and Performance */}
            <div className="flex items-center gap-2 text-xs">
              <div className={`flex items-center gap-1 ${getConfidenceColor(agentResponse.confidence)}`}>
                {getConfidenceIcon(agentResponse.confidence)}
                <span>{Math.round(agentResponse.confidence * 100)}% confidence</span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400">
                {agentResponse.metadata.processingTime}ms
              </span>
              <span className="text-gray-500 dark:text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400">
                {agentResponse.examplesRetrieved} examples
              </span>
            </div>

            {/* Tools Used */}
            {agentResponse.toolsUsed.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {agentResponse.toolsUsed.map((tool, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    <Zap className="h-2 w-2 mr-1" />
                    {tool}
                  </Badge>
                ))}
              </div>
            )}

            {/* Reasoning Toggle */}
            {agentResponse.reasoningTrace.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowReasoning(!showReasoning)}
                className="h-6 px-2 text-xs"
              >
                <Brain className="h-3 w-3 mr-1" />
                {showReasoning ? 'Hide' : 'Show'} Reasoning
                {showReasoning ? <EyeOff className="h-3 w-3 ml-1" /> : <Eye className="h-3 w-3 ml-1" />}
              </Button>
            )}

            {/* Reasoning Trace */}
            {showReasoning && agentResponse.reasoningTrace.length > 0 && (
              <Card className="mt-2">
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      Reasoning Process:
                    </div>
                    {agentResponse.reasoningTrace.map((step, idx) => (
                      <div key={idx} className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded border-l-2 border-indigo-500">
                        <div className="font-medium text-indigo-600 dark:text-indigo-400">
                          Step {step.step}:
                        </div>
                        <div className="mt-1">{step.reasoning}</div>
                        {step.action && (
                          <div className="mt-1 text-blue-600 dark:text-blue-400">
                            <strong>Action:</strong> {step.action}
                          </div>
                        )}
                        {step.result && (
                          <div className="mt-1 text-green-600 dark:text-green-400">
                            <strong>Result:</strong> {JSON.stringify(step.result)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {agentResponse.suggestions.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Suggestions:
                </div>
                <div className="flex flex-wrap gap-1">
                  {agentResponse.suggestions.map((suggestion, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Model Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Model: {agentResponse.metadata.modelUsed} • Version: {agentResponse.metadata.agentVersion}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}