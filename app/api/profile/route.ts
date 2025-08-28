import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { profileService } from '@/services/profile-service'
import { ProfileUpdateSchema } from '@/types/profile'

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const supabase = await getSupabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const profile = await profileService.getProfile(session.user.id)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const raw = await request.json()

    // Accept both camelCase and snake_case from clients
    const mapped = {
      username: raw.username,
      full_name: raw.full_name ?? raw.displayName ?? raw.fullName,
      avatar_url: raw.avatar_url ?? raw.avatarUrl,
      cover_url: raw.cover_url ?? raw.coverUrl,
      solana_address: raw.solana_address ?? raw.solanaAddress,
    }

    const parsed = ProfileUpdateSchema.safeParse(mapped)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid profile payload', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const updatedProfile = await profileService.updateProfile(session.user.id, parsed.data)
    
    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data: updatedProfile })
  } catch (error: any) {
    console.error('Error updating profile:', error)
    
    // Handle unique constraint violations
    if (error.code === '23505' && error.constraint === 'profiles_username_key') {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

// DELETE /api/profile - Delete user's profile (soft delete)
export async function DELETE() {
  try {
    const supabase = await getSupabaseServer()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Soft delete by setting deleted_at timestamp
    const { error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', session.user.id)
    
    if (error) {
      console.error('Error deleting profile:', error)
      return NextResponse.json(
        { error: 'Failed to delete profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Profile deleted successfully' })
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  }
}
