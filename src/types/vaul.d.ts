declare module 'vaul' {
  import * as React from 'react'
  type BaseProps = {
    className?: string
    children?: React.ReactNode
    style?: React.CSSProperties
  } & Record<string, unknown>
  export const Drawer: {
    Root: React.ComponentType<BaseProps>
    Trigger: React.ComponentType<BaseProps>
    Portal: React.ComponentType<BaseProps>
    Close: React.ComponentType<BaseProps>
    Overlay: React.ComponentType<BaseProps>
    Content: React.ComponentType<BaseProps>
    Title: React.ComponentType<BaseProps>
    Description: React.ComponentType<BaseProps>
  }
}
