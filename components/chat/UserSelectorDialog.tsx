"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/libs/design-system'
import { Button } from '@/libs/design-system'
import { Input } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { XIcon, UserPlus, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'
import { supabase } from "@/lib/supabase/client"
import { z } from "zod"

export interface UserSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (userIds: string[]) => void
  chatId?: string
  currentUserId?: string
}

// Minimal multi-ID selector. Future: hook into profiles search.
export function UserSelectorDialog({ open, onOpenChange, onConfirm, chatId, currentUserId }: UserSelectorDialogProps) {
  const [query, setQuery] = React.useState("")
  const [ids, setIds] = React.useState<string[]>([])
  const [excludedIds, setExcludedIds] = React.useState<Set<string>>(new Set())
  const [results, setResults] = React.useState<ProfileRow[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  type ProfileRow = {
    user_id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }

  const addTokens = React.useCallback((value: string) => {
    const tokensRaw = value
      .split(/[\n,\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
    if (tokensRaw.length === 0) return
    // Zod UUID validation (optional)
    const uuid = z.string().uuid()
    const tokens = tokensRaw.filter((t) => uuid.safeParse(t).success)
    setIds((prev) => {
      const set = new Set(prev)
      tokens.forEach((t) => set.add(t))
      return Array.from(set)
    })
    setQuery("")
  }, [])

  const removeId = (id: string) => setIds((prev) => prev.filter((x) => x !== id))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTokens(query)
    }
  }

  const handlePaste: React.ClipboardEventHandler<HTMLInputElement> = (e) => {
    const text = e.clipboardData.getData("text")
    if (text) {
      e.preventDefault()
      addTokens(text)
    }
  }

  const handleConfirm = () => {
    if (ids.length > 0) onConfirm(ids)
    onOpenChange(false)
    setIds([])
    setQuery("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setIds([])
    setQuery("")
  }

  // Load current participants to exclude (and exclude currentUserId)
  React.useEffect(() => {
    let active = true
    const loadExcluded = async () => {
      try {
        if (!open) return
        const next = new Set<string>()
        if (currentUserId) next.add(currentUserId)
        if (chatId) {
          const { data, error } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', chatId)
          if (!active) return
          if (!error && data) {
            for (const row of data as { user_id: string }[]) next.add(row.user_id)
          }
        }
        if (active) setExcludedIds(next)
      } catch {
        if (active) setExcludedIds(new Set(currentUserId ? [currentUserId] : []))
      }
    }
    loadExcluded()
    return () => { active = false }
  }, [open, chatId, currentUserId])

  // Debounced profiles search
  React.useEffect(() => {
    let active = true
    if (!open) { setResults([]); return }
    const q = query.trim()
    if (q.length === 0) { setResults([]); return }
    const handle = setTimeout(async () => {
      try {
        setLoading(true)
        setError(null)
        // Search username OR full_name; filter not-excluded
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, username, full_name, avatar_url')
          .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
          .limit(10)
        if (!active) return
        if (error) {
          setError(error.message)
          setResults([])
          return
        }
        const rows = (data || []) as ProfileRow[]
        const filtered = rows.filter(r => !excludedIds.has(r.user_id) && !ids.includes(r.user_id))
        setResults(filtered)
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Failed to search profiles')
          setResults([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }, 300)
    return () => { active = false; clearTimeout(handle) }
  }, [open, query, excludedIds, ids])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => { e.preventDefault(); inputRef.current?.focus() }}>
        <DialogHeader>
          <DialogTitle>Invite participants</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              aria-label="User IDs input"
              placeholder="Search name/username or paste user IDs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              className="pl-9"
            />
          </div>
          {query.trim().length > 0 && (
            <div className="max-h-56 overflow-y-auto rounded-md border">
              {loading && <div className="p-3 text-sm text-muted-foreground">Searching…</div>}
              {!loading && results.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">No matches</div>
              )}
              {!loading && results.map((row) => (
                <button
                  key={row.user_id}
                  type="button"
                  className="w-full flex items-center gap-3 p-2 hover:bg-accent"
                  onClick={() => setIds((prev) => Array.from(new Set([...prev, row.user_id])))}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={row.avatar_url || undefined} />
                    <AvatarFallback>{(row.full_name || row.username || '?').slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{row.full_name || row.username}</div>
                    <div className="text-xs text-muted-foreground">@{row.username}</div>
                  </div>
                  <span className="text-xs text-primary">Add</span>
                </button>
              ))}
            </div>
          )}
          {ids.length > 0 && (
            <div className="flex flex-wrap gap-2" aria-label="Selected user IDs">
              {ids.map((id) => (
                <Badge key={id} variant="secondary" className="flex items-center gap-1">
                  {id}
                  <button
                    type="button"
                    aria-label={`Remove ${id}`}
                    className="ml-1 p-0.5 rounded hover:bg-muted"
                    onClick={() => removeId(id)}
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Tip: Paste comma, space, or newline separated IDs. Press Enter to add.
          </p>
          {error && (
            <div role="status" aria-live="polite" className="text-xs text-red-600">{error}</div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={ids.length === 0}>
            <UserPlus className="h-4 w-4 mr-2" /> Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
