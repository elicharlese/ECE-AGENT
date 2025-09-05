'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MobileTestPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main app after a brief delay
    const timer = setTimeout(() => {
      router.push('/messages')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ECE Agent</h1>
          <p className="text-gray-600">Mobile Test Page</p>
        </div>

        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-2 bg-indigo-200 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting to main application...
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => router.push('/messages')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            💬 Go to Messages
          </button>
          
          <button
            onClick={() => router.push('/profile')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            👤 Go to Profile
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            🏠 Go to Home
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">
            ✅ Next.js server running on port 3000<br/>
            ✅ Mobile app configured for port 8090<br/>
            ✅ No more localhost:19000 conflicts
          </p>
        </div>
      </div>
    </div>
  )
}
