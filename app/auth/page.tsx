'use client'

import React from 'react'
import { LoginForm } from '@/components/login-form'

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
