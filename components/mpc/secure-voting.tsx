"use client"

import { DialogTitle } from "@/components/ui/dialog"

import { DialogHeader } from "@/components/ui/dialog"

import { DialogContent } from "@/components/ui/dialog"

import { Dialog } from "@/components/ui/dialog"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Vote, Shield, CheckCircle, Clock, Plus, X } from "lucide-react"

export interface VotingSession {
  id: string
  title: string
  description: string
  options: VotingOption[]
  status: "setup" | "active" | "computing" | "completed"
  participants: VotingParticipant[]
  anonymity: "anonymous" | "pseudonymous" | "identified"
  votingType: "single" | "multiple" | "ranked"
  threshold: number
  progress: number
  results?: VotingResults
  createdAt: Date
  endsAt?: Date
}

export interface VotingOption {
  id: string
  text: string
  description?: string
  votes?: number
}

export interface VotingParticipant {
  id: string
  name: string
  hasVoted: boolean
  votedAt?: Date
}

export interface VotingResults {
  totalVotes: number
  results: Array<{
    optionId: string
    votes: number
    percentage: number
  }>
  winner?: string
}

const mockVotingSessions: VotingSession[] = [
  {
    id: "vote-1",
    title: "Next Sprint Features",
    description: "Vote on which features to prioritize in the next development sprint",
    options: [
      { id: "opt-1", text: "Dark Mode Support", description: "Add dark theme to the application" },
      { id: "opt-2", text: "Mobile App", description: "Develop native mobile application" },
      { id: "opt-3", text: "API Integration", description: "Add third-party API integrations" },
      { id: "opt-4", text: "Performance Optimization", description: "Improve app performance and loading times" },
    ],
    status: "completed",
    participants: [
      { id: "user-1", name: "Alice", hasVoted: true, votedAt: new Date() },
      { id: "user-2", name: "Bob", hasVoted: true, votedAt: new Date() },
      { id: "user-3", name: "Charlie", hasVoted: true, votedAt: new Date() },
      { id: "user-4", name: "David", hasVoted: true, votedAt: new Date() },
    ],
    anonymity: "anonymous",
    votingType: "single",
    threshold: 3,
    progress: 100,
    results: {
      totalVotes: 4,
      results: [
        { optionId: "opt-1", votes: 2, percentage: 50 },
        { optionId: "opt-2", votes: 1, percentage: 25 },
        { optionId: "opt-3", votes: 1, percentage: 25 },
        { optionId: "opt-4", votes: 0, percentage: 0 },
      ],
      winner: "opt-1",
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: "vote-2",
    title: "Team Lunch Location",
    description: "Choose where we should go for the team lunch this Friday",
    options: [
      { id: "opt-5", text: "Italian Restaurant", description: "Authentic Italian cuisine downtown" },
      { id: "opt-6", text: "Sushi Bar", description: "Fresh sushi and Japanese dishes" },
      { id: "opt-7", text: "Food Court", description: "Variety of options at the mall" },
    ],
    status: "active",
    participants: [
      { id: "user-1", name: "Alice", hasVoted: true, votedAt: new Date() },
      { id: "user-2", name: "Bob", hasVoted: false },
      { id: "user-3", name: "Charlie", hasVoted: true, votedAt: new Date() },
    ],
    anonymity: "pseudonymous",
    votingType: "single",
    threshold: 2,
    progress: 67,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    endsAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  },
]

interface SecureVotingProps {
  onCreateVote: (vote: Omit<VotingSession, "id" | "createdAt" | "status" | "progress">) => void
  onCastVote: (sessionId: string, optionIds: string[]) => void
}

export function SecureVoting({ onCreateVote, onCastVote }: SecureVotingProps) {
  const [sessions, setSessions] = useState<VotingSession[]>(mockVotingSessions)
  const [selectedSession, setSelectedSession] = useState<VotingSession | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newVote, setNewVote] = useState({
    title: "",
    description: "",
    options: [{ text: "", description: "" }],
    anonymity: "anonymous" as VotingSession["anonymity"],
    votingType: "single" as VotingSession["votingType"],
    threshold: 1,
  })

  const handleAddOption = useCallback(() => {
    setNewVote((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", description: "" }],
    }))
  }, [])

  const handleRemoveOption = useCallback((index: number) => {
    setNewVote((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }))
  }, [])

  const handleUpdateOption = useCallback((index: number, field: string, value: string) => {
    setNewVote((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt)),
    }))
  }, [])

  const handleCreateVote = useCallback(() => {
    const vote: Omit<VotingSession, "id" | "createdAt" | "status" | "progress"> = {
      title: newVote.title,
      description: newVote.description,
      options: newVote.options
        .filter((opt) => opt.text.trim())
        .map((opt, index) => ({
          id: `opt-${Date.now()}-${index}`,
          text: opt.text,
          description: opt.description,
        })),
      participants: [],
      anonymity: newVote.anonymity,
      votingType: newVote.votingType,
      threshold: newVote.threshold,
    }

    onCreateVote(vote)
    setIsCreating(false)
    setNewVote({
      title: "",
      description: "",
      options: [{ text: "", description: "" }],
      anonymity: "anonymous",
      votingType: "single",
      threshold: 1,
    })
  }, [newVote, onCreateVote])

  const handleVote = useCallback(
    (sessionId: string, optionId: string) => {
      onCastVote(sessionId, [optionId])
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                participants: session.participants.map((p) =>
                  p.id === "current-user" ? { ...p, hasVoted: true, votedAt: new Date() } : p,
                ),
                progress: Math.min(
                  ((session.participants.filter((p) => p.hasVoted).length + 1) / session.participants.length) * 100,
                  100,
                ),
              }
            : session,
        ),
      )
    },
    [onCastVote],
  )

  const getStatusIcon = (status: VotingSession["status"]) => {
    switch (status) {
      case "setup":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "active":
        return <Vote className="h-4 w-4 text-blue-500" />
      case "computing":
        return <Shield className="h-4 w-4 text-purple-500 animate-pulse" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const activeVotes = sessions.filter((s) => s.status === "active").length
  const completedVotes = sessions.filter((s) => s.status === "completed").length

  if (isCreating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Vote className="h-4 w-4" />
            Create Secure Vote
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vote Title</label>
            <Input
              value={newVote.title}
              onChange={(e) => setNewVote((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter vote title..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={newVote.description}
              onChange={(e) => setNewVote((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this vote is about..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Options</label>
            <div className="space-y-2">
              {newVote.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input
                      value={option.text}
                      onChange={(e) => handleUpdateOption(index, "text", e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Input
                      value={option.description}
                      onChange={(e) => handleUpdateOption(index, "description", e.target.value)}
                      placeholder="Optional description"
                      className="text-xs"
                    />
                  </div>
                  {newVote.options.length > 1 && (
                    <Button size="sm" variant="outline" onClick={() => handleRemoveOption(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" onClick={handleAddOption}>
              <Plus className="h-3 w-3 mr-1" />
              Add Option
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Anonymity</label>
              <select
                value={newVote.anonymity}
                onChange={(e) =>
                  setNewVote((prev) => ({ ...prev, anonymity: e.target.value as VotingSession["anonymity"] }))
                }
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="anonymous">Anonymous</option>
                <option value="pseudonymous">Pseudonymous</option>
                <option value="identified">Identified</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Voting Type</label>
              <select
                value={newVote.votingType}
                onChange={(e) =>
                  setNewVote((prev) => ({ ...prev, votingType: e.target.value as VotingSession["votingType"] }))
                }
                className="w-full p-2 border rounded-md text-sm"
              >
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Choice</option>
                <option value="ranked">Ranked Choice</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Threshold</label>
              <Input
                type="number"
                min="1"
                value={newVote.threshold}
                onChange={(e) => setNewVote((prev) => ({ ...prev, threshold: Number.parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCreateVote} disabled={!newVote.title || newVote.options.length === 0}>
              <Shield className="h-4 w-4 mr-2" />
              Create Secure Vote
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Vote className="h-5 w-5" />
            AGENT - Secure Voting
          </h3>
          <div className="flex gap-2">
            <Badge variant="outline">{activeVotes} Active</Badge>
            <Badge variant="secondary">{completedVotes} Completed</Badge>
          </div>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Vote
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <VotingSessionCard
            key={session.id}
            session={session}
            onSelect={() => setSelectedSession(session)}
            onVote={(optionId) => handleVote(session.id, optionId)}
          />
        ))}
      </div>

      {selectedSession && <VotingDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </div>
  )
}

function VotingSessionCard({
  session,
  onSelect,
  onVote,
}: {
  session: VotingSession
  onSelect: () => void
  onVote: (optionId: string) => void
}) {
  const getStatusIcon = (status: VotingSession["status"]) => {
    switch (status) {
      case "setup":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "active":
        return <Vote className="h-4 w-4 text-blue-500" />
      case "computing":
        return <Shield className="h-4 w-4 text-purple-500 animate-pulse" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const currentUserVoted = session.participants.some((p) => p.id === "current-user" && p.hasVoted)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">{session.title}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {session.anonymity}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {session.votingType}
              </Badge>
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
        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{session.description}</p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {session.participants.filter((p) => p.hasVoted).length}/{session.participants.length} voted
          </span>
          <span>{session.options.length} options</span>
        </div>

        {session.status === "active" && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Participation</span>
              <span>{Math.round(session.progress)}%</span>
            </div>
            <Progress value={session.progress} className="h-2" />
          </div>
        )}

        {session.results && (
          <div className="space-y-2">
            <div className="text-xs font-medium">Results:</div>
            {session.results.results.slice(0, 2).map((result) => {
              const option = session.options.find((opt) => opt.id === result.optionId)
              return (
                <div key={result.optionId} className="flex items-center justify-between text-xs">
                  <span>{option?.text}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${result.percentage}%` }} />
                    </div>
                    <span>{result.votes}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex gap-2">
          {session.status === "active" && !currentUserVoted && (
            <Button size="sm" variant="outline" onClick={onSelect} className="flex-1 bg-transparent">
              <Vote className="h-3 w-3 mr-1" />
              Vote Now
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={onSelect}>
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function VotingDetailModal({ session, onClose }: { session: VotingSession; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            {session.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">{session.description}</p>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Badge variant="default">{session.status}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Anonymity</label>
              <Badge variant="outline">{session.anonymity}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Badge variant="secondary">{session.votingType}</Badge>
            </div>
          </div>

          {session.results ? (
            <div className="space-y-3">
              <h4 className="font-medium">Results</h4>
              {session.results.results.map((result) => {
                const option = session.options.find((opt) => opt.id === result.optionId)
                return (
                  <div key={result.optionId} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option?.text}</span>
                      <span className="text-sm text-gray-500">
                        {result.votes} votes ({result.percentage}%)
                      </span>
                    </div>
                    <Progress value={result.percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-medium">Options</h4>
              {session.options.map((option) => (
                <div key={option.id} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">{option.text}</div>
                  {option.description && <div className="text-xs text-gray-500 mt-1">{option.description}</div>}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-medium">Participants ({session.participants.length})</h4>
            <div className="space-y-2">
              {session.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between">
                  <span className="text-sm">{participant.name}</span>
                  <Badge variant={participant.hasVoted ? "default" : "outline"} className="text-xs">
                    {participant.hasVoted ? "Voted" : "Pending"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
