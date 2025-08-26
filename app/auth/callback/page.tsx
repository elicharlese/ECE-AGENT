"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState<string>('Completing sign-in...')
  const [debugMode, setDebugMode] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [params, setParams] = useState<Record<string, string | null>>({})
  const [nextPath, setNextPath] = useState<string | null>(null)
  const [href, setHref] = useState<string>("")
  const [sbCookies, setSbCookies] = useState<string>("")
  const [hash, setHash] = useState<string>("")
  const [referrer, setReferrer] = useState<string>("")
  const [returnTo, setReturnTo] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Read query params from window to avoid Suspense requirement for useSearchParams
    const url = new URL(window.location.href)
    const code = url.searchParams.get('code')
    const token_hash = url.searchParams.get('token_hash')
    const type = url.searchParams.get('type')
    const errorDescription = url.searchParams.get('error_description') || url.searchParams.get('error')
    const dbg = /^(1|true)$/i.test(url.searchParams.get('debug') || '')
    setDebugMode(dbg)
    setParams({ code, token_hash, type, error: errorDescription || null })
    const rt = url.searchParams.get('returnTo')
    setReturnTo(rt && rt.startsWith('/') ? rt : undefined)
    setHref(url.toString())
    setHash(url.hash || "")
    setReferrer(document.referrer || "")
    try {
      const c = document.cookie
      // Only keep sb-* cookies to reduce noise
      const filtered = c.split('; ').filter((kv) => kv.startsWith('sb-')).join('; ')
      setSbCookies(filtered)
    } catch {
      setSbCookies('')
    }

    const log = (m: string) => setLogs((prev) => [...prev, m])

    const redirectSoon = (path: string, delay = 800) => {
      const dest = returnTo && path === '/messages' ? returnTo : path
      if (dbg) {
        setNextPath(dest)
        log(`Debug mode: would redirect to ${dest} in ${delay}ms`)
        return
      }
      const t = setTimeout(() => router.replace(dest), delay)
      // no cleanup return from inner async; effect will unmount soon after redirect
      // and Next will navigate
    }

    const run = async () => {
      try {
        // Surface provider errors (e.g., user denied access)
        if (errorDescription) {
          console.error('OAuth error:', errorDescription)
          log(`OAuth error: ${errorDescription}`)
          setStatus('error')
          setMessage('Authentication was cancelled or failed. Redirecting to sign-in...')
          redirectSoon('/auth', 1200)
          return
        }

        // Poll briefly for a session UNCONDITIONALLY to handle implicit/hash flows too.
        setStatus('pending')
        setMessage('Completing sign-in...') 
        for (let i = 0; i < 20; i++) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            log('Session detected via getSession() polling')
            setStatus('success')
            setMessage('Signed in! Redirecting...')
            redirectSoon('/messages', 300)
            return
          }
          await new Promise(r => setTimeout(r, 150))
        }

        // Fallbacks if auto-detect didn’t populate a session in time
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(url.toString())
          if (error) {
            console.error('Supabase exchange error (fallback):', error)
            log(`exchangeCodeForSession error: ${error.message || String(error)}`)
            setStatus('error')
            setMessage('Authentication failed. Redirecting to sign-in...')
            redirectSoon('/auth', 1200)
            return
          }
          log('exchangeCodeForSession succeeded')
          setStatus('success')
          setMessage('Signed in! Redirecting...')
          redirectSoon('/messages', 300)
          return
        }

        if (token_hash) {
          const otpType = (type === 'magiclink' || !type) ? 'email' : (type as any)
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: otpType as any,
          })
          if (error) {
            console.error('Supabase verifyOtp error (fallback):', error)
            log(`verifyOtp error: ${error.message || String(error)}`)
            setStatus('error')
            setMessage('Verification failed. Redirecting to sign-in...')
            redirectSoon('/auth', 1200)
            return
          }
          log('verifyOtp succeeded')
          setStatus('success')
          setMessage('Verified! Redirecting...')
          redirectSoon('/messages', 300)
          return
        }

        // If user lands here without any expected params, bounce back to /auth
        setStatus('error')
        setMessage('Missing authorization parameters. Redirecting...')
        log('Missing expected authorization parameters (no code or token_hash)')
        redirectSoon('/auth', 800)
      } catch (e) {
        console.error('Unexpected auth callback error:', e)
        log(`Unexpected error: ${e instanceof Error ? e.message : String(e)}`)
        setStatus('error')
        setMessage('Unexpected error. Redirecting to sign-in...')
        redirectSoon('/auth', 1200)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 w-full max-w-sm text-center">
        <div className="flex items-center justify-center mb-3">
          <div className={`${status === 'error' ? 'bg-red-500' : status === 'success' ? 'bg-green-500' : 'bg-blue-500'} h-3 w-3 rounded-full animate-pulse`} />
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-200">{message}</p>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">You will be redirected shortly.</p>
        {debugMode && (
          <div className="mt-4 text-left">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Debug details</div>
            <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-auto max-h-52">
{JSON.stringify({ href, hash, referrer, params, status, nextPath, sbCookies, logs }, null, 2)}
            </pre>
            {nextPath && (
              <div className="mt-2 flex gap-2 justify-center">
                <button onClick={() => router.replace(nextPath)} className="px-3 py-1.5 text-xs rounded bg-blue-600 text-white hover:bg-blue-700">Go to {nextPath}</button>
                <button onClick={() => router.replace('/auth')} className="px-3 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">Back to /auth</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
