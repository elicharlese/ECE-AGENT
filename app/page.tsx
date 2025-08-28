import type { Metadata } from "next"
import { homePageMetadata } from "@/lib/seo-metadata"
import Link from "next/link"
import { ArrowRight, MessageSquare, Users, Bot, Shield } from "lucide-react"
import { FeatureCard } from "@/components/home/FeatureCard"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = homePageMetadata

export default async function HomePage() {
  // In some Next versions, cookies is a function or returns a Promise; normalize it.
  const maybeStore: any = (cookies as any)()
  const store: any = typeof maybeStore?.then === 'function' ? await maybeStore : maybeStore

  // Fast-path: infer session from Supabase cookies to avoid a network roundtrip.
  const allCookies: Array<{ name: string }> = typeof store?.getAll === 'function' ? store.getAll() : []
  const hasSupabaseAuth = allCookies.some((c: { name: string }) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

  if (hasSupabaseAuth) {
    redirect('/messages')
  }

  // Unauthenticated: show landing page
  return (
    <main
      id="main-content"
      aria-labelledby="hero-title"
      className="relative min-h-[100svh] overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-purple-50 dark:from-[#0b1020] dark:via-[#0a0f1a] dark:to-[#0b1020]"
    >
      {/* Decorative background shapes */}
      <div className="pointer-events-none absolute -top-20 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-purple-300/40 to-indigo-300/40 dark:from-violet-800/30 dark:to-indigo-800/30 blur-3xl -z-10 animate-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-indigo-200/40 to-purple-200/40 dark:from-indigo-900/30 dark:to-fuchsia-900/30 blur-3xl -z-10 animate-pulse" />
      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 min-h-[100svh] flex items-start sm:items-center justify-center py-16 sm:py-20">
        
        <div className="w-full text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur px-3 py-1 text-xs font-medium text-indigo-700 border border-transparent shadow-sm">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Powered by Advanced AI MCP Integration
          </div>

          <h1 id="hero-title" className="mt-6 text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-balance text-gray-900 dark:text-gray-100">
            Your Intelligent <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-pulse">AI Assistant</span>
          </h1>
          <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Kickstart your workspace with real-time chat and collaboration. Sign in and start chatting in seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3" aria-label="Primary actions">
            <Link
              href="/auth"
              aria-label="Sign in to start chatting"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 text-white font-medium shadow-sm hover:opacity-95 transition"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/messages"
              aria-label="Open your conversations"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-transparent bg-white dark:bg-gray-900 px-5 py-3 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Start Chat
            </Link>
            <Link
              href="/messages?group=1"
              aria-label="Begin a new group chat"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-transparent bg-white dark:bg-gray-900 px-5 py-3 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition"
            >
              <Users className="mr-2 h-4 w-4" />
              Begin Group Chat
            </Link>
          </div>
          <p id="cta-note" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            No card required. Free tier available.
          </p>

          {/* Feature highlights (3-card horizontal stack) */}
          <div className="mt-8 sm:mt-10 grid w-full grid-cols-1 sm:[grid-template-columns:repeat(3,max-content)] px-2 sm:px-0 gap-2 sm:gap-3 md:gap-4 lg:gap-5 text-left justify-center animate-fade-in">
            <FeatureCard
              icon={<MessageSquare className="h-4 w-4" />}
              title="Real-time chat"
              description="Low-latency messaging, typing indicators, and media sharing out of the box."
              accentClassName="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
              descriptionClassName="mt-2"
            />
            <FeatureCard
              icon={<Bot className="h-4 w-4" />}
              title="Agent orchestration"
              description="MCP-powered tools and multi-agent workflows to complete complex tasks."
              accentClassName="bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300"
              className="p-2 md:px-4 md:py-3"
              descriptionClassName="mt-2"
            />
            <FeatureCard
              icon={<Shield className="h-4 w-4" />}
              title="Privacy-first"
              description="Granular access controls and sensible defaults to protect your data."
              accentClassName="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300"
              descriptionClassName="mt-2"
            />
          </div>
        </div>

        
      </section>
    </main>
  )
}

