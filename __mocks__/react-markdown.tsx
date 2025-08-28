import React from "react"

// Simple mock for react-markdown that just renders children
export default function ReactMarkdown({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}
