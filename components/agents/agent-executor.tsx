"use client"

import { useState, useCallback } from "react"
import {
  Button,
  Progress,
  ScrollArea
} from '@/libs/design-system';
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'

// TODO: Replace deprecated components: Progress
// 
// TODO: Replace deprecated components: Progress
// import { Progress } from '@/components/ui/progress'

// TODO: Replace deprecated components: ScrollArea
// 
// TODO: Replace deprecated components: ScrollArea
// import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play,
  Pause,
  Square,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Code,
  FileText,
  Database,
} from "lucide-react"

export interface AgentTask {
  id: string
  agentId: string
  name: string
  description: string
  type: "analysis" | "generation" | "computation" | "communication" | "research"
  status: "queued" | "running" | "completed" | "failed" | "paused"
  progress: number
  priority: "low" | "medium" | "high" | "urgent"
  estimatedDuration: number
  actualDuration?: number
  startTime?: Date
  endTime?: Date
  result?: any
  error?: string
  dependencies?: string[]
  metadata?: Record<string, any>
}

interface AgentExecutorProps {
  agentId: string
  agentName: string
  onTaskComplete: (task: AgentTask) => void
  onTaskError: (task: AgentTask, error: string) => void
}

export function AgentExecutor({ agentId, agentName, onTaskComplete, onTaskError }: AgentExecutorProps) {
  const [tasks, setTasks] = useState<AgentTask[]>([
    {
      id: "task-1",
      agentId,
      name: "Analyze User Query",
      description: "Processing natural language input and extracting intent",
      type: "analysis",
      status: "completed",
      progress: 100,
      priority: "high",
      estimatedDuration: 2000,
      actualDuration: 1800,
      startTime: new Date(Date.now() - 5 * 60 * 1000),
      endTime: new Date(Date.now() - 3 * 60 * 1000),
      result: { intent: "code_generation", entities: ["React", "component"] },
    },
    {
      id: "task-2",
      agentId,
      name: "Generate Code Solution",
      description: "Creating React component based on user requirements",
      type: "generation",
      status: "running",
      progress: 65,
      priority: "high",
      estimatedDuration: 5000,
      startTime: new Date(Date.now() - 3 * 60 * 1000),
    },
    {
      id: "task-3",
      agentId,
      name: "Validate Output",
      description: "Checking generated code for syntax and best practices",
      type: "analysis",
      status: "queued",
      progress: 0,
      priority: "medium",
      estimatedDuration: 1500,
      dependencies: ["task-2"],
    },
  ])

  const [isExecuting, setIsExecuting] = useState(true)

  const handleStartTask = useCallback(
    (taskId: string) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: "running" as const,
                startTime: new Date(),
                progress: 0,
              }
            : task,
        ),
      )

      // Simulate task execution
      const interval = setInterval(() => {
        setTasks((prev) => {
          const task = prev.find((t) => t.id === taskId)
          if (!task || task.status !== "running") {
            clearInterval(interval)
            return prev
          }

          const newProgress = Math.min(task.progress + Math.random() * 15, 100)
          const updatedTasks = prev.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  progress: newProgress,
                  ...(newProgress >= 100 && {
                    status: "completed" as const,
                    endTime: new Date(),
                    actualDuration: Date.now() - (t.startTime?.getTime() || Date.now()),
                  }),
                }
              : t,
          )

          if (newProgress >= 100) {
            clearInterval(interval)
            const completedTask = updatedTasks.find((t) => t.id === taskId)
            if (completedTask) {
              onTaskComplete(completedTask)
            }
          }

          return updatedTasks
        })
      }, 500)
    },
    [onTaskComplete],
  )

  const handlePauseTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: "paused" as const } : task)))
  }, [])

  const handleStopTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: "failed" as const,
              endTime: new Date(),
              error: "Task stopped by user",
            }
          : task,
      ),
    )
  }, [])

  const getTaskIcon = (type: AgentTask["type"]) => {
    switch (type) {
      case "analysis":
        return <Zap className="h-4 w-4" />
      case "generation":
        return <Code className="h-4 w-4" />
      case "computation":
        return <Database className="h-4 w-4" />
      case "communication":
        return <FileText className="h-4 w-4" />
      case "research":
        return <FileText className="h-4 w-4" />
      default:
        return <Zap className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: AgentTask["status"]) => {
    switch (status) {
      case "queued":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "paused":
        return <Pause className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: AgentTask["priority"]) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500"
      case "high":
        return "border-l-orange-500"
      case "medium":
        return "border-l-blue-500"
      case "low":
        return "border-l-gray-500"
      default:
        return "border-l-gray-500"
    }
  }

  const runningTasks = tasks.filter((t) => t.status === "running").length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const queuedTasks = tasks.filter((t) => t.status === "queued").length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Task Executor - {agentName}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {runningTasks} Running
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {queuedTasks} Queued
            </Badge>
            <Badge variant="default" className="text-xs">
              {completedTasks} Done
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full">
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)} pl-3 pb-3`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTaskIcon(task.type)}
                    <div>
                      <div className="font-medium text-sm">{task.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{task.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                </div>

                {task.status === "running" && (
                  <div className="mt-2 ml-6">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(task.progress)}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                )}

                {task.status === "completed" && task.result && (
                  <div className="mt-2 ml-6">
                    <div className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded border">
                      <strong>Result:</strong> {JSON.stringify(task.result, null, 2)}
                    </div>
                  </div>
                )}

                {task.status === "failed" && task.error && (
                  <div className="mt-2 ml-6">
                    <div className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded border text-red-700 dark:text-red-300">
                      <strong>Error:</strong> {task.error}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 ml-6">
                  <div className="text-xs text-gray-500">
                    {task.startTime && <span>Started: {task.startTime.toLocaleTimeString()}</span>}
                    {task.endTime && <span className="ml-2">Completed: {task.endTime.toLocaleTimeString()}</span>}
                    {task.actualDuration && (
                      <span className="ml-2">Duration: {(task.actualDuration / 1000).toFixed(1)}s</span>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {task.status === "queued" && (
                      <Button size="sm" variant="outline" onClick={() => handleStartTask(task.id)}>
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                    {task.status === "running" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handlePauseTask(task.id)}>
                          <Pause className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleStopTask(task.id)}>
                          <Square className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {task.status === "paused" && (
                      <Button size="sm" variant="outline" onClick={() => handleStartTask(task.id)}>
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
