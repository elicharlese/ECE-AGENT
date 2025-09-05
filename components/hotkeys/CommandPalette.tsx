"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/libs/design-system'
import { Input } from '@/libs/design-system'

export type CommandPaletteProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const actions = [
    { id: "home", label: "Go to Home", run: () => router.push("/") },
    { id: "messages", label: "Go to Messages", run: () => router.push("/messages") },
    { id: "help", label: "Open Shortcuts Help (shift+?)", run: () => setQuery("help") },
  ]

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="px-4 pb-3">
          <Input
            autoFocus
            placeholder="Type a command..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="px-1 pb-2 max-h-72 overflow-auto">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => { a.run(); onOpenChange(false) }}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {a.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-sm text-gray-500">No results</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
