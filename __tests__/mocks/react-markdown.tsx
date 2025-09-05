import React from 'react'

export default function ReactMarkdownMock({ children }: { children: React.ReactNode; components?: any }) {
  return <div data-testid="react-markdown-mock">{children}</div>
}
