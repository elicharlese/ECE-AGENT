import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { TestNavigation } from '@/components/test/TestNavigation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default async function TestPage() {
  const supabase = await getSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth?returnTo=/test')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Communication Testing Hub
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Test and validate all communication features in a controlled environment
          </p>
        </div>
        
        <ErrorBoundary>
          <TestNavigation />
        </ErrorBoundary>
      </div>
    </div>
  )
}
