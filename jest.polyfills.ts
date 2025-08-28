// Polyfills that must load before any test framework or modules

// TextEncoder/TextDecoder for libraries (e.g., MSW interceptors) that expect them in Node/JSDOM
// @ts-ignore
if (typeof (global as any).TextEncoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TextEncoder } = require('util')
  // @ts-ignore
  ;(global as any).TextEncoder = TextEncoder
}
// @ts-ignore
if (typeof (global as any).TextDecoder === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { TextDecoder } = require('util')
  // @ts-ignore
  ;(global as any).TextDecoder = TextDecoder
}

// Ensure Supabase env vars exist for tests before any modules import the client
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
}

// Provide Web Streams polyfills used by MSW in Node/JSDOM
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const webStreams = require('stream/web')
  // @ts-ignore
  if (typeof (global as any).TransformStream === 'undefined' && webStreams?.TransformStream) {
    // @ts-ignore
    ;(global as any).TransformStream = webStreams.TransformStream
  }
  // @ts-ignore
  if (typeof (global as any).ReadableStream === 'undefined' && webStreams?.ReadableStream) {
    // @ts-ignore
    ;(global as any).ReadableStream = webStreams.ReadableStream
  }
  // @ts-ignore
  if (typeof (global as any).WritableStream === 'undefined' && webStreams?.WritableStream) {
    // @ts-ignore
    ;(global as any).WritableStream = webStreams.WritableStream
  }
} catch {}

// Ensure fetch API classes exist on global for modules that reference them at import time
// Next's next/server defines classes extending global Request/Response during import
// which can fail if not set up first in JSDOM.
// @ts-ignore
if (typeof globalThis.Request === 'undefined' && typeof window !== 'undefined') {
  // @ts-ignore
  globalThis.Request = (window as any).Request
}
// @ts-ignore
if (typeof globalThis.Response === 'undefined' && typeof window !== 'undefined') {
  // @ts-ignore
  globalThis.Response = (window as any).Response
}
// @ts-ignore
if (typeof globalThis.Headers === 'undefined' && typeof window !== 'undefined') {
  // @ts-ignore
  globalThis.Headers = (window as any).Headers
}

// Add static Response.json if missing (NextResponse.json relies on it)
// @ts-ignore
if (typeof globalThis.Response !== 'undefined' && typeof (globalThis.Response as any).json !== 'function') {
  // @ts-ignore
  ;(globalThis.Response as any).json = (data: any, init?: ResponseInit) => {
    const headers = new Headers(init?.headers || {})
    if (!headers.has('content-type')) headers.set('content-type', 'application/json')
    return new Response(JSON.stringify(data), { ...init, headers })
  }
}

// Polyfill ResizeObserver for Radix UI components in tests
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
if (typeof (global as any).ResizeObserver === 'undefined') {
  // @ts-ignore
  ;(global as any).ResizeObserver = MockResizeObserver
}

// Basic BroadcastChannel polyfill used by MSW's ws module
// @ts-ignore
if (typeof (global as any).BroadcastChannel === 'undefined') {
  class MockBroadcastChannel {
    name: string
    onmessage: ((this: BroadcastChannel, ev: MessageEvent) => any) | null = null
    constructor(name: string) {
      this.name = name
    }
    postMessage(_msg: any) {}
    close() {}
    addEventListener(_type: string, _listener: any) {}
    removeEventListener(_type: string, _listener: any) {}
    dispatchEvent(_event: any) { return true }
  }
  // @ts-ignore
  ;(global as any).BroadcastChannel = MockBroadcastChannel as any
}
