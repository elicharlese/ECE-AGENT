import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Polyfill TextEncoder/TextDecoder for libraries expecting them in JSDOM/Node
// Must be before importing MSW server
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

import { server } from './__tests__/msw/server'

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

// Polyfill scrollIntoView for JSDOM elements used in tests
// @ts-ignore
if (typeof window !== 'undefined') {
  const proto = (window.HTMLElement && window.HTMLElement.prototype) || undefined
  // @ts-ignore
  if (proto && typeof proto.scrollIntoView !== 'function') {
    // @ts-ignore
    proto.scrollIntoView = function (_options?: ScrollIntoViewOptions) { /* no-op for tests */ }
  }
}

// Start MSW before all tests, reset after each, and close after all
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock 'vaul' drawer primitives used by components/ui/drawer.tsx so tests
// don't require the real dependency or DOM behaviors.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('vaul', () => {
  // Use require to avoid ESM interop issues in Jest
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react') as typeof import('react')
  const passthrough = (tag: any) => (props: any) => React.createElement(tag || 'div', props)
  return {
    Drawer: {
      Root: passthrough('div'),
      Trigger: passthrough('button'),
      Portal: passthrough('div'),
      Close: passthrough('button'),
      Overlay: passthrough('div'),
      Content: passthrough('div'),
      Title: passthrough('div'),
      Description: passthrough('div'),
    },
  }
}, { virtual: true })
