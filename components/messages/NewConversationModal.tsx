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

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  participantIds: z.array(z.string()).default([]),
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

  React.useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const rows = await listProfiles({ search, excludeSelf: true, limit: 50 })
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
  }, [search])

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
              placeholder="Search people by username or name"
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
                  {!loading && profiles.map((p) => (
                    <button
                      type="button"
                      key={p.user_id}
                      onClick={() => toggleParticipant(p.user_id)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 hover:bg-accent/40 text-left',
                        participants.includes(p.user_id) && 'bg-accent/60'
                      )}
                    >
                      <Checkbox
                        checked={participants.includes(p.user_id)}
                        onCheckedChange={() => toggleParticipant(p.user_id)}
                        className="mr-1"
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.avatar_url ?? undefined} alt={p.username} />
                        <AvatarFallback>{p.username?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{p.full_name || p.username}</div>
                        <div className="text-xs text-muted-foreground truncate">@{p.username}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
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
