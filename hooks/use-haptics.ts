"use client"

import { useCallback } from "react"

type HapticType = "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error"

export function useHaptics() {
  const triggerHaptic = useCallback((type: HapticType = "light") => {
    // Check if device supports haptics
    if (typeof window !== "undefined" && "navigator" in window) {
      // Respect user accessibility preferences
      const prefersReducedMotion = typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // If user requests reduced motion, minimize haptic complexity/intensity
      const effectiveType: HapticType = prefersReducedMotion
        ? (type === 'error' || type === 'warning' ? 'light' : 'selection')
        : type

      // Modern Haptic API
      if ("vibrate" in navigator) {
        const patterns = {
          light: [8],
          medium: [16],
          heavy: [24],
          selection: [5],
          success: [8, 24, 8],
          warning: [12, 48, 12],
          error: [20, 60, 20],
        }
        navigator.vibrate(patterns[effectiveType])
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
        window.hapticFeedback?.(hapticTypes[effectiveType])
      }
    }
  }, [])

  return { triggerHaptic }
}
