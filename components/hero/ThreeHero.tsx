"use client"

import type * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export type ThreeHeroProps = {
  className?: string
}

// A lightweight, code‑only Three.js hero:
// - Particle "chat stream" rises upward
// - Orbiting "agent" nodes circle the center
// - Subtle camera parallax on pointer movement
export function ThreeHero({ className }: ThreeHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    let raf = 0
    let paused = false

    // Lazy import three to avoid SSR issues
    const start = async () => {
      const THREE = await import('three')
      if (!mounted || !containerRef.current) return

      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
      renderer.setSize(width, height)
      renderer.outputColorSpace = THREE.SRGBColorSpace
      container.appendChild(renderer.domElement)

      // Scene & Camera
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
      camera.position.set(0, 1.5, 6)

      // Lights
      const light1 = new THREE.DirectionalLight(0xffffff, 0.8)
      light1.position.set(5, 8, 5)
      scene.add(light1)
      const light2 = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(light2)

      // Theme-aware colors
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const prefersReducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      const chatBg = new THREE.Color(isDark ? 0x312e81 : 0xe0e7ff) // indigo-900 / indigo-100
      const phoneBg = new THREE.Color(isDark ? 0x064e3b : 0xd1fae5) // emerald-900 / emerald-100
      const videoBg = new THREE.Color(isDark ? 0x7f1d1d : 0xfee2e2) // rose-900 / rose-100

      // (Particles and orbiting red spheres removed)

      // Chat/Phone/Video icons (emoji sprites) + connecting lines
      const channelsGroup = new THREE.Group()
      scene.add(channelsGroup)

      const makeIconSprite = (label: string, emoji: string, bg: THREE.Color, fg: string) => {
        const size = 128
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        // BG rounded chip
        const r = 28
        ctx.fillStyle = `#${bg.getHexString()}`
        ctx.beginPath()
        ctx.moveTo(16 + r, 16)
        ctx.arcTo(size - 16, 16, size - 16, size - 16, r)
        ctx.arcTo(size - 16, size - 16, 16, size - 16, r)
        ctx.arcTo(16, size - 16, 16, 16, r)
        ctx.arcTo(16, 16, size - 16, 16, r)
        ctx.closePath()
        ctx.fill()
        // Emoji
        ctx.font = '72px system-ui, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(emoji, size / 2, size / 2 + 4)
        // Label
        ctx.font = 'bold 20px system-ui, -apple-system, Segoe UI, Roboto'
        ctx.fillStyle = fg
        ctx.fillText(label, size / 2, size - 20)
        const texture = new THREE.CanvasTexture(canvas)
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy())
        const mat = new THREE.SpriteMaterial({ map: texture, transparent: true })
        const sprite = new THREE.Sprite(mat)
        sprite.scale.set(0.9, 0.9, 0.9)
        return { sprite, texture, mat }
      }

      const icons: THREE.Sprite[] = []
      const iconAssets: { sprite: THREE.Sprite; texture: THREE.Texture; mat: THREE.SpriteMaterial }[] = []
      const CHAT = makeIconSprite('Chat', '💬', chatBg, isDark ? '#e0e7ff' : '#1e293b')
      const PHONE = makeIconSprite('Voice', '📞', phoneBg, isDark ? '#d1fae5' : '#0f172a')
      const VIDEO = makeIconSprite('Video', '🎥', videoBg, isDark ? '#fee2e2' : '#0f172a')
      ;[CHAT, PHONE, VIDEO].forEach((a) => {
        channelsGroup.add(a.sprite)
        icons.push(a.sprite)
        iconAssets.push(a)
      })

      const iconOffsets = [0, 2, 4]
      const iconRadius = prefersReducedMotion ? 1.9 : 2.2
      const iconY = 1.15

      // Lines connecting the 3 icons (triangle)
      const lineMat = new THREE.LineBasicMaterial({ color: isDark ? 0x94a3b8 : 0x334155, transparent: true, opacity: 0.4 })
      const lineGeom = new THREE.BufferGeometry()
      lineGeom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 2 * 3), 3))
      const lines = new THREE.LineSegments(lineGeom, lineMat)
      channelsGroup.add(lines)

      let t = 0
      const pointer = { x: 0, y: 0 }
      const pointerN = new THREE.Vector2(0, 0)
      const raycaster = new THREE.Raycaster()
      const onPointerMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width
        const py = (e.clientY - rect.top) / rect.height
        pointer.x = px - 0.5
        pointer.y = py - 0.5
        pointerN.set(px * 2 - 1, -(py * 2 - 1))
      }
      container.addEventListener('mousemove', onPointerMove)

      // Click routing for icons
      const onClick = () => {
        raycaster.setFromCamera(pointerN, camera)
        const hits = raycaster.intersectObjects(icons, false)
        if (!hits.length) return
        const target = hits[0].object
        const idx = icons.findIndex((s) => s === target)
        if (idx === 0) router.push('/messages')
        else if (idx === 1) router.push('/messages?mode=voice')
        else if (idx === 2) router.push('/messages?mode=video')
      }
      container.addEventListener('click', onClick)

      const resize = () => {
        const w = container.clientWidth
        const h = container.clientHeight
        renderer.setSize(w, h)
        camera.aspect = w / h
        camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', resize)

      const animate = () => {
        if (paused) return
        // Camera parallax
        camera.position.x += ((pointer.x * 1.2) - camera.position.x) * 0.05
        camera.position.y += ((1.2 - pointer.y * 1.0) - camera.position.y) * 0.05
        camera.lookAt(0, 0.8, 0)

        // Advance time
        t += prefersReducedMotion ? 0.006 : 0.01

        // Position icons in a ring + bobbing
        const iconAngleStep = (Math.PI * 2) / 3
        for (let i = 0; i < 3; i++) {
          const spr = icons[i]
          const ang = (t * (prefersReducedMotion ? 0.2 : 0.3)) + i * iconAngleStep
          spr.position.set(
            Math.cos(ang) * iconRadius,
            iconY + Math.sin(t * (prefersReducedMotion ? 1.0 : 1.3) + iconOffsets[i]) * 0.12,
            Math.sin(ang) * iconRadius
          )
          spr.scale.setScalar(0.9)
        }

        // Update connecting lines (triangle: 0-1, 1-2, 2-0)
        const lp = lineGeom.getAttribute('position') as THREE.BufferAttribute
        const p0 = icons[0].position
        const p1 = icons[1].position
        const p2 = icons[2].position
        lp.setXYZ(0, p0.x, p0.y, p0.z); lp.setXYZ(1, p1.x, p1.y, p1.z)
        lp.setXYZ(2, p1.x, p1.y, p1.z); lp.setXYZ(3, p2.x, p2.y, p2.z)
        lp.setXYZ(4, p2.x, p2.y, p2.z); lp.setXYZ(5, p0.x, p0.y, p0.z)
        lp.needsUpdate = true

        // Hover highlight via raycaster
        raycaster.setFromCamera(pointerN, camera)
        const hits = raycaster.intersectObjects(icons, false)
        let anyHover = false
        icons.forEach((spr) => (spr.scale.setScalar(0.9)))
        if (hits.length) {
          const target = hits[0].object as THREE.Sprite
          target.scale.setScalar(1.15)
          anyHover = true
        }
        container.style.cursor = anyHover ? 'pointer' : 'default'

        renderer.render(scene, camera)
        raf = requestAnimationFrame(animate)
      }
      animate()

      // Pause on hidden tab
      const onVisibility = () => {
        if (document.hidden) {
          paused = true
          if (raf) cancelAnimationFrame(raf)
        } else {
          if (paused) {
            paused = false
            raf = requestAnimationFrame(animate)
          }
        }
      }
      document.addEventListener('visibilitychange', onVisibility)

      return () => {
        cancelAnimationFrame(raf)
        container.removeEventListener('mousemove', onPointerMove)
        container.removeEventListener('click', onClick)
        document.removeEventListener('visibilitychange', onVisibility)
        window.removeEventListener('resize', resize)
        // dispose icon assets
        iconAssets.forEach((a) => { a.texture.dispose(); a.mat.dispose() })
        lineGeom.dispose()
        lineMat.dispose()
        renderer.dispose()
        container.removeChild(renderer.domElement)
      }
    }

    const cleanup = start()

    return () => {
      mounted = false
      if (raf) cancelAnimationFrame(raf)
      void cleanup
    }
  }, [])

  return <div ref={containerRef} className={className ?? 'h-full w-full'} />
}
