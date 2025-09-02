"use client"

import { useState, useEffect } from "react"
import { 
  Bot, 
  StickyNote, 
  MessageSquare, 
  Settings, 
  Pin,
  Hash,
  Users,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileText,
  GitBranch,
  Bug,
  CheckSquare,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AIPanelSidebarProps {
  chatId: string
  isCollapsed: boolean
  onToggle: () => void
}

interface Patch {
  id: string
  number: number
  title: string
  status: "draft" | "in-progress" | "review" | "completed"
  checklist: string[]
  completedItems: string[]
  summary: string
  timestamp: Date
}

interface Note {
  id: string
  content: string
  type: "feature" | "bug" | "task" | "reminder"
  isPinned: boolean
  timestamp: Date
  linkedPatchId?: string
}

export function AiToolsSidebar({ activeTab }: { activeTab: 'agents' | 'mcp' }) {
  return (
    <div className="p-4">
      {activeTab === 'agents' ? (
        <div>
          <h3 className="font-semibold mb-4">AI Agents</h3>
          <p className="text-sm text-gray-600">Agent management coming soon...</p>
        </div>
      ) : (
        <div>
          <h3 className="font-semibold mb-4">MCP Tools</h3>
          <p className="text-sm text-gray-600">MCP tools coming soon...</p>
        </div>
      )}
    </div>
  )
}

export function AIPanelSidebar({ chatId, isCollapsed, onToggle }: AIPanelSidebarProps) {
  const [activeTab, setActiveTab] = useState("patches")
  const [patches, setPatches] = useState<Patch[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [aiMode, setAIMode] = useState<"standard" | "enhanced" | "autonomous">("enhanced")
  const [combinationChatEnabled, setCombinationChatEnabled] = useState(true)
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    // Load patches from workspace
    const mockPatches: Patch[] = [
      {
        id: "patch-1",
        number: 1,
        title: "UI Enhancement",
        status: "in-progress",
        checklist: [
          "Build AI Panel sidebar",
          "Add patches management",
          "Implement notes system",
          "Add pinned messages"
        ],
        completedItems: ["Build AI Panel sidebar"],
        summary: "Implementing comprehensive UI improvements for messaging application",
        timestamp: new Date()
      },
      {
        id: "patch-2",
        number: 2,
        title: "Mobile Support",
        status: "draft",
        checklist: [
          "Setup Expo for mobile",
          "Build iOS app",
          "Build Android app",
          "Implement watch app"
        ],
        completedItems: [],
        summary: "Adding cross-platform mobile support with Expo",
        timestamp: new Date()
      }
    ]
    setPatches(mockPatches)

    // Load notes
    const mockNotes: Note[] = [
      {
        id: "note-1",
        content: "Remember to implement WebSocket for real-time updates",
        type: "reminder",
        isPinned: true,
        timestamp: new Date()
      },
      {
        id: "note-2",
        content: "Group chat functionality needs message threading",
        type: "feature",
        isPinned: false,
        timestamp: new Date(),
        linkedPatchId: "patch-1"
      }
    ]
    setNotes(mockNotes)
  }, [])

  const addNote = () => {
    if (!newNote.trim()) return
    
    const note: Note = {
      id: `note-${Date.now()}`,
      content: newNote,
      type: "task",
      isPinned: false,
      timestamp: new Date()
    }
    
    setNotes(prev => [note, ...prev])
    setNewNote("")
  }

  const toggleNotePin = (noteId: string) => {
    setNotes(prev => 
      prev.map(note => 
        note.id === noteId 
          ? { ...note, isPinned: !note.isPinned }
          : note
      )
    )
  }

  const getStatusColor = (status: Patch["status"]) => {
    const colors = {
      draft: "bg-gray-500",
      "in-progress": "bg-blue-500",
      review: "bg-yellow-500",
      completed: "bg-green-500"
    }
    return colors[status]
  }

  const getNoteIcon = (type: Note["type"]) => {
    const icons = {
      feature: <Sparkles className="h-3 w-3" />,
      bug: <Bug className="h-3 w-3" />,
      task: <CheckSquare className="h-3 w-3" />,
      reminder: <AlertCircle className="h-3 w-3" />
    }
    return icons[type]
  }

  if (isCollapsed) {
    return (
      <div className="h-full bg-white dark:bg-gray-800 border-l border-transparent w-12 flex flex-col items-center py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            onClick={() => {
              onToggle()
              setActiveTab("patches")
            }}
          >
            <GitBranch className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            onClick={() => {
              onToggle()
              setActiveTab("notes")
            }}
          >
            <StickyNote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            onClick={() => {
              onToggle()
              setActiveTab("messages")
            }}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
            onClick={() => {
              onToggle()
              setActiveTab("settings")
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-l border-transparent flex flex-col w-80">
      {/* Header */}
      <div className="p-4 border-b border-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-500" />
          <h2 className="font-semibold">AI Panel</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 px-4">
          <TabsTrigger value="patches">Patches</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Patches Tab */}
          <TabsContent value="patches" className="px-4 space-y-3">
            <div className="space-y-3">
              {patches.map(patch => (
                <Card key={patch.id} className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Patch {patch.number}
                      </Badge>
                      <div className={cn("w-2 h-2 rounded-full", getStatusColor(patch.status))} />
                    </div>
                    <span className="text-xs text-gray-500">
                      {patch.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm mb-1">{patch.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {patch.summary}
                  </p>
                  <div className="space-y-1">
                    {patch.checklist.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <CheckSquare 
                          className={cn(
                            "h-3 w-3",
                            patch.completedItems.includes(item) 
                              ? "text-green-500" 
                              : "text-gray-400"
                          )}
                        />
                        <span className={cn(
                          patch.completedItems.includes(item) && "line-through text-gray-500"
                        )}>
                          {item}
                        </span>
                      </div>
                    ))}
                    {patch.checklist.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{patch.checklist.length - 3} more items
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            <Button size="sm" variant="outline" className="w-full">
              View All Patches
            </Button>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="px-4 space-y-3">
            <div className="space-y-2">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a quick note..."
                className="min-h-[80px] text-sm"
              />
              <Button 
                size="sm" 
                onClick={addNote}
                disabled={!newNote.trim()}
                className="w-full"
              >
                Add Note
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              {notes
                .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                .map(note => (
                  <Card key={note.id} className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getNoteIcon(note.type)}
                        <Badge variant="outline" className="text-xs">
                          {note.type}
                        </Badge>
                        {note.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleNotePin(note.id)}
                      >
                        <Pin className={cn(
                          "h-3 w-3",
                          note.isPinned ? "text-yellow-500" : "text-gray-400"
                        )} />
                      </Button>
                    </div>
                    <p className="text-sm mb-1">{note.content}</p>
                    {note.linkedPatchId && (
                      <Badge variant="secondary" className="text-xs">
                        Linked to {note.linkedPatchId}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 block mt-1">
                      {note.timestamp.toLocaleTimeString()}
                    </span>
                  </Card>
                ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="px-4 space-y-3">
            <Card className="p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Pin className="h-3 w-3" />
                Pinned Messages
              </h4>
              <div className="space-y-2">
                <div className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="font-medium text-xs mb-1">Sarah Wilson</p>
                  <p className="text-xs">Don&apos;t forget about the team meeting at 2 PM!</p>
                </div>
                <div className="text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="font-medium text-xs mb-1">You</p>
                  <p className="text-xs">Project repository link: github.com/example/repo</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Hash className="h-3 w-3" />
                Group Chats
              </h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-3 w-3 mr-2" />
                  Development Team
                  <Badge variant="secondary" className="ml-auto">12</Badge>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Users className="h-3 w-3 mr-2" />
                  Design Sprint
                  <Badge variant="secondary" className="ml-auto">5</Badge>
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="px-4 space-y-3">
            <Card className="p-3">
              <h4 className="font-medium text-sm mb-3">AI Mode</h4>
              <div className="space-y-2">
                <label className="flex items-center justify-between">
                  <span className="text-sm">Standard</span>
                  <input
                    type="radio"
                    name="aiMode"
                    checked={aiMode === "standard"}
                    onChange={() => setAIMode("standard")}
                    className="h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Enhanced</span>
                  <input
                    type="radio"
                    name="aiMode"
                    checked={aiMode === "enhanced"}
                    onChange={() => setAIMode("enhanced")}
                    className="h-4 w-4"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span className="text-sm">Autonomous</span>
                  <input
                    type="radio"
                    name="aiMode"
                    checked={aiMode === "autonomous"}
                    onChange={() => setAIMode("autonomous")}
                    className="h-4 w-4"
                  />
                </label>
              </div>
            </Card>

            <Card className="p-3">
              <h4 className="font-medium text-sm mb-3">Chat Features</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Combination Chats</span>
                  <Switch
                    checked={combinationChatEnabled}
                    onCheckedChange={setCombinationChatEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tool Integration</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Agent Collaboration</span>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <h4 className="font-medium text-sm mb-3">Agent Settings</h4>
              <div className="space-y-2">
                <Input placeholder="Agent Response Timeout" type="number" defaultValue="30" />
                <Input placeholder="Max Agents per Chat" type="number" defaultValue="5" />
                <Button size="sm" variant="outline" className="w-full">
                  Configure Agent Permissions
                </Button>
              </div>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
