"use client"

import React, { createContext, useContext, useState, useMemo } from 'react'

export type Density = 'compact' | 'comfortable' | 'airy'

interface DensityContextValue {
  density: Density
  setDensity: (d: Density) => void
}

const DensityContext = createContext<DensityContextValue | undefined>(undefined)

export function DensityProvider({ children, defaultDensity = 'comfortable' as Density }: { children: React.ReactNode; defaultDensity?: Density }) {
  const [density, setDensity] = useState<Density>(defaultDensity)

  const value = useMemo(() => ({ density, setDensity }), [density])

  return (
    <DensityContext.Provider value={value}>
      {children}
    </DensityContext.Provider>
  )
}

export function useDensity(): DensityContextValue {
  const ctx = useContext(DensityContext)
  if (!ctx) throw new Error('useDensity must be used within a DensityProvider')
  return ctx
}
