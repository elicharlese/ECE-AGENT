"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  const isDark = (resolvedTheme ?? theme) === "dark"
  const toggle = () => setTheme(isDark ? "light" : "dark")

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggle}
      className="h-9 w-9 border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-900/70 backdrop-blur hover:bg-white dark:hover:bg-gray-800"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
