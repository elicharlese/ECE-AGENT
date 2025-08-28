"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Shield,
  Users,
  Calculator,
  Vote,
  BarChart3,
  Lock,
  Key,
  Network,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"

export interface MPCSession {
  id: string
  name: string
  type: "voting" | "calculation" | "analytics" | "aggregation" | "custom"
  status: "setup" | "waiting" | "computing" | "completed" | "failed"
  participants: MPCParticipant[]
  requiredParticipants: number
  protocol: "shamir" | "bgw" | "gmw" | "aby" | "custom"
  privacy: "semi-honest" | "malicious" | "covert"
  threshold: number
  progress: number
  result?: unknown
  error?: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  metadata?: Record<string, unknown>
}

export interface MPCParticipant {
  id: string
  name: string
  status: "invited" | "joined" | "ready" | "computing" | "completed" | "failed"
  publicKey?: string
  shares?: string[]
  contribution?: unknown
  joinedAt?: Date
}

export interface MPCProtocol {
  id: string
  name: string
  description: string
  type: "secret-sharing" | "garbled-circuits" | "homomorphic" | "zkp"
  security: "semi-honest" | "malicious" | "covert"
  efficiency: "low" | "medium" | "high"
  complexity: "simple" | "moderate" | "complex"
  useCases: string[]
}

const mockProtocols: MPCProtocol[] = [
  {
    id: "shamir",
    name: "Shamir Secret Sharing",
    description: "Classic threshold secret sharing scheme",
    type: "secret-sharing",
    security: "semi-honest",
    efficiency: "high",
    complexity: "simple",
    useCases: ["Secure voting", "Key management", "Threshold signatures"],
  },
  {
    id: "bgw",
    name: "BGW Protocol",
    description: "Ben-Or, Goldwasser, and Wigderson protocol",
    type: "secret-sharing",
    security: "malicious",
    efficiency: "medium",
    complexity: "moderate",
    useCases: ["General computation", "Private analytics", "Secure aggregation"],
  },
  {
    id: "gmw",
    name: "GMW Protocol",
    description: "Goldreich, Micali, and Wigderson protocol",
    type: "garbled-circuits",
    security: "semi-honest",
    efficiency: "medium",
    complexity: "complex",
    useCases: ["Boolean circuits", "Comparison operations", "Conditional logic"],
  },
  {
    id: "aby",
    name: "ABY Framework",
    description: "Arithmetic, Boolean, and Yao's garbled circuits",
    type: "garbled-circuits",
    security: "semi-honest",
    efficiency: "high",
    complexity: "complex",
    useCases: ["Mixed computations", "Machine learning", "Database queries"],
  },
]

