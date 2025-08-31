"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"

export type HeadsetItem = {
  id: string
  content: string
  timestamp: Date
  isOwn: boolean
}

export type Headset3DViewProps = {
  items: HeadsetItem[]
}

// Lightweight CSS 3D view to avoid heavy deps; future patches can swap to r3f/three
export function Headset3DView({ items }: Headset3DViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: -8, y: 20 })
  const [dragging, setDragging] = useState(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const rotationRef = useRef<{ x: number; y: number }>(rotation)
  const rafId = useRef<number | null>(null)
  const pendingDelta = useRef<{ dx: number; dy: number } | null>(null)
  const [radius, setRadius] = useState<number>(420)

  const visible = useMemo(() => items.slice(-24), [items])

  // Keep ref in sync
  useEffect(() => {
    rotationRef.current = rotation
  }, [rotation])

  // Responsive radius based on container size
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect
      if (!cr) return
      const size = Math.min(cr.width, cr.height)
      // Clamp for readability; larger containers get a larger circle but bounded
      const r = Math.max(220, Math.min(520, Math.floor(size / 2.6)))
      setRadius(r)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDragging(true)
    lastPos.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging || !lastPos.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    // Accumulate deltas and apply via rAF for smoother updates
    const prev = pendingDelta.current
    pendingDelta.current = {
      dx: (prev?.dx || 0) + dx,
      dy: (prev?.dy || 0) + dy,
    }
    if (rafId.current == null) {
      rafId.current = requestAnimationFrame(() => {
        rafId.current = null
        const delta = pendingDelta.current
        pendingDelta.current = null
        if (!delta) return
        const cur = rotationRef.current
        const nextX = Math.max(-45, Math.min(45, cur.x - delta.dy * 0.15))
        const nextY = cur.y + delta.dx * 0.2
        setRotation({ x: nextX, y: nextY })
      })
    }
  }
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    setDragging(false)
    lastPos.current = null
    ;(e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId)
  }
  const onPointerLeave: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging) return
    onPointerUp(e)
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    let handled = true
    const step = 4
    if (e.key === 'ArrowLeft') {
      setRotation((r) => ({ ...r, y: r.y - step }))
    } else if (e.key === 'ArrowRight') {
      setRotation((r) => ({ ...r, y: r.y + step }))
    } else if (e.key === 'ArrowUp') {
      setRotation((r) => ({ ...r, x: Math.max(-45, r.x - step) }))
    } else if (e.key === 'ArrowDown') {
      setRotation((r) => ({ ...r, x: Math.min(45, r.x + step) }))
    } else {
      handled = false
    }
    if (handled) e.preventDefault()
  }

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="absolute inset-0 perspective-[1000px] overflow-hidden" ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
        aria-label="3D Headset Chat Space"
        role="region"
        aria-roledescription="3D immersive chat space"
        aria-describedby="immersive-3d-instructions"
        aria-keyshortcuts="ArrowLeft, ArrowRight, ArrowUp, ArrowDown"
        tabIndex={0}
      >
        <div
          className="absolute left-1/2 top-1/2 origin-center will-change-transform"
          style={{
            transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          {visible.map((item, idx) => {
            const angle = (idx / visible.length) * Math.PI * 2
            const x = Math.sin(angle) * radius
            const z = Math.cos(angle) * radius
            const rotY = (angle * 180) / Math.PI
            return (
              <div
                key={item.id}
                className="absolute w-64 h-40 p-3 rounded-lg shadow-lg border border-white/10"
                style={{
                  transformStyle: "preserve-3d",
                  transform: `translate3d(${x}px, ${Math.sin(angle * 2) * 30}px, ${z}px) rotateY(${rotY}deg)`,
                  background: item.isOwn ? "linear-gradient(135deg, #1f2937, #374151)" : "linear-gradient(135deg, #111827, #1f2937)",
                }}
                title={item.content.slice(0, 60)}
                aria-label={`Message card ${idx + 1}`}
              >
                <div className="text-[10px] opacity-70">{item.timestamp.toLocaleString()}</div>
                <div className="text-xs mt-1 line-clamp-5 break-words">
                  {item.content}
                </div>
                <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-lg" style={{ transform: "translateZ(1px)" }} />
              </div>
            )
          })}
        </div>

        {/* HUD */}
        <div id="immersive-3d-instructions" className="absolute left-1/2 -translate-x-1/2 bottom-4 text-[11px] text-gray-300/90">
          Drag (mouse) or use arrow keys to rotate. Press the Headset button again to exit.
        </div>
      </div>
    </div>
  )
}
