"use client"

import { useEffect, useState } from "react"

export function useMobileKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleResize = () => {
      // Detect keyboard on mobile by checking viewport height changes
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.screen.height

      // If viewport is significantly smaller than screen, keyboard is likely open
      const heightDifference = windowHeight - viewportHeight
      const isOpen = heightDifference > 150 // Threshold for keyboard detection

      setIsKeyboardOpen(isOpen)
      setKeyboardHeight(isOpen ? heightDifference : 0)

      // Adjust body padding to account for keyboard
      if (isOpen) {
        document.body.style.paddingBottom = `${heightDifference}px`
      } else {
        document.body.style.paddingBottom = "0"
      }
    }

    // Listen for viewport changes (more reliable than resize on mobile)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize)
    } else {
      window.addEventListener("resize", handleResize)
    }

    // Initial check
    handleResize()

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize)
      } else {
        window.removeEventListener("resize", handleResize)
      }
      document.body.style.paddingBottom = "0"
    }
  }, [])

  return { isKeyboardOpen, keyboardHeight }
}
