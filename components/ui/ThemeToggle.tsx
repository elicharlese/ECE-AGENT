"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

import { Button } from '@/libs/design-system'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" aria-label="Toggle theme" title="Theme">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const isDark = theme === "dark"
  const icon = isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />

  const handleClick = () => setTheme(isDark ? "light" : "dark")

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label="Theme"
      title="Theme"
      className="bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 hover:bg-white/20 dark:hover:bg-slate-700/50"
      onClick={handleClick}
    >
      {icon}
    </Button>
  )
}
