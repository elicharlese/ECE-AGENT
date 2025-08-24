"use client"

import * as React from 'react'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { listProfiles, type Profile } from '@/services/profile-service'
import { useConversations } from '@/hooks/use-conversations'
import { useUser } from '@/contexts/user-context'
import { dmService } from '@/services/dm-service'

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  participantIds: z.array(z.string()).default([]),
})

const InviteSchema = z.object({
  email: z.string().email(),
})

export type NewConversationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (conversationId: string) => void
}

export function NewConversationModal({ open, onOpenChange, onCreated }: NewConversationModalProps) {
  const [title, setTitle] = React.useState('')
  const [participants, setParticipants] = React.useState<string[]>([])
  const [search, setSearch] = React.useState('')
  const [profiles, setProfiles] = React.useState<Profile[]>([])
  const [loading, setLoading] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { user } = useUser()
  const [dmBusyId, setDmBusyId] = React.useState<string | null>(null)
  const DEBOUNCE_MS = 350
  const [debouncedSearch, setDebouncedSearch] = React.useState(search)

  // Invite-by-email state
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviteStatus, setInviteStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [inviteError, setInviteError] = React.useState<string | null>(null)

  // Debounce raw input to avoid firing a request per keystroke
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS)
    return () => window.clearTimeout(id)
  }, [search])

  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        // Include self so testers can verify rendering of their own row
        const rows = await listProfiles({ search: debouncedSearch, excludeSelf: false, limit: 50 })
        if (!cancelled) setProfiles(rows)
      } catch (e) {
        if (!cancelled) setProfiles([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [debouncedSearch])

  const hook = useConversations()

  const toggleParticipant = (id: string) => {
    setParticipants((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const resetForm = () => {
    setTitle('')
    setParticipants([])
    setSearch('')
    setProfiles([])
    setError(null)
    setInviteEmail('')
    setInviteStatus('idle')
    setInviteError(null)
  }

  const handleAddFriend = async (p: Profile) => {
    if (!p?.username) return
    if (p.user_id === user?.id) return // no DM with self
    try {
      setDmBusyId(p.user_id)
      const conv = await dmService.startDirectMessageByUsername(p.username)
      onOpenChange(false)
      resetForm()
      if (conv?.id && onCreated) onCreated(conv.id)
    } catch (e: any) {
      setError(e?.message || 'Failed to start DM')
    } finally {
      setDmBusyId(null)
    }
  }

  const handleCreate = async () => {
    setError(null)
    const parsed = FormSchema.safeParse({ title, participantIds: participants })
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || 'Invalid input')
      return
    }
    setSubmitting(true)
    try {
      const conv = await hook.createConversationWithParticipants(parsed.data.title, parsed.data.participantIds)
      onOpenChange(false)
      resetForm()
      if (conv?.id && onCreated) onCreated(conv.id)
    } catch (e: any) {
      setError(e?.message || 'Failed to create')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInvite = async () => {
    setInviteError(null)
    const parsed = InviteSchema.safeParse({ email: inviteEmail.trim() })
    if (!parsed.success) {
      setInviteError('Please enter a valid email address')
      return
    }
    setInviteStatus('sending')
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: parsed.data.email, redirectTo }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to send invite')
      setInviteStatus('sent')
      setInviteEmail('')
    } catch (e: any) {
      setInviteStatus('error')
      setInviteError(e?.message || 'Failed to send invite')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm() }}>
      <DialogContent title="New Conversation" description="Create a new conversation and invite participants.">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Give it a title and pick participants to include.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              placeholder="Project Alpha, Weekend Plans..."
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Add participants</label>
            <Input
              placeholder="Search by username or email"
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
            />

            <div className="mt-2 text-xs text-muted-foreground">
              {participants.length} selected
            </div>

            <div className="mt-2 border rounded-md">
              <ScrollArea className="h-56">
                <div className="divide-y">
                  {loading && (
                    <div className="text-sm text-muted-foreground p-3">Loading…</div>
                  )}
                  {!loading && profiles.length === 0 && (
                    <div className="text-sm text-muted-foreground p-3">No results</div>
                  )}
                  {!loading && profiles.map((p) => {
                    const isSelf = p.user_id === user?.id
                    const selected = participants.includes(p.user_id)
                    return (
                      <div
                        key={p.user_id}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 hover:bg-accent/40',
                          selected && 'bg-accent/60'
                        )}
                      >
                        <Checkbox
                          checked={selected}
                          onCheckedChange={() => toggleParticipant(p.user_id)}
                          className="mr-1"
                          disabled={isSelf}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={p.avatar_url ?? undefined} alt={p.username} />
                          <AvatarFallback>{p.username?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {p.full_name || p.username} {isSelf && <span className="text-xs text-muted-foreground">(You)</span>}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">@{p.username}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAddFriend(p)}
                            disabled={isSelf || dmBusyId === p.user_id}
                          >
                            {dmBusyId === p.user_id ? 'Adding…' : 'Add friend'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => toggleParticipant(p.user_id)}
                            disabled={isSelf}
                          >
                            {selected ? 'Added' : 'Add to chat'}
                          </Button>
                        </div>
                      </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Invite by email */}
        <div className="pt-4 mt-4 border-t">
          <label className="block text-sm font-medium mb-1">Invite by email</label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="name@example.com"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.currentTarget.value)
                setInviteError(null)
                if (inviteStatus === 'sent' || inviteStatus === 'error') setInviteStatus('idle')
              }}
            />
            <Button
              variant="secondary"
              onClick={handleInvite}
              disabled={inviteStatus === 'sending' || inviteEmail.trim().length === 0}
            >
              {inviteStatus === 'sending' ? 'Sending…' : 'Send invite'}
            </Button>
          </div>
          <div className="h-5 mt-1">
            {inviteStatus === 'sent' && (
              <span className="text-xs text-emerald-600">Invite sent.</span>
            )}
            {inviteError && (
              <span className="text-xs text-destructive">{inviteError}</span>
            )}
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      <DialogFooter className="pt-2">
        <Button variant="ghost" onClick={() => { onOpenChange(false); resetForm() }} disabled={submitting}>Cancel</Button>
        <Button onClick={handleCreate} disabled={submitting || !title.trim()}>
          {submitting ? 'Creating…' : 'Create'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
}
