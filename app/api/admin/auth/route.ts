import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

// Admin role check
export async function GET(request: NextRequest) {
  try {
    // Get user from session (simplified - would use proper auth)
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 401 })
    }

    const supabase = await getSupabaseServer()

    // Check if user has admin role
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('userId', userId)
      .single()

    if (error || !userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has admin role (you can customize this logic)
    const isAdmin = userProfile.role === 'admin' || userProfile.role === 'super_admin'

    if (!isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({
      authorized: true,
      role: userProfile.role,
      userId
    })

  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}