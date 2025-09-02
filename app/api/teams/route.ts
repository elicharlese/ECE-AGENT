import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { userTierService } from '@/services/user-tier-service'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')

    if (teamId) {
      const teamProfile = await userTierService.getTeamProfile(teamId)
      return NextResponse.json({ team: teamProfile })
    }

    // Get user's teams
    const { data: teams, error } = await supabase
      .from('team_members')
      .select(`
        team_id,
        role,
        team_profiles!inner(*)
      `)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ teams: teams || [] })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'create':
        const { name, description } = params
        if (!name) {
          return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
        }

        // Check if user has team tier or higher
        const userProfile = await userTierService.getUserProfile(user.id)
        if (!userProfile || userProfile.tier === 'personal') {
          return NextResponse.json({ error: 'Team tier required to create teams' }, { status: 403 })
        }

        const team = await userTierService.createTeamProfile(user.id, name, description)
        return NextResponse.json({ team })

      case 'addMember':
        const { teamId, userId, role = 'member' } = params
        
        // Verify user is team admin
        const { data: membership } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', user.id)
          .single()

        if (!membership || membership.role !== 'admin') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
        }

        const member = await userTierService.addTeamMember(teamId, userId, role)
        return NextResponse.json({ member })

      case 'removeMember':
        const { teamId: removeTeamId, userId: removeUserId } = params
        
        // Verify user is team admin or removing themselves
        const { data: removeMembership } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', removeTeamId)
          .eq('user_id', user.id)
          .single()

        if (!removeMembership || (removeMembership.role !== 'admin' && removeUserId !== user.id)) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        await userTierService.removeTeamMember(removeTeamId, removeUserId)
        return NextResponse.json({ success: true })

      case 'shareResource':
        const { teamId: shareTeamId, resourceId, resourceType } = params
        
        // Verify user is team member
        const { data: shareMembership } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', shareTeamId)
          .eq('user_id', user.id)
          .single()

        if (!shareMembership) {
          return NextResponse.json({ error: 'Team membership required' }, { status: 403 })
        }

        const resource = await userTierService.shareResource(shareTeamId, resourceId, resourceType, user.id)
        return NextResponse.json({ resource })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in team operation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
