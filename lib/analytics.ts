export type AnalyticsEvent = {
  name: string
  timestamp?: number
  userId?: string | null
  properties?: Record<string, unknown>
}

const ANALYTICS_URL = process.env.NEXT_PUBLIC_ANALYTICS_URL

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  try {
    if (!ANALYTICS_URL) return
    const payload = {
      name: event.name,
      timestamp: event.timestamp ?? Date.now(),
      userId: event.userId ?? null,
      properties: event.properties ?? {},
    }
    await fetch(ANALYTICS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch {
    // best-effort only; swallow errors
  }
}
