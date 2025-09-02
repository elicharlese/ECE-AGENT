import { NextRequest, NextResponse } from 'next/server'

// Mock data collector for deployment
class MockDataCollector {
  interactions: any[] = []
  
  log_interaction(conversation_id: string, user_input: string, agent_response: string, agent_mode: string, processing_time: number) {
    const interaction = {
      id: `interaction_${Date.now()}`,
      conversation_id,
      user_input,
      agent_response,
      agent_mode,
      processing_time,
      timestamp: new Date().toISOString(),
      user_feedback_score: null,
      response_quality_score: null
    }
    this.interactions.push(interaction)
    return interaction.id
  }
  
  add_feedback(interaction_id: string, user_feedback_score: number, response_quality_score?: number) {
    const interaction = this.interactions.find(i => i.id === interaction_id)
    if (interaction) {
      interaction.user_feedback_score = user_feedback_score
      interaction.response_quality_score = response_quality_score || user_feedback_score
      return true
    }
    return false
  }
}

// Global instance
let dataCollector = new MockDataCollector()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      interactionId,
      userFeedbackScore,
      responseQualityScore,
      userId,
      comments
    } = body

    if (!interactionId || userFeedbackScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: interactionId and userFeedbackScore' },
        { status: 400 }
      )
    }

    // Validate feedback score range
    if (userFeedbackScore < 1 || userFeedbackScore > 5) {
      return NextResponse.json(
        { error: 'userFeedbackScore must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Add feedback to interaction
    const success = dataCollector.add_feedback(
      interactionId,
      userFeedbackScore,
      responseQualityScore
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Interaction not found or feedback could not be added' },
        { status: 404 }
      )
    }

    // Log feedback event
    console.log(`Feedback recorded for interaction ${interactionId}: ${userFeedbackScore}/5`)

    return NextResponse.json({
      success: true,
      message: 'Feedback recorded successfully',
      interactionId,
      feedbackScore: userFeedbackScore
    })

  } catch (error) {
    console.error('Feedback API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const interactionId = searchParams.get('interactionId')

    if (!interactionId) {
      return NextResponse.json(
        { error: 'Missing interactionId parameter' },
        { status: 400 }
      )
    }

    // Find interaction by ID
    const interaction = dataCollector.interactions.find((i: any) => i.id === interactionId)
    
    if (!interaction) {
      return NextResponse.json(
        { error: 'Interaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      interactionId: interaction.id,
      userFeedbackScore: interaction.user_feedback_score,
      responseQualityScore: interaction.response_quality_score,
      hasFeedback: interaction.user_feedback_score !== null
    })

  } catch (error) {
    console.error('Feedback GET API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
