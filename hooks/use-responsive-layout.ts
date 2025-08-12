"use client"

import { useState, useEffect } from "react"

export type ScreenSize = "mobile" | "tablet" | "desktop" | "wide"

export function useResponsiveLayout() {
  const [screenSize, setScreenSize] = useState<ScreenSize>("desktop")
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape")

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Determine screen size
      if (width < 768) {
        setScreenSize("mobile")
      } else if (width < 1024) {
        setScreenSize("tablet")
      } else if (width < 1440) {
        setScreenSize("desktop")
      } else {
        setScreenSize("wide")
      }

      // Determine orientation
      setOrientation(width > height ? "landscape" : "portrait")
    }

    updateLayout()
    window.addEventListener("resize", updateLayout)
    window.addEventListener("orientationchange", updateLayout)

    return () => {
      window.removeEventListener("resize", updateLayout)
      window.removeEventListener("orientationchange", updateLayout)
    }
  }, [])

  const isMobile = screenSize === "mobile"
  const isTablet = screenSize === "tablet"
  const isDesktop = screenSize === "desktop" || screenSize === "wide"
  const canShowDualSidebars = screenSize === "wide" || (screenSize === "desktop" && orientation === "landscape")
  const shouldCollapseSidebars = screenSize === "mobile" || (screenSize === "tablet" && orientation === "portrait")

  return {
    screenSize,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    canShowDualSidebars,
    shouldCollapseSidebars,
  }
}
