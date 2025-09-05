"use client"

import { Button } from "@/components/ui/button"
import { Menu, X, ChevronLeft, ChevronRight, Minimize2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface HamburgerMenuProps {
  panelState: "expanded" | "minimized" | "collapsed"
  onToggle: () => void
  side: "left" | "right"
  className?: string
}

export function HamburgerMenu({ panelState, onToggle, side, className }: HamburgerMenuProps) {
  const getIcon = () => {
    if (panelState === "collapsed") {
      return side === "left" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
    }
    if (panelState === "minimized") {
      return <Menu className="h-4 w-4" />
    }
    return <X className="h-4 w-4" />
  }

  const getTooltip = () => {
    if (panelState === "collapsed") {
      return `Show ${side} sidebar`
    }
    if (panelState === "minimized") {
      return `Expand ${side} sidebar`
    }
    return `Hide ${side} sidebar`
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={cn(
        "h-10 w-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
        "border border-gray-200 dark:border-gray-700",
        "hover:bg-white dark:hover:bg-gray-800",
        "shadow-lg transition-all duration-200",
        className
      )}
      title={getTooltip()}
    >
      {getIcon()}
    </Button>
  )
}