const mockSessions: MPCSession[] = [
  {
    id: "session-1",
    name: "Team Salary Survey",
    type: "analytics",
    status: "completed",
    participants: [
      { id: "user-1", name: "Alice", status: "completed", joinedAt: new Date() },
      { id: "user-2", name: "Bob", status: "completed", joinedAt: new Date() },
      { id: "user-3", name: "Charlie", status: "completed", joinedAt: new Date() },
    ],
    requiredParticipants: 3,
    protocol: "bgw",
    privacy: "malicious",
    threshold: 2,
    progress: 100,
    result: { average: 75000, median: 72000, count: 3 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    startedAt: new Date(Date.now() - 90 * 60 * 1000),
    completedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "session-2",
    name: "Project Budget Calculation",
    type: "calculation",
    status: "computing",
    participants: [
      { id: "user-1", name: "Alice", status: "computing", joinedAt: new Date() },
      { id: "user-4", name: "David", status: "computing", joinedAt: new Date() },
    ],
    requiredParticipants: 2,
    protocol: "shamir",
    privacy: "semi-honest",
    threshold: 2,
    progress: 65,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    startedAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "session-3",
    name: "Feature Priority Voting",
    type: "voting",
    status: "waiting",
    participants: [
      { id: "user-1", name: "Alice", status: "ready", joinedAt: new Date() },
      { id: "user-2", name: "Bob", status: "joined", joinedAt: new Date() },
    ],
    requiredParticipants: 5,
    protocol: "shamir",
    privacy: "semi-honest",
    threshold: 3,
    progress: 0,
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
  },
]

interface MPCManagerProps {
  onCreateSession: (session: Omit<MPCSession, "id" | "createdAt" | "status" | "progress">) => void
  onJoinSession: (sessionId: string, participantId: string) => void
}

export function MPCManager({ onCreateSession, onJoinSession }: MPCManagerProps) {
  const [sessions, setSessions] = useState<MPCSession[]>(mockSessions)
  const [protocols] = useState<MPCProtocol[]>(mockProtocols)
  const [selectedSession, setSelectedSession] = useState<MPCSession | null>(null)
  const [activeTab, setActiveTab] = useState("sessions")

  const handleStartSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              status: "computing" as const,
              startedAt: new Date(),
              progress: 0,
            }
          : session,
      ),
    )

    // Simulate MPC computation
    const interval = setInterval(() => {
      setSessions((prev) => {
        const session = prev.find((s) => s.id === sessionId)
        if (!session || session.status !== "computing") {
          clearInterval(interval)
          return prev
        }

        const newProgress = Math.min(session.progress + Math.random() * 10, 100)
        return prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                progress: newProgress,
                ...(newProgress >= 100 && {
                  status: "completed" as const,
                  completedAt: new Date(),
                  result: generateMockResult(s.type),
                }),
              }
            : s,
        )
      })
    }, 1000)
  }, [])

  const generateMockResult = (type: MPCSession["type"]) => {
    switch (type) {
      case "voting":
        return { winner: "Option A", votes: { A: 3, B: 2, C: 1 } }
      case "calculation":
        return { sum: 150000, average: 75000 }
      case "analytics":
        return { mean: 72500, stddev: 12000, count: 4 }
      case "aggregation":
        return { total: 250000, participants: 5 }
      default:
        return { result: "Computation completed successfully" }
    }
  }

  const getStatusIcon = (status: MPCSession["status"]) => {
    switch (status) {
      case "setup":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "waiting":
        return <Users className="h-4 w-4 text-yellow-500" />
      case "computing":
        return <Shield className="h-4 w-4 text-blue-500 animate-pulse" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: MPCSession["type"]) => {
    switch (type) {
      case "voting":
        return <Vote className="h-4 w-4" />
      case "calculation":
        return <Calculator className="h-4 w-4" />
      case "analytics":
        return <BarChart3 className="h-4 w-4" />
      case "aggregation":
        return <Network className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getSecurityColor = (privacy: MPCSession["privacy"]) => {
    switch (privacy) {
      case "malicious":
        return "bg-red-500"
      case "covert":
        return "bg-yellow-500"
      case "semi-honest":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const activeSessions = sessions.filter((s) => s.status === "computing").length
  const completedSessions = sessions.filter((s) => s.status === "completed").length
  const waitingSessions = sessions.filter((s) => s.status === "waiting").length

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          MPC ({activeSessions})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Multi-Party Computation Framework
            <Badge variant="secondary" className="ml-2">
              {sessions.length} Sessions
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="protocols">Protocols</TabsTrigger>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="sessions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Active Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{activeSessions}</div>
                  <p className="text-xs text-gray-500">Currently computing</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Waiting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{waitingSessions}</div>
                  <p className="text-xs text-gray-500">Awaiting participants</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{completedSessions}</div>
                  <p className="text-xs text-gray-500">Successfully finished</p>
                </CardContent>
              </Card>
            </div>

            <ScrollArea className="h-64 w-full">
              <div className="space-y-3">
                {sessions.map((session) => (
                  <MPCSessionCard
                    key={session.id}
                    session={session}
                    onSelect={() => setSelectedSession(session)}
                    onStart={() => handleStartSession(session.id)}
                    onJoin={() => onJoinSession(session.id, "current-user")}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="protocols" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {protocols.map((protocol) => (
                <Card key={protocol.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm">{protocol.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          {protocol.type}
                        </Badge>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {protocol.security}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {protocol.efficiency} efficiency
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-gray-600 dark:text-gray-300">{protocol.description}</p>
                    <div>
                      <label className="text-xs font-medium">Use Cases:</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {protocol.useCases.map((useCase, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {useCase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Create New MPC Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Session Name</label>
                    <Input placeholder="Enter session name..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Computation Type</label>
                    <select className="w-full p-2 border rounded-md text-sm">
                      <option value="voting">Secure Voting</option>
                      <option value="calculation">Private Calculation</option>
                      <option value="analytics">Private Analytics</option>
                      <option value="aggregation">Secure Aggregation</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Protocol</label>
                    <select className="w-full p-2 border rounded-md text-sm">
                      {protocols.map((protocol) => (
                        <option key={protocol.id} value={protocol.id}>
                          {protocol.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Required Participants</label>
                    <Input type="number" min="2" max="10" defaultValue="3" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Threshold</label>
                    <Input type="number" min="1" max="5" defaultValue="2" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Security Model</label>
                    <select className="w-full p-2 border rounded-md text-sm">
                      <option value="semi-honest">Semi-Honest</option>
                      <option value="malicious">Malicious</option>
                      <option value="covert">Covert</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  Create MPC Session
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Cryptographic Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Public Key</span>
                    <Badge variant="outline" className="text-xs">
                      RSA-2048
                    </Badge>
                  </div>
                  <div className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded font-mono">
                    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
                  </div>
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    Generate New Key Pair
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Zero-Knowledge Proofs</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Verifiable Computation</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Secure Channels</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Input Validation</span>
                    <input type="checkbox" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {selectedSession && (
          <MPCSessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function MPCSessionCard({
  session,
  onSelect,
  onStart,
  onJoin,
}: {
  session: MPCSession
  onSelect: () => void
  onStart: () => void
  onJoin: () => void
}) {
  const getTypeIcon = (type: MPCSession["type"]) => {
    switch (type) {
      case "voting":
        return <Vote className="h-4 w-4" />
      case "calculation":
        return <Calculator className="h-4 w-4" />
      case "analytics":
        return <BarChart3 className="h-4 w-4" />
      case "aggregation":
        return <Network className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: MPCSession["status"]) => {
    switch (status) {
      case "setup":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "waiting":
        return <Users className="h-4 w-4 text-yellow-500" />
      case "computing":
        return <Shield className="h-4 w-4 text-blue-500 animate-pulse" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getTypeIcon(session.type)}
            <div>
              <CardTitle className="text-sm">{session.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {session.type}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {session.protocol}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(session.status)}
            <Badge variant={session.status === "completed" ? "default" : "secondary"} className="text-xs">
              {session.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {session.participants.length}/{session.requiredParticipants} participants
          </span>
          <span>Threshold: {session.threshold}</span>
          <span>{session.privacy} security</span>
        </div>

        {session.status === "computing" && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Computing...</span>
              <span>{Math.round(session.progress)}%</span>
            </div>
            <Progress value={session.progress} className="h-2" />
          </div>
        )}

        {session.result !== undefined && session.result !== null && (
          <div className="text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded border">
            <strong>Result:</strong> {JSON.stringify(session.result, null, 2)}
          </div>
        )}

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {session.status === "waiting" && (
            <>
              <Button size="sm" variant="outline" onClick={onJoin} className="flex-1 bg-transparent">
                <Users className="h-3 w-3 mr-1" />
                Join
              </Button>
              {session.participants.length >= session.threshold && (
                <Button size="sm" onClick={onStart}>
                  <Play className="h-3 w-3 mr-1" />
                  Start
                </Button>
              )}
            </>
          )}
          {session.status === "setup" && (
            <Button size="sm" variant="outline" onClick={onJoin} className="flex-1 bg-transparent">
              <Users className="h-3 w-3 mr-1" />
              Join Session
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MPCSessionDetailModal({ session, onClose }: { session: MPCSession; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {session.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Badge variant="outline">{session.type}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Protocol</label>
                  <Badge variant="secondary">{session.protocol}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge variant="default">{session.status}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Privacy Model</label>
                  <Badge variant="outline">{session.privacy}</Badge>
                </div>
              </div>
              {session.result !== undefined && session.result !== null && (
                <div>
                  <label className="text-sm font-medium">Computation Result</label>
                  <div className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md mt-1">
                    <pre>{JSON.stringify(session.result, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <div className="space-y-3">
              {session.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4" />
                    <div>
                      <div className="font-medium text-sm">{participant.name}</div>
                      <div className="text-xs text-gray-500">
                        {participant.joinedAt?.toLocaleString() || "Not joined"}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {participant.status}
                  </Badge>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Threshold</label>
                  <div className="text-lg font-bold">{session.threshold}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Required Participants</label>
                  <div className="text-lg font-bold">{session.requiredParticipants}</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Security Properties</label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Input Privacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Output Correctness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Verifiable Computation</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
