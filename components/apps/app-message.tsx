"use client"

import { Card, CardContent } from '@/libs/design-system'
import { Button } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { ExternalLink, Calculator, Calendar, Gamepad2 } from "lucide-react"

interface AppMessage {
  appId: string
  appName: string
  content: string
  timestamp: Date
}

interface AppMessageProps {
  message: AppMessage
  onOpenApp?: (appId: string) => void
}

export function AppMessage({ message, onOpenApp }: AppMessageProps) {
  const getAppIcon = (appId: string) => {
    switch (appId) {
      case "calculator":
        return Calculator
      case "event-planner":
        return Calendar
      case "tic-tac-toe":
        return Gamepad2
      default:
        return ExternalLink
    }
  }

  const Icon = getAppIcon(message.appId)

  return (
    <Card className="max-w-sm bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-1.5 flex-shrink-0">
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {message.appName}
              </Badge>
              <span className="text-xs text-gray-500">
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="text-sm whitespace-pre-line mb-2 leading-relaxed">{message.content}</div>
            <Button size="sm" variant="outline" onClick={() => onOpenApp?.(message.appId)} className="text-xs h-7 px-2">
              <ExternalLink className="h-3 w-3 mr-1" />
              Open App
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
