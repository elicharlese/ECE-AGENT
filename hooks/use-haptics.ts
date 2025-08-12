"use client"

import { useCallback } from "react"

type HapticType = "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error"

export function useHaptics() {
  const triggerHaptic = useCallback((type: HapticType = "light") => {
    // Check if device supports haptics
    if (typeof window !== "undefined" && "navigator" in window) {
      // Modern Haptic API
      if ("vibrate" in navigator) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
          selection: [5],
          success: [10, 50, 10],
          warning: [20, 100, 20],
          error: [50, 100, 50],
        }
        navigator.vibrate(patterns[type])
      }

      // iOS Haptic Feedback (if available)
      if ("hapticFeedback" in window) {
        const hapticTypes = {
          light: "impactLight",
          medium: "impactMedium",
          heavy: "impactHeavy",
          selection: "selectionChanged",
          success: "notificationSuccess",
          warning: "notificationWarning",
          error: "notificationError",
        }
        // @ts-ignore - iOS specific API
        window.hapticFeedback?.(hapticTypes[type])
      }
    }
  }, [])

  return { triggerHaptic }
}
