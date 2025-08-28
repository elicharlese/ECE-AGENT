import { redirect } from 'next/navigation'
import { getSupabaseServer } from '@/lib/supabase/server'
import { ProfileDashboard } from '@/components/profile/ProfileDashboard'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default async function ProfilePage() {
  const supabase = await getSupabaseServer()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth?returnTo=/profile')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full px-4 py-6 md:px-8">
      <ErrorBoundary>
        <ProfileDashboard />
      </ErrorBoundary>
    </div>
  )
}
