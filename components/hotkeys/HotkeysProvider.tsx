"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useHotkeys } from "@/hooks/use-hotkeys"
import { CommandPalette } from "./CommandPalette"
import { ShortcutsHelp } from "./ShortcutsHelp"
import { QuickInvite } from "./QuickInvite"

function isEditableTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName?.toLowerCase()
  const isContentEditable = el.isContentEditable
  return (
    isContentEditable || tag === "input" || tag === "textarea" || tag === "select" || el.getAttribute?.("role") === "textbox"
  )
}

export type HotkeysProviderProps = {
  children: React.ReactNode
}

export function HotkeysProvider({ children }: HotkeysProviderProps) {
  const router = useRouter()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  // Simple combos (Cmd/Ctrl+K, Shift+?)
  useHotkeys([
    {
      combo: "meta+k",
      preventDefault: true,
      onTrigger: () => setPaletteOpen((v) => !v),
      enableInInputs: false,
    },
    {
      combo: "ctrl+k",
      preventDefault: true,
      onTrigger: () => setPaletteOpen((v) => !v),
      enableInInputs: false,
    },
    {
      combo: "shift+?",
      preventDefault: true,
      onTrigger: () => setHelpOpen((v) => !v),
      enableInInputs: false,
    },
    {
      combo: "meta+n",
      preventDefault: true,
      onTrigger: () => setInviteOpen(true),
      enableInInputs: false,
    },
    {
      combo: "ctrl+n",
      preventDefault: true,
      onTrigger: () => setInviteOpen(true),
      enableInInputs: false,
    },
  ])

  // Sequences: g m -> /messages, g h -> /
  const seqRef = useRef<string[]>([])
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const reset = () => {
      seqRef.current = []
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
    const armTimeout = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(reset, 800)
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (isEditableTarget(ev.target)) return
      // ignore if any modifier pressed
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return
      const key = ev.key.toLowerCase()

      if (seqRef.current.length === 0) {
        if (key === "g") {
          seqRef.current = ["g"]
          armTimeout()
          ev.preventDefault()
        }
        return
      }

      if (seqRef.current.length === 1 && seqRef.current[0] === "g") {
        if (key === "m") {
          ev.preventDefault()
          reset()
          router.push("/messages")
          return
        }
        if (key === "h") {
          ev.preventDefault()
          reset()
          router.push("/")
          return
        }
        if (key === "n") {
          ev.preventDefault()
          reset()
          setInviteOpen(true)
          return
        }
        // anything else cancels
        reset()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [router])

  return (
    <>
      {children}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <ShortcutsHelp open={helpOpen} onOpenChange={setHelpOpen} />
      <QuickInvite open={inviteOpen} onOpenChange={setInviteOpen} />
    </>
  )
}
