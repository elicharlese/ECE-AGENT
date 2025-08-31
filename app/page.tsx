import type { Metadata } from "next"
import { homePageMetadata } from "@/lib/seo-metadata"
import Link from "next/link"
import { ArrowRight, MessageSquare, Bot, Shield } from "lucide-react"
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
      {/* Single, subtle background accent */}
      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[28rem] w-[28rem] -z-10 rounded-full bg-gradient-to-br from-indigo-300/30 to-purple-300/30 dark:from-violet-800/25 dark:to-indigo-800/25 blur-3xl" />

      <section className="relative mx-auto flex min-h-[100svh] max-w-5xl items-center justify-center px-4 py-16 sm:px-6 sm:py-20">
        <div className="w-full text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-white/10 dark:text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            MCP-powered AI workspace
          </div>

          <h1
            id="hero-title"
            className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-gray-100"
          >
            Your Intelligent
            <span className="ml-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">AI Assistant</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 md:text-lg dark:text-gray-300">
            Real-time chat and collaboration for modern teams. Sign in and start a conversation in seconds.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row" aria-label="Primary actions">
            <Link
              href="/auth"
              aria-label="Sign in to start chatting"
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3 font-medium text-white shadow-sm transition hover:opacity-95 sm:w-auto"
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/messages"
              aria-label="Open your conversations"
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 font-medium text-gray-800 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Start Chat
            </Link>
          </div>
          <p id="cta-note" className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            No card required. Free tier available.
          </p>

          {/* Minimal feature highlights */}
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-2 px-2 text-left sm:mt-10 sm:grid-cols-3 sm:gap-3">
            <FeatureCard
              icon={<MessageSquare className="h-4 w-4" />}
              title="Real-time chat"
              description="Typing indicators and low-latency messaging."
              accentClassName="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300"
              descriptionClassName="mt-2"
            />
            <FeatureCard
              icon={<Bot className="h-4 w-4" />}
              title="Agent tools"
              description="MCP orchestrates complex tasks."
              accentClassName="bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300"
              className="p-2 md:px-4 md:py-3"
              descriptionClassName="mt-2"
            />
            <FeatureCard
              icon={<Shield className="h-4 w-4" />}
              title="Privacy-first"
              description="Granular access controls."
              accentClassName="bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300"
              descriptionClassName="mt-2"
            />
          </div>
        </div>
      </section>
    </main>
  )
}

