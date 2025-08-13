"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

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
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || null,
          created_at: supabaseUser.created_at
        })
      }
      setIsLoading(false)
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
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
          
          data = signUpData as typeof data;
        }
        
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email || null,
            created_at: data.user.created_at
          })
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
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
      
      data = signUpData as typeof data;
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
