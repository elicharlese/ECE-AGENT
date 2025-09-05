import { log } from './logger'

// Core Web Vitals metric types
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  navigationType?: string
}

// Thresholds for Core Web Vitals (in milliseconds or unitless)
const VITALS_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

// Determine rating based on metric value
function getRating(metricName: keyof typeof VITALS_THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = VITALS_THRESHOLDS[metricName]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// Format metric value for display
export function formatMetricValue(name: string, value: number): string {
  switch (name) {
    case 'CLS':
      return value.toFixed(4)
    case 'FID':
    case 'FCP':
    case 'LCP':
    case 'TTFB':
      return `${Math.round(value)}ms`
    default:
      return value.toString()
  }
}

// Get color class based on rating
export function getRatingColor(rating: 'good' | 'needs-improvement' | 'poor'): string {
  switch (rating) {
    case 'good':
      return 'text-green-600 bg-green-100'
    case 'needs-improvement':
      return 'text-yellow-600 bg-yellow-100'
    case 'poor':
      return 'text-red-600 bg-red-100'
  }
}

// Report Web Vitals to analytics/monitoring
function reportWebVitals(metric: WebVitalsMetric) {
  // Log to structured logger
  log.info('Web Vitals metric', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    formattedValue: formatMetricValue(metric.name, metric.value),
    navigationType: metric.navigationType,
  })

  // In production, you might want to send this to:
  // - Google Analytics 4
  // - Vercel Analytics
  // - Custom monitoring service
  // - Performance monitoring tools like DataDog, New Relic, etc.

  // Example: Send to Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.rating,
      value: Math.round(metric.value),
      custom_map: { metric_rating: metric.rating }
    })
  }
}

// Initialize Web Vitals tracking
export function initWebVitals() {
  if (typeof window === 'undefined') return

  // Dynamically import web-vitals library
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    // Cumulative Layout Shift
    getCLS((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
        timestamp: Date.now(),
        navigationType: (metric as any).navigationType,
      }
      reportWebVitals(webVitalsMetric)
    })

    // First Input Delay
    getFID((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'FID',
        value: metric.value,
        rating: getRating('FID', metric.value),
        timestamp: Date.now(),
        navigationType: (metric as any).navigationType,
      }
      reportWebVitals(webVitalsMetric)
    })

    // First Contentful Paint
    getFCP((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
        timestamp: Date.now(),
        navigationType: (metric as any).navigationType,
      }
      reportWebVitals(webVitalsMetric)
    })

    // Largest Contentful Paint
    getLCP((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
        timestamp: Date.now(),
        navigationType: (metric as any).navigationType,
      }
      reportWebVitals(webVitalsMetric)
    })

    // Time to First Byte
    getTTFB((metric) => {
      const webVitalsMetric: WebVitalsMetric = {
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
        timestamp: Date.now(),
        navigationType: (metric as any).navigationType,
      }
      reportWebVitals(webVitalsMetric)
    })
  }).catch((error) => {
    log.error('Failed to load web-vitals library', error)
  })
}

// Hook to track Web Vitals in React components
export function useWebVitals() {
  const [metrics, setMetrics] = React.useState<WebVitalsMetric[]>([])
  const [isTracking, setIsTracking] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined' || isTracking) return

    setIsTracking(true)

    // Store metrics in component state for display
    const metricHandler = (metric: WebVitalsMetric) => {
      setMetrics(prev => {
        const existing = prev.find(m => m.name === metric.name)
        if (existing) {
          // Update existing metric
          return prev.map(m => m.name === metric.name ? metric : m)
        } else {
          // Add new metric
          return [...prev, metric]
        }
      })
    }

    // Override the report function to also update component state
    const originalReport = reportWebVitals
    const enhancedReport = (metric: WebVitalsMetric) => {
      originalReport(metric)
      metricHandler(metric)
    }

    // Temporarily replace the report function
    ;(globalThis as any).__webVitalsReport = enhancedReport

    initWebVitals()

    return () => {
      // Cleanup
      delete (globalThis as any).__webVitalsReport
    }
  }, [isTracking])

  return { metrics, isTracking }
}

// React import for the hook
import React from 'react'
