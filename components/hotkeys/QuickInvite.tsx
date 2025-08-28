"use client"

import { useState } from "react"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createConversation } from "@/services/conversation-service"
import { toast } from "sonner"

const InviteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Keep it short (≤120 chars)")
})

export type QuickInviteProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function QuickInvite({ open, onOpenChange }: QuickInviteProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    const parsed = InviteSchema.safeParse({ title })
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || "Invalid input"
      setError(msg)
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      const conv = await createConversation(parsed.data.title)
      toast.success("Conversation created")
      onOpenChange(false)
      setTitle("")
      // Navigate and select the new conversation via query param
      router.push(`/messages?c=${encodeURIComponent(conv.id)}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to create conversation"
      toast.error(msg)
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const onEnterKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setError(null) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start a new chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="qi-title">Title</Label>
            <Input
              id="qi-title"
              placeholder="e.g. Project kickoff with Design"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={onEnterKey}
              autoFocus
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || title.trim().length === 0}>
              {submitting ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
