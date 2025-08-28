import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { VideoCallTest } from '@/components/test/VideoCallTest'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default async function VideoCallTestPage() {
  const supabase = await getSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth?returnTo=/video-calls/test')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Video Call Testing
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Test video calling functionality with LiveKit integration
          </p>
        </div>
        
        <ErrorBoundary>
          <VideoCallTest />
        </ErrorBoundary>
      </div>
    </div>
  )
}
