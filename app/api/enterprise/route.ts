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
    const enterpriseId = searchParams.get('enterpriseId')

    if (enterpriseId) {
      const enterpriseProfile = await userTierService.getEnterpriseProfile(enterpriseId)
      return NextResponse.json({ enterprise: enterpriseProfile })
    }

    // Get user's enterprise profile
    const { data: enterprise, error } = await supabase
      .from('enterprise_profiles')
      .select('*')
      .eq('owner_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json({ enterprise: enterprise || null })
  } catch (error) {
    console.error('Error fetching enterprise profile:', error)
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
        const { organizationName } = params
        if (!organizationName) {
          return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
        }

        // Check if user has enterprise tier
        const userProfile = await userTierService.getUserProfile(user.id)
        if (!userProfile || userProfile.tier !== 'enterprise') {
          return NextResponse.json({ error: 'Enterprise tier required' }, { status: 403 })
        }

        const enterprise = await userTierService.createEnterpriseProfile(user.id, organizationName)
        return NextResponse.json({ enterprise })

      case 'addLLMEndpoint':
        const { enterpriseId, name, endpointUrl, apiKey, modelType, rateLimit } = params
        
        // Verify user owns the enterprise
        const { data: ownership } = await supabase
          .from('enterprise_profiles')
          .select('owner_id')
          .eq('id', enterpriseId)
          .single()

        if (!ownership || ownership.owner_id !== user.id) {
          return NextResponse.json({ error: 'Enterprise ownership required' }, { status: 403 })
        }

        const endpoint = await userTierService.addCustomLLMEndpoint(enterpriseId, {
          name,
          endpoint: endpointUrl,
          apiKey, // TODO: encrypt before storing in production
          model: modelType,
          provider: 'custom',
          rateLimitOverride: rateLimit || 100,
          isActive: true,
        })
        return NextResponse.json({ endpoint })

      case 'updateRateLimits':
        const { enterpriseId: rateLimitEnterpriseId, rateLimits } = params
        
        // Verify user owns the enterprise
        const { data: rateLimitOwnership } = await supabase
          .from('enterprise_profiles')
          .select('owner_id')
          .eq('id', rateLimitEnterpriseId)
          .single()

        if (!rateLimitOwnership || rateLimitOwnership.owner_id !== user.id) {
          return NextResponse.json({ error: 'Enterprise ownership required' }, { status: 403 })
        }

        await userTierService.updateRateLimits(rateLimitEnterpriseId, rateLimits)
        return NextResponse.json({ success: true })

      case 'toggleEndpoint':
        const { endpointId, isActive } = params
        
        // Verify user owns the enterprise that owns this endpoint
        const { data: endpointOwnership } = await supabase
          .from('enterprise_llm_endpoints')
          .select(`
            enterprise_id,
            enterprise_profiles!inner(owner_id)
          `)
          .eq('id', endpointId)
          .single()

        // enterprise_profiles from the join can be typed as an array; guard accordingly
        const ownerId = Array.isArray((endpointOwnership as any)?.enterprise_profiles)
          ? (endpointOwnership as any).enterprise_profiles[0]?.owner_id
          : (endpointOwnership as any)?.enterprise_profiles?.owner_id

        if (!endpointOwnership || ownerId !== user.id) {
          return NextResponse.json({ error: 'Endpoint ownership required' }, { status: 403 })
        }

        const { error: toggleError } = await supabase
          .from('enterprise_llm_endpoints')
          .update({ is_active: isActive })
          .eq('id', endpointId)

        if (toggleError) {
          throw toggleError
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in enterprise operation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
