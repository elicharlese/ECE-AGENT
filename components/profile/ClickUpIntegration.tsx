"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Switch
} from '@/libs/design-system';
import { Badge } from '@/libs/design-system'
import { Button } from '@/libs/design-system'
import { Input } from '@/libs/design-system'

// TODO: Replace deprecated components: Switch
// 
// TODO: Replace deprecated components: Switch
// import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'

// TODO: Replace deprecated components: Progress
// 
// TODO: Replace deprecated components: Progress
// import { Progress } from '@/components/ui/progress'
import { 
  CheckSquare, 
  Clock, 
  Users, 
  Flag, 
  Plus,
  Settings,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Calendar,
  Target
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useUser } from "@/contexts/user-context"

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: Date
  assignee?: {
    name: string
    avatar?: string
    email: string
  }
  project: {
    id: string
    name: string
    color: string
  }
  tags: string[]
  progress?: number
}

interface Project {
  id: string
  name: string
  color: string
  taskCount: number
  completedTasks: number
  dueDate?: Date
}

interface ClickUpIntegration {
  isConnected: boolean
  workspace?: string
  lastSync?: Date
  syncEnabled: boolean
  apiKey?: string
}

export function ClickUpIntegration() {
  const { user } = useUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [integration, setIntegration] = useState<ClickUpIntegration>({
    isConnected: false,
    syncEnabled: false
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'assigned' | 'due_soon'>('all')
  const userEmail = user?.email ?? ''

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock connected integration
        setIntegration({
          isConnected: true,
          workspace: 'Company Workspace',
          lastSync: new Date(Date.now() - 1000 * 60 * 10),
          syncEnabled: true
        })

        // Mock projects
        const mockProjects: Project[] = [
          {
            id: "proj-1",
            name: "Website Redesign",
            color: "#3b82f6",
            taskCount: 12,
            completedTasks: 8,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
          },
          {
            id: "proj-2",
            name: "Mobile App",
            color: "#10b981",
            taskCount: 8,
            completedTasks: 3,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)
          },
          {
            id: "proj-3",
            name: "API Documentation",
            color: "#f59e0b",
            taskCount: 5,
            completedTasks: 5
          }
        ]

        // Mock tasks
        const mockTasks: Task[] = [
          {
            id: "1",
            title: "Review user authentication flow",
            description: "Ensure the new auth system meets security requirements",
            status: "in_progress",
            priority: "high",
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
            assignee: {
              name: "",
              email: ""
            },
            project: mockProjects[0],
            tags: ["security", "auth"],
            progress: 60
          },
          {
            id: "2",
            title: "Update API documentation",
            description: "Document the new endpoints for the mobile app",
            status: "todo",
            priority: "medium",
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
            assignee: {
              name: "",
              email: ""
            },
            project: mockProjects[2],
            tags: ["documentation", "api"]
          },
          {
            id: "3",
            title: "Design mobile onboarding",
            status: "review",
            priority: "medium",
            assignee: {
              name: "",
              email: ""
            },
            project: mockProjects[1],
            tags: ["design", "mobile"],
            progress: 90
          },
          {
            id: "4",
            title: "Fix login bug on iOS",
            status: "todo",
            priority: "urgent",
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 8),
            assignee: {
              name: "",
              email: ""
            },
            project: mockProjects[1],
            tags: ["bug", "ios"]
          }
        ]
        
        setProjects(mockProjects)
        setTasks(mockTasks)
      } catch (error) {
        console.error('Failed to fetch task data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTaskData()
  }, [])

  const handleConnect = async () => {
    try {
      setSyncing(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIntegration({
        isConnected: true,
        workspace: 'Company Workspace',
        lastSync: new Date(),
        syncEnabled: true
      })
    } catch (error) {
      console.error('Failed to connect ClickUp:', error)
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = () => {
    setIntegration({
      isConnected: false,
      syncEnabled: false
    })
  }

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIntegration(prev => ({ ...prev, lastSync: new Date() }))
    } catch (error) {
      console.error('Failed to sync ClickUp:', error)
    } finally {
      setSyncing(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'assigned') {
      return task.assignee?.email === userEmail
    }
    if (filter === 'due_soon') {
      return task.dueDate && task.dueDate.getTime() - Date.now() < 1000 * 60 * 60 * 24 * 3
    }
    return true
  })

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo': return 'text-gray-500'
      case 'in_progress': return 'text-blue-500'
      case 'review': return 'text-purple-500'
      case 'done': return 'text-green-500'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>ClickUp Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              ClickUp Integration
            </CardTitle>
            {integration.isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSync}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync Now
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {integration.isConnected ? (
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                  ✓
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    Connected to ClickUp
                  </h4>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    <p>Workspace: {integration.workspace}</p>
                    {integration.lastSync && (
                      <p>Last sync: {formatDistanceToNow(integration.lastSync, { addSuffix: true })}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-300">Auto-sync</span>
                  <Switch
                    checked={integration.syncEnabled}
                    onCheckedChange={(checked) => 
                      setIntegration(prev => ({ ...prev, syncEnabled: checked }))
                    }
                  />
                </div>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Connect ClickUp
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Sync your tasks and projects to stay organized
              </p>
              <Button onClick={handleConnect} disabled={syncing}>
                {syncing ? 'Connecting...' : 'Connect ClickUp'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {integration.isConnected && (
        <>
          {/* Projects Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {project.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {project.completedTasks}/{project.taskCount} tasks completed
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-24">
                      <Progress 
                        value={(project.completedTasks / project.taskCount) * 100} 
                        className="h-2"
                      />
                    </div>
                    {project.dueDate && (
                      <span className="text-xs text-gray-500">
                        Due {format(project.dueDate, 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Tasks
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'assigned' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('assigned')}
                  >
                    Assigned to me
                  </Button>
                  <Button
                    variant={filter === 'due_soon' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter('due_soon')}
                  >
                    Due soon
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No tasks found
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
                      <CheckSquare className={`h-4 w-4 ${getStatusColor(task.status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {task.title}
                        </h4>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                          style={{ borderColor: task.project.color, color: task.project.color }}
                        >
                          {task.project.name}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{task.status.replace('_', ' ')}</span>
                        <span className="capitalize">{task.priority} priority</span>
                        
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Due {format(task.dueDate, 'MMM d')}
                          </span>
                        )}
                        
                        {task.assignee && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {task.assignee.name}
                          </span>
                        )}
                      </div>
                      
                      {task.progress !== undefined && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress} className="h-1 flex-1" />
                            <span className="text-xs text-gray-500">{task.progress}%</span>
                          </div>
                        </div>
                      )}
                      
                      {task.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {task.dueDate && task.dueDate.getTime() - Date.now() < 1000 * 60 * 60 * 24 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Due soon
                        </Badge>
                      )}
                      
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
