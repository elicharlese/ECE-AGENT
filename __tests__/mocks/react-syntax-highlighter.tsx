import React from 'react'

export const Prism: React.FC<React.PropsWithChildren<{ language?: string; style?: any; customStyle?: React.CSSProperties; wrapLongLines?: boolean }>> = ({ children, ...props }) => (
  <pre data-testid="syntax-highlighter-mock" {...props}>{children}</pre>
)
