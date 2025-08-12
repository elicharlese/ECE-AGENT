"use client"

import { useEffect, useCallback } from "react"

export interface MessageProcessorProps {
  messages: Array<{
    id: string
    content: string
    senderId: string
    timestamp: Date
  }>
  agents: Array<{
    id: string
    name: string
    status: string
    triggers: Array<{
      type: string
      condition: string
      action: string
      enabled: boolean
    }>
  }>
  onTriggerAction: (agentId: string, action: string, context: any) => void
}

export function AgentMessageProcessor({ messages, agents, onTriggerAction }: MessageProcessorProps) {
  const processMessage = useCallback(
    (message: { id: string; content: string; senderId: string; timestamp: Date }) => {
      const activeAgents = agents.filter((agent) => agent.status === "active")

      activeAgents.forEach((agent) => {
        agent.triggers
          .filter((trigger) => trigger.enabled)
          .forEach((trigger) => {
            let shouldTrigger = false

            switch (trigger.type) {
              case "keyword":
                const keywords = trigger.condition.split("|")
                shouldTrigger = keywords.some((keyword) =>
                  message.content.toLowerCase().includes(keyword.toLowerCase()),
                )
                break
              case "mention":
                shouldTrigger = message.content.includes(trigger.condition)
                break
              case "user-action":
                // Handle specific user actions
                shouldTrigger = message.content.startsWith("/") && message.content.includes(trigger.condition)
                break
            }

            if (shouldTrigger) {
              onTriggerAction(agent.id, trigger.action, {
                message,
                trigger,
                timestamp: new Date(),
              })
            }
          })
      })
    },
    [agents, onTriggerAction],
  )

  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      // Only process messages from users, not from agents
      if (!latestMessage.senderId.startsWith("agent-")) {
        processMessage(latestMessage)
      }
    }
  }, [messages, processMessage])

  return null // This is a processing component, no UI
}
