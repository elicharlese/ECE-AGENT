import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import * as crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { chatId, chatName, isGroupChat, customMessage } = await request.json()

    if (!chatId) {
      return NextResponse.json(
        { error: 'Missing chatId parameter' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServer()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Verify user has access to this chat
    const { data: participant, error: participantError } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', chatId)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'You do not have access to this chat' },
        { status: 403 }
      )
    }

    // Generate secure invitation token
    const inviteToken = crypto.randomBytes(32).toString('hex')

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('chat_invitations')
      .insert({
        chat_id: chatId,
        inviter_id: user.id,
        invitee_id: user.id, // Will be updated when someone uses the link
        token: inviteToken,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        custom_message: customMessage,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      inviteToken,
      expiresAt: expiresAt.toISOString(),
      invitationId: invitation.id,
    })
  } catch (error) {
    console.error('Error creating invitation link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
