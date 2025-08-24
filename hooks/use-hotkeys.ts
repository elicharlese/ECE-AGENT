"use client"

import { useEffect, useRef } from "react"

export type HotkeyBinding = {
  combo: string // e.g., "meta+k", "ctrl+k", "shift+?"
  onTrigger: (ev: KeyboardEvent) => void
  preventDefault?: boolean
  enableInInputs?: boolean
}

function isEditableTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName?.toLowerCase()
  const isContentEditable = el.isContentEditable
  return (
    isContentEditable ||
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    el.getAttribute?.("role") === "textbox"
  )
}

function normalizeKey(k: string) {
  const map: Record<string, string> = {
    control: "ctrl",
    command: "meta",
    cmd: "meta",
    option: "alt",
    escape: "esc",
  }
  const lower = k.toLowerCase()
  return map[lower] ?? lower
}

function eventCombo(ev: KeyboardEvent) {
  const parts: string[] = []
  if (ev.metaKey) parts.push("meta")
  if (ev.ctrlKey) parts.push("ctrl")
  if (ev.altKey) parts.push("alt")
  if (ev.shiftKey) parts.push("shift")
  const key = normalizeKey(ev.key)
  if (!["meta", "ctrl", "alt", "shift"].includes(key)) parts.push(key)
  return parts.join("+")
}

export function useHotkeys(bindings: HotkeyBinding[]) {
  const bindingsRef = useRef(bindings)
  useEffect(() => {
    bindingsRef.current = bindings
  }, [bindings])

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      const combo = eventCombo(ev)
      for (const b of bindingsRef.current) {
        if (!b.enableInInputs && isEditableTarget(ev.target)) continue
        if (combo === b.combo.toLowerCase()) {
          if (b.preventDefault) ev.preventDefault()
          b.onTrigger(ev)
          break
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
}
