interface PerformanceMetrics {
  LCP: number // Largest Contentful Paint
  FID: number // First Input Delay
  CLS: number // Cumulative Layout Shift
  FCP: number // First Contentful Paint
  TTFB: number // Time to First Byte
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Partial<PerformanceMetrics> = {}
  private reportUrl = process.env.NEXT_PUBLIC_ANALYTICS_URL

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initializeObservers() {
    // Observe LCP
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const lastEntry = entries[entries.length - 1]
          this.metrics.LCP = lastEntry.startTime
        })
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

        // Observe FID
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          if (entries.length > 0) {
            const firstInput = entries[0] as any
            this.metrics.FID = firstInput.processingStart - firstInput.startTime
          }
        })
        fidObserver.observe({ type: 'first-input', buffered: true })

        // Observe CLS
        let clsValue = 0
        const clsEntries: any[] = []
        const clsObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsEntries.push(entry)
              clsValue += (entry as any).value
            }
          }
          this.metrics.CLS = clsValue
        })
        clsObserver.observe({ type: 'layout-shift', buffered: true })

        // Observe FCP
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          for (const entry of entries) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.FCP = entry.startTime
              fcpObserver.disconnect()
            }
          }
        })
        fcpObserver.observe({ type: 'paint', buffered: true })

        // TTFB
        const navigationEntry = performance.getEntriesByType('navigation')[0] as any
        if (navigationEntry) {
          this.metrics.TTFB = navigationEntry.responseStart - navigationEntry.requestStart
        }
      } catch (e) {
        console.error('Failed to initialize performance observers:', e)
      }
    }

    // Report metrics when page is about to unload
    if ('sendBeacon' in navigator) {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.reportMetrics()
        }
      })
    }
  }

  private reportMetrics() {
    if (this.reportUrl && Object.keys(this.metrics).length > 0) {
      const data = {
        metrics: this.metrics,
        url: window.location.href,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
      }

      // Use sendBeacon for reliability
      navigator.sendBeacon(this.reportUrl, JSON.stringify(data))
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', this.metrics)
    }
  }

  // Manual tracking methods
  measureTime(label: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      console.log(`${label}: ${duration.toFixed(2)}ms`)
      return duration
    }
  }

  mark(name: string) {
    performance.mark(name)
  }

  measure(name: string, startMark: string, endMark?: string) {
    performance.measure(name, startMark, endMark)
    const measure = performance.getEntriesByName(name, 'measure')[0]
    console.log(`${name}: ${measure.duration.toFixed(2)}ms`)
    return measure.duration
  }

  getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// Utility functions for easy usage
export function measureRenderTime(componentName: string) {
  return performanceMonitor.measureTime(`Render: ${componentName}`)
}

export function trackApiCall(endpoint: string) {
  return performanceMonitor.measureTime(`API: ${endpoint}`)
}

export function reportWebVitals(metric: any) {
  const { name, value } = metric
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`Web Vital - ${name}:`, value)
  }

  // Send to analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: name,
        value,
        page: window.location.pathname,
        timestamp: Date.now(),
      }),
    }).catch(console.error)
  }
}
