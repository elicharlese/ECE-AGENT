"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export type ShortcutsHelpProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export function ShortcutsHelp({ open, onOpenChange }: ShortcutsHelpProps) {
  const items = [
    { keys: ["⌘K", "Ctrl+K"], desc: "Open Command Palette" },
    { keys: ["?"], desc: "Show keyboard shortcuts" },
    { keys: ["g", "m"], desc: "Go to Messages" },
    { keys: ["g", "h"], desc: "Go to Home" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">{it.desc}</div>
              <div className="flex items-center gap-1">
                {it.keys.map((k, i) => (
                  <kbd
                    key={i}
                    className="rounded border px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )}
