"use client"

import dynamic from "next/dynamic"
import { useEffect } from "react"

const ChatApp = dynamic(() => import("@/components/layout/ChatApp").then(m => m.ChatApp), {
  ssr: false,
  loading: () => (
    <div className="h-screen flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      Loading chat...
    </div>
  ),
})

export function ClientChatApp() {
  useEffect(() => {
    try {
      performance.mark('hydration-complete')
      // Keep console noise minimal in production; still useful for lab checks.
      if (process.env.NODE_ENV !== 'production') {
        const mark = performance.getEntriesByName('hydration-complete')[0]
        // mark.startTime is ms since timeOrigin (navigationStart equivalent)
        console.debug('[perf] hydration-complete ms=', mark?.startTime?.toFixed?.(1))
      }
    } catch (_) { /* no-op */ }
  }, [])
  return <ChatApp />
}
