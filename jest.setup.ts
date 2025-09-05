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

// MSW: set up conditionally to avoid hard failure if subpath exports are unavailable
// in certain package manager or Node environments. We'll require at runtime.
let __mswServer: { listen: () => void; resetHandlers: () => void; close: () => void } | null = null
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { setupServer } = require('msw/node')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { handlers } = require('./__tests__/msw/handlers')
  __mswServer = setupServer(...handlers)
} catch (err) {
  // eslint-disable-next-line no-console
  console.warn('[jest.setup] MSW not available, continuing without request interception')
}

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
if (__mswServer) {
  beforeAll(() => __mswServer!.listen())
  afterEach(() => __mswServer!.resetHandlers())
  afterAll(() => __mswServer!.close())
}

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

// Mock CreditsPopover to avoid act() warnings from fetch calls
jest.mock('@/components/credits/CreditsPopover', () => {
  const React = require('react') as typeof import('react')
  return {
    CreditsPopover: () => React.createElement('div', { 
      'data-testid': 'credits-popover-mock',
      'aria-label': 'Credits'
    }, React.createElement('span', null, '42'))
  }
})

// Mock ESM-only modules that Jest struggles to transform from node_modules
// react-markdown: simple passthrough that renders children
jest.mock('react-markdown', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react') as typeof import('react')
  return {
    __esModule: true,
    default: ({ children }: { children: any }) =>
      React.createElement('div', { 'data-testid': 'react-markdown-mock' }, children),
  }
})

// react-resizable-panels: pass-through wrappers so layout renders in tests
jest.mock('react-resizable-panels', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react') as typeof import('react')
  const PassThrough = ({ children, ...props }: any) => React.createElement('div', props, children)
  return {
    __esModule: true,
    PanelGroup: PassThrough,
    Panel: PassThrough,
    PanelResizeHandle: PassThrough,
  }
})

// react-syntax-highlighter and its styles: provide minimal mocks
jest.mock('react-syntax-highlighter', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react') as typeof import('react')
  return {
    __esModule: true,
    Prism: ({ children }: any) => React.createElement('pre', { 'data-testid': 'syntax-highlighter-mock' }, children),
  }
})

jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  __esModule: true,
  oneDark: {},
}))
