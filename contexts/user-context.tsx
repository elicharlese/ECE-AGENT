"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { setFeatureFlagUserId } from '@/lib/feature-flags'

interface User {
  id: string
  email: string | null
  created_at: string
}

interface UserContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Small helper to avoid indefinite hangs on network/env issues
    const withTimeout = <T,>(p: PromiseLike<T>, ms = 5000): Promise<T> =>
      new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('timeout')), ms)
        Promise.resolve(p).then(
          (v: T) => {
            clearTimeout(t)
            resolve(v)
          },
          (e: unknown) => {
            clearTimeout(t)
            reject(e)
          }
        )
      })

    // Check if user is already logged in
    const checkUser = async () => {
      // Fast-path + hygiene: if there is an orphaned access-token cookie without a refresh-token,
      // clear it to avoid Supabase auto-refresh throwing "Invalid Refresh Token" on load.
      try {
        const cookieStr = typeof document !== 'undefined' ? document.cookie : ''
        const hasAccess = /(?:^|; )sb-(?:[^=]*-)?access-token=/.test(cookieStr)
        const hasRefresh = /(?:^|; )sb-(?:[^=]*-)?refresh-token=/.test(cookieStr)

        if (hasAccess && !hasRefresh) {
          // Proactively clear any sb-*access-token cookies at path=/
          const names = cookieStr
            .split('; ')
            .map((kv) => kv.split('=')[0])
            .filter((name) => /^sb-(?:[^=]*-)?access-token$/.test(name))
          names.forEach((name) => {
            try {
              document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`
            } catch {}
          })
        }

        // After cleanup, if still no Supabase cookie, skip the network call
        const postCleanCookieStr = typeof document !== 'undefined' ? document.cookie : ''
        const hasSbCookie = /(?:^|; )sb-(?:[^=]*-)?access-token=/.test(postCleanCookieStr) || /(?:^|; )sb-(?:[^=]*-)?refresh-token=/.test(postCleanCookieStr)
        if (!hasSbCookie) {
          setIsLoading(false)
          return
        }
      } catch (_) {
        // ignore
      }
      try {
        const { data: { user: supabaseUser } } = await withTimeout(supabase.auth.getUser(), 4000)
        if (supabaseUser) {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || null,
            created_at: supabaseUser.created_at
          })
          // Set feature flag user id for rollout gating
          try { setFeatureFlagUserId(supabaseUser.id) } catch {}
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') {
          console.debug('auth.getUser failed/timeout; continuing unauthenticated')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || null,
          created_at: session.user.created_at
        })
        try { setFeatureFlagUserId(session.user.id) } catch {}
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Handle special admin credentials
      if (email === 'admin' && password === 'admin') {
        // For demo purposes, create or login as admin user with a valid email
        const adminEmail = 'admin@agent-demo.com'
        const adminPassword = 'SecurePass123!'
        
        // Try to sign in as admin
        let { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        })
        
        // If admin doesn't exist, create it
        if (error) {
          console.log('Admin user not found, creating admin account...')
          const { error: signUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
              emailRedirectTo: undefined,
              data: {
                role: 'admin',
                display_name: 'Administrator'
              }
            }
          })
          if (signUpError) {
            console.error('Admin user creation error:', signUpError.message)
            return false
          }
          // Immediately sign in after creating the admin user
          const { data: signInAfter, error: signInAfterErr } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
          })
          if (signInAfterErr) {
            console.error('Admin post-signup login failed:', signInAfterErr.message)
            return false
          }
          data = signInAfter
        }
        
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || null,
            created_at: data.user.created_at
          })
          try { setFeatureFlagUserId(data.user.id) } catch {}
          return true
        }
        return false;
      }
      
      // Handle demo credentials (test/test)
      if (email === 'test' && password === 'test') {
        return await createDemoUser();
      }
      
      // Handle demo credentials (test@example.com/password123)
      if (email === 'test@example.com' && password === 'password123') {
        return await createDemoUser();
      }
      
      // Regular user login - try to sign in first
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login error:', error.message)
        // Return false to let the calling component handle the error message
        return false
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || null,
          created_at: data.user.created_at
        })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // Helper function to create demo user with a valid email domain
  const createDemoUser = async (): Promise<boolean> => {
    const demoEmail = 'demo@agent-demo.com'
    const demoPassword = 'DemoPass123!'
    
    // Try to sign in first
    let { data, error } = await supabase.auth.signInWithPassword({
      email: demoEmail,
      password: demoPassword
    })
    
    // If demo user doesn't exist, create it
    if (error) {
      console.log('Demo user not found, creating demo account...')
      const { error: signUpError } = await supabase.auth.signUp({
        email: demoEmail,
        password: demoPassword,
        options: {
          emailRedirectTo: undefined,
          data: {
            role: 'demo',
            display_name: 'Demo User'
          }
        }
      })
      
      if (signUpError) {
        console.error('Demo user creation error:', signUpError.message)
        return false
      }
      // Immediately sign in after creating the demo user
      const { data: signInAfter, error: signInErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword
      })
      if (signInErr) {
        console.error('Demo post-signup login failed:', signInErr.message)
        return false
      }
      data = signInAfter
    }
    
    if (data.user) {
      setUser({
        id: data.user.id,
        email: data.user.email || null,
        created_at: data.user.created_at
      })
      try { setFeatureFlagUserId(data.user.id) } catch {}
      return true
    }
    
    return false
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <UserContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
