"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { ensureProfile } from '@/services/profile-service'
import { useRouter } from 'next/navigation'

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
  const [profileEnsured, setProfileEnsured] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || null,
          created_at: supabaseUser.created_at
        })
        // Ensure profile exists
        if (!profileEnsured) {
          try {
            await ensureProfile()
            setProfileEnsured(true)
          } catch (e) {
            console.error('Failed to ensure profile:', e)
          }
        }
      }
      setIsLoading(false)
    }
    
    checkUser()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || null,
          created_at: session.user.created_at
        })
        // Ensure profile exists when user logs in
        if (!profileEnsured) {
          try {
            await ensureProfile()
            setProfileEnsured(true)
          } catch (e) {
            console.error('Failed to ensure profile on auth change:', e)
          }
        }
        // Store profile for future quick sign-in and redirect
        if (event === 'SIGNED_IN') {
          const { storeRecentProfile } = await import('@/components/profile-signin-popup')
          storeRecentProfile(session.user)
          // Force redirect to messages after successful authentication
          if (window.location.pathname.startsWith('/auth') || window.location.pathname === '/') {
            window.location.href = '/messages'
          }
        }
      } else {
        setUser(null)
        setProfileEnsured(false)
      }
      setIsLoading(false)
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        console.error('Login error:', error.message)
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
