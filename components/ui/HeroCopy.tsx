import Link from 'next/link'
import React from 'react'
import { Zap } from 'lucide-react'
import { GradientText } from './GradientText'
import { TrustLogos } from './TrustLogos'
import { AnimatedButton } from './AnimatedButton'
import { DownloadButtons } from '@/components/ui/DownloadButtons'

export type HeroCopyProps = {
  className?: string
}

export function HeroCopy({ className }: HeroCopyProps) {
  return (
    <div className={className}>
      <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-900 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-100">
        <Zap className="h-3.5 w-3.5" /> Realtime • Secure • Multi‑agent
      </span>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-300">
        The Complete <GradientText>web3</GradientText> development framework.
      </h1>
      <p className="mt-4 max-w-2xl text-base text-slate-700 dark:text-slate-200 sm:text-lg animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-500">
        Everything you need to connect your apps to decentralized networks and AI‑powered agents.
      </p>
      <div className="mt-6 flex flex-col items-start gap-3 sm:mt-8 sm:flex-row sm:items-center animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-700">
        <AnimatedButton
          href="/auth"
          variant="primary"
          aria-label="Get started"
          className="pointer-events-auto"
        >
          Get Started
        </AnimatedButton>
        <AnimatedButton
          href="/messages"
          variant="secondary"
          aria-label="Open messages"
          className="pointer-events-auto"
        >
          Explore Messages
        </AnimatedButton>
      </div>
      <DownloadButtons className="animate-in slide-in-from-bottom-4 fade-in duration-1000 delay-900" />
      <div className="mt-8 lg:mt-10">
        <TrustLogos />
      </div>
    </div>
  )
}

// no default export
