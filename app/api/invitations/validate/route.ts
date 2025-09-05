import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const chatId = searchParams.get('chatId')

    if (!token || !chatId) {
      return NextResponse.json(
        { error: 'Missing token or chatId parameter' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServer()

    // First, try to find the invitation in the database
    const { data: invitation, error: inviteError } = await supabase
      .from('chat_invitations')
      .select(`
        *,
        chat:conversations!inner(
          id,
          name,
          is_group,
          created_by,
          participants:conversation_participants(count)
        ),
        inviter:profiles!chat_invitations_inviter_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .eq('token', token)
      .eq('chat_id', chatId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if user is already a participant
    const { data: existingParticipant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', chatId)
      .eq('user_id', invitation.invitee_id)
      .single()

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'You are already a member of this chat' },
        { status: 400 }
      )
    }

    // Return invitation data
    const invitationData = {
      chatId: invitation.chat.id,
      chatName: invitation.chat.name || 'Unnamed Chat',
      inviterName: invitation.inviter?.full_name || invitation.inviter?.email || 'Unknown',
      isGroupChat: invitation.chat.is_group || false,
      participantCount: invitation.chat.participants?.[0]?.count || 1,
      inviteToken: invitation.token,
      expiresAt: new Date(invitation.expires_at),
      inviteeId: invitation.invitee_id,
      inviterId: invitation.inviter_id,
    }

    return NextResponse.json({ invitation: invitationData })
  } catch (error) {
    console.error('Error validating invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
