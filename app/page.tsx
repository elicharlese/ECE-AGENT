"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/messages')
      } else {
        router.push('/auth')
      }
    }
    checkAuth()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
          <span className="text-white text-3xl font-bold">AI</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Loading...</h1>
        <p className="text-gray-600">Preparing your AI messaging experience</p>
      </div>
    </div>
  )
}
