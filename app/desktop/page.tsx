"use client"

import React from 'react'
import { Card, Button } from '@/libs/design-system'
import { Download, Monitor, Zap, Shield, Palette, Clock, ExternalLink } from 'lucide-react'

export default function DesktopPage() {
  const githubReleasesUrl = 'https://github.com/elicharlese/AGENT/releases'

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-[#FAFAFA] dark:bg-slate-900">
      {/* Background stack */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 -z-10" />

      {/* Theme toggle */}
      <div className="pointer-events-auto absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <Button variant="ghost" size="sm">Theme</Button>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:py-24 lg:py-28 xl:py-36">
        <div className="text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium text-slate-900 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200">
            Don&apos;t miss the launch! Get notified when desktop apps are available.
          </span>

          {/* Title */}
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            AGENT Desktop
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl mx-auto text-base text-slate-700 dark:text-slate-200 sm:text-lg">
            Experience Cascade&apos;s AI-powered conversations in a native desktop environment. Built with Electron for seamless performance across all platforms.
          </p>

          {/* Coming Soon Notice */}
          <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Desktop Apps Coming Soon</h3>
            </div>
            <p className="text-blue-800 dark:text-blue-200 mb-4">
              We&apos;re working hard to bring you native desktop applications for macOS, Windows, and Linux.
              In the meantime, you can use AGENT through our web interface.
            </p>
            <Button
              href={githubReleasesUrl}
              variant="primary"
              aria-label="View GitHub Releases"
              className="pointer-events-auto flex items-center gap-2 mx-auto"
            >
              <ExternalLink className="h-4 w-4" />
              View Latest Release
            </Button>
          </div>

          {/* Current Release Info */}
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Latest Release: v0.1.1</h3>
            <p className="text-green-800 dark:text-green-200 text-sm mb-4">
              Features: Global keyboard shortcuts, MCP GitHub proxy, LiveKit integration, Solana wallet linking, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                href="https://github.com/elicharlese/AGENT/releases/download/v0.1.1/source.zip"
                variant="secondary"
                aria-label="Download Source Code (ZIP)"
                className="pointer-events-auto flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Source Code (ZIP)
              </Button>
              <Button
                href="https://github.com/elicharlese/AGENT/releases/download/v0.1.1/source.tar.gz"
                variant="secondary"
                aria-label="Download Source Code (TAR.GZ)"
                className="pointer-events-auto flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Source Code (TAR.GZ)
              </Button>
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Lightning Fast</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Native performance with Electron&apos;s Chromium engine for instant responsiveness.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Secure & Private</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              End-to-end encryption and local data storage for maximum privacy and security.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Palette className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Beautiful Design</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Stunning UI with dark/light themes and smooth animations for an exceptional experience.
            </p>
          </Card>
        </div>

        {/* System requirements */}
        <div className="mt-16">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">System Requirements</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">macOS</h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• macOS 10.15 or later</li>
                  <li>• Intel or Apple Silicon</li>
                  <li>• 100MB free disk space</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Windows</h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Windows 10 or later</li>
                  <li>• 64-bit processor</li>
                  <li>• 100MB free disk space</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Linux</h3>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Ubuntu 18.04 or later</li>
                  <li>• 64-bit processor</li>
                  <li>• 100MB free disk space</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Button
            href="/"
            variant="secondary"
            aria-label="Back to home"
            className="pointer-events-auto"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
