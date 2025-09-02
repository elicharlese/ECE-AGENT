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

    const profile = await userTierService.getUserProfile(user.id)
    
    if (!profile) {
      // Create a default personal profile if none exists
      const newProfile = await userTierService.createUserProfile(user.id, 'personal')
      return NextResponse.json({ profile: newProfile })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching user tier:', error)
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
      case 'upgrade':
        const { tier } = params
        if (!['personal', 'team', 'enterprise'].includes(tier)) {
          return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
        }
        
        const upgradedProfile = await userTierService.upgradeTier(user.id, tier)
        return NextResponse.json({ profile: upgradedProfile })

      case 'updateUsage':
        const { usage } = params
        await userTierService.updateUsage(user.id, usage)
        return NextResponse.json({ success: true })

      case 'validateUsage':
        const { actionType, amount = 1 } = params
        const validation = await userTierService.validateUsage(user.id, actionType, amount)
        return NextResponse.json({ validation })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in user tier operation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
