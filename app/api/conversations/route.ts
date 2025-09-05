import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { title, participantIds = [], agentId } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
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

    // Create the conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert({
        title,
        user_id: user.id,
        agent_id: agentId || 'dm',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (conversationError) {
      console.error('Error creating conversation:', conversationError)
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      )
    }

    // Add participants (including creator)
    const allParticipantIds = Array.from(new Set([user.id, ...participantIds]))
    const participantRows = allParticipantIds.map(participantId => ({
      conversation_id: conversation.id,
      user_id: participantId,
      role: participantId === user.id ? 'owner' : 'member',
      joined_at: new Date().toISOString(),
    }))

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantRows)

    if (participantsError) {
      console.error('Error adding participants:', participantsError)
      // Don't fail the request if participants insertion fails
      // The conversation is still created successfully
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at,
        user_id: conversation.user_id,
        agent_id: conversation.agent_id,
      },
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
