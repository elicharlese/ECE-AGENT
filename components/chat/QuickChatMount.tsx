"use client"

import React, { useEffect, useState } from "react"
import { MiniChatWidget } from "@/components/chat/MiniChatWidget"
import { useHotkeys } from "@/hooks/use-hotkeys"

// Global mount for the Apple‑style quick chat bar
// Keeps UI consistent across routes and platforms (web/electron)
// Adds imperative commands to show/hide via window.quickChat or CustomEvents
export function QuickChatMount() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onShow = () => setVisible(true)
    const onHide = () => setVisible(false)
    const onToggle = () => setVisible((v) => !v)

    // CustomEvent interface
    const showListener = () => onShow()
    const hideListener = () => onHide()
    const toggleListener = () => onToggle()

    window.addEventListener("quickchat:show", showListener as EventListener)
    window.addEventListener("quickchat:hide", hideListener as EventListener)
    window.addEventListener("quickchat:toggle", toggleListener as EventListener)

    // Imperative API (merge to avoid clobbering methods added by other components)
    const existing = (window as any).quickChat || {}
    ;(window as any).quickChat = {
      ...existing,
      show: onShow,
      hide: onHide,
      toggle: onToggle,
    }

    return () => {
      window.removeEventListener("quickchat:show", showListener as EventListener)
      window.removeEventListener("quickchat:hide", hideListener as EventListener)
      window.removeEventListener("quickchat:toggle", toggleListener as EventListener)
      try {
        const qc = (window as any).quickChat || {}
        if (qc) {
          delete qc.show
          delete qc.hide
          delete qc.toggle
          // If object has no own keys left, remove it entirely
          if (Object.keys(qc).length === 0) {
            delete (window as any).quickChat
          } else {
            ;(window as any).quickChat = qc
          }
        }
      } catch {}
    }
  }, [])

  // Global hotkeys: show if hidden (focus bar), otherwise hide entirely
  useHotkeys([
    {
      combo: "meta+q",
      preventDefault: true,
      enableInInputs: true,
      onTrigger: () => {
        if (!visible) {
          setVisible(true)
          // ensure bar mode + focus input
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("quickchat:minimize"))
            window.dispatchEvent(new CustomEvent("quickchat:focus-input"))
          }, 0)
        } else {
          setVisible(false)
        }
      },
    },
    {
      combo: "ctrl+q",
      preventDefault: true,
      enableInInputs: true,
      onTrigger: () => {
        if (!visible) {
          setVisible(true)
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("quickchat:minimize"))
            window.dispatchEvent(new CustomEvent("quickchat:focus-input"))
          }, 0)
        } else {
          setVisible(false)
        }
      },
    },
  ])

  if (!visible) return null
  return <MiniChatWidget title="Quick Chat" initialMinimized={true} />
}
