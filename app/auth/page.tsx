'use client'

import React, { useState } from 'react'
import { LoginForm } from '@/components/login-form'

export default function AuthPage() {
  const [devUsername, setDevUsername] = useState('')
  const [devPassword, setDevPassword] = useState('')
  const [devError, setDevError] = useState('')
  const [isLoadingDev, setIsLoadingDev] = useState(false)

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoadingDev(true)
    
    if (devUsername === 'admin' && devPassword === 'admin123' && process.env.NODE_ENV === 'development') {
      // Set a cookie to bypass auth in development
      document.cookie = 'dev_admin=true; path=/; max-age=86400' // 24 hours
      
      // Set a local user state for the app to use
      if (typeof window !== 'undefined') {
        localStorage.setItem('dev_user', JSON.stringify({
          id: 'dev-admin-id',
          email: 'admin@dev.local',
          name: 'Dev Admin',
          avatar_url: null
        }))
      }
      
      // Use window.location for hard redirect to bypass Next.js router
      window.location.href = '/messages'
    } else {
      setDevError('Invalid credentials')
      setIsLoadingDev(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
