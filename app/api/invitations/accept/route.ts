import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { chatId, inviteToken, userId } = await request.json()

    if (!chatId || !inviteToken || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters: chatId, inviteToken, userId' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServer()

    // Verify the invitation exists and is valid
    const { data: invitation, error: inviteError } = await supabase
      .from('chat_invitations')
      .select('*')
      .eq('token', inviteToken)
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
      .eq('user_id', userId)
      .single()

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'You are already a member of this chat' },
        { status: 400 }
      )
    }

    // Add user to the conversation
    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: chatId,
        user_id: userId,
        role: 'member',
        joined_at: new Date().toISOString(),
      })

    if (participantError) {
      console.error('Error adding participant:', participantError)
      return NextResponse.json(
        { error: 'Failed to join conversation' },
        { status: 500 }
      )
    }

    // Update invitation status to accepted and set the correct invitee_id
    const { error: updateError } = await supabase
      .from('chat_invitations')
      .update({
        status: 'accepted',
        invitee_id: userId, // Update with the actual user who accepted
        accepted_at: new Date().toISOString(),
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      // Don't fail the request if this update fails
    }

    // Get conversation details for response
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id, name, is_group')
      .eq('id', chatId)
      .single()

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the conversation',
      conversation: {
        id: conversation?.id,
        name: conversation?.name,
        isGroup: conversation?.is_group,
      },
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
