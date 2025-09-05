import React from 'react'

export const PanelGroup: React.FC<React.PropsWithChildren<{ direction?: 'horizontal' | 'vertical'; className?: string }>> = ({ children, ...props }) => (
  <div data-testid="panel-group-mock" {...props}>{children}</div>
)

export const Panel: React.FC<React.PropsWithChildren<{ defaultSize?: number; minSize?: number; maxSize?: number }>> = ({ children, ...props }) => (
  <div data-testid="panel-mock" {...props}>{children}</div>
)

export const PanelResizeHandle: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, ...props }) => (
  <div data-testid="panel-resize-handle-mock" {...props}>{children}</div>
)
