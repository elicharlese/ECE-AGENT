import { NextRequest, NextResponse } from 'next/server'
import { usageTrackingService } from '@/services/usage-tracking-service-enhanced'
import { billingService } from '@/services/billing-service-enhanced'
import { supabase } from '@/lib/supabase/client'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-livekit-signature')

    // Verify webhook signature
    if (!verifySignature(body, signature)) {
      console.error('Invalid LiveKit webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body)
    console.log('Received LiveKit webhook:', payload.event)

    // Process the webhook event
    await processLiveKitEvent(payload)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('LiveKit webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Verify LiveKit webhook signature using HMAC-SHA256
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) {
    console.error('No signature provided')
    return false
  }

  const secret = process.env.LIVEKIT_WEBHOOK_SECRET
  if (!secret) {
    console.error('LIVEKIT_WEBHOOK_SECRET not configured')
    return false
  }

  try {
    // LiveKit uses HMAC-SHA256 for signature verification
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex')

    // LiveKit sends signature in format "sha256=signature"
    const providedSignature = signature.replace('sha256=', '')

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(providedSignature, 'hex')
    )
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Process LiveKit webhook events with comprehensive handling
async function processLiveKitEvent(payload: any) {
  const event = {
    eventType: payload.event,
    roomId: payload.room?.sid,
    participantId: payload.participant?.sid,
    userId: payload.participant?.identity || extractUserIdFromMetadata(payload.participant?.metadata),
    timestamp: new Date()
  }

  // Extract usage data based on event type
  switch (payload.event) {
    case 'room_started':
      await handleRoomStarted(event, payload)
      break

    case 'room_finished':
      await handleRoomFinished(event, payload)
      break

    case 'participant_joined':
      await handleParticipantJoined(event, payload)
      break

    case 'participant_left':
      await handleParticipantLeft(event, payload)
      break

    case 'track_published':
      await handleTrackPublished(event, payload)
      break

    case 'track_unpublished':
      await handleTrackUnpublished(event, payload)
      break

    case 'egress_started':
      await handleEgressStarted(event, payload)
      break

    case 'egress_ended':
      await handleEgressEnded(event, payload)
      break

    case 'recording_started':
      await handleRecordingStarted(event, payload)
      break

    case 'recording_ended':
      await handleRecordingEnded(event, payload)
      break

    default:
      console.log('Unhandled LiveKit event:', payload.event)
  }

  // Track usage if we have relevant data and a user ID
  if (event.userId && (event.videoMinutes || event.audioMinutes || event.messages || event.dataTransferred)) {
    await usageTrackingService.trackLiveKitUsage(event)

    // Check for billing triggers (usage thresholds, overages)
    await checkBillingTriggers(event.userId, event)
  }
}

// Extract user ID from participant metadata
function extractUserIdFromMetadata(metadata: string | undefined): string | undefined {
  if (!metadata) return undefined

  try {
    const parsed = JSON.parse(metadata)
    return parsed.userId || parsed.user_id || parsed.identity
  } catch (error) {
    console.warn('Failed to parse participant metadata:', error)
    return undefined
  }
}

// Event handlers with detailed logging and usage calculation
async function handleRoomStarted(event: any, payload: any) {
  console.log(`Room started: ${event.roomId}`)

  // Log room creation for analytics
  await supabase
    .from('room_events')
    .insert({
      roomId: event.roomId,
      eventType: 'started',
      participantCount: payload.room?.num_participants || 0,
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log room start:', error))
}

async function handleRoomFinished(event: any, payload: any) {
  console.log(`Room finished: ${event.roomId}, duration: ${payload.room?.duration}s`)

  // Calculate total room duration and distribute among participants
  if (payload.room?.duration && payload.room?.num_participants > 0) {
    const totalMinutes = Math.ceil(payload.room.duration / 60)
    const minutesPerParticipant = Math.ceil(totalMinutes / payload.room.num_participants)

    event.videoMinutes = minutesPerParticipant
    event.audioMinutes = minutesPerParticipant // Assume audio was also active
  }

  // Log room completion
  await supabase
    .from('room_events')
    .insert({
      roomId: event.roomId,
      eventType: 'finished',
      duration: payload.room?.duration || 0,
      participantCount: payload.room?.num_participants || 0,
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log room finish:', error))
}

async function handleParticipantJoined(event: any, payload: any) {
  console.log(`Participant joined: ${event.participantId} in room ${event.roomId}`)

  // Log participant join for analytics
  await supabase
    .from('participant_events')
    .insert({
      roomId: event.roomId,
      participantId: event.participantId,
      userId: event.userId,
      eventType: 'joined',
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log participant join:', error))
}

async function handleParticipantLeft(event: any, payload: any) {
  console.log(`Participant left: ${event.participantId} from room ${event.roomId}, duration: ${payload.participant?.duration}s`)

  // Calculate participant session duration and usage
  if (payload.participant?.duration) {
    const durationMinutes = Math.ceil(payload.participant.duration / 60)

    // Check what tracks were active during the session
    if (payload.participant?.tracks) {
      const hasVideo = payload.participant.tracks.some((track: any) => track.kind === 'video')
      const hasAudio = payload.participant.tracks.some((track: any) => track.kind === 'audio')

      if (hasVideo) {
        event.videoMinutes = durationMinutes
      }
      if (hasAudio) {
        event.audioMinutes = durationMinutes
      }
    } else {
      // If track info not available, assume both video and audio were active
      event.videoMinutes = durationMinutes
      event.audioMinutes = durationMinutes
    }
  }

  // Log participant leave
  await supabase
    .from('participant_events')
    .insert({
      roomId: event.roomId,
      participantId: event.participantId,
      userId: event.userId,
      eventType: 'left',
      duration: payload.participant?.duration || 0,
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log participant leave:', error))
}

async function handleTrackPublished(event: any, payload: any) {
  console.log(`Track published: ${payload.track?.kind} by ${event.participantId}`)

  // Log track publication for detailed analytics
  await supabase
    .from('track_events')
    .insert({
      roomId: event.roomId,
      participantId: event.participantId,
      userId: event.userId,
      trackId: payload.track?.sid,
      trackKind: payload.track?.kind,
      eventType: 'published',
      codec: payload.track?.codec,
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log track publish:', error))
}

async function handleTrackUnpublished(event: any, payload: any) {
  console.log(`Track unpublished: ${payload.track?.kind} by ${event.participantId}`)

  // Log track unpublication
  await supabase
    .from('track_events')
    .insert({
      roomId: event.roomId,
      participantId: event.participantId,
      userId: event.userId,
      trackId: payload.track?.sid,
      trackKind: payload.track?.kind,
      eventType: 'unpublished',
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log track unpublish:', error))
}

async function handleEgressStarted(event: any, payload: any) {
  console.log(`Egress started: ${payload.egress?.egress_id}, type: ${payload.egress?.egress_type}`)

  // Log egress start for cost tracking
  await supabase
    .from('egress_events')
    .insert({
      egressId: payload.egress?.egress_id,
      roomId: event.roomId,
      userId: event.userId,
      egressType: payload.egress?.egress_type,
      eventType: 'started',
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log egress start:', error))
}

async function handleEgressEnded(event: any, payload: any) {
  console.log(`Egress ended: ${payload.egress?.egress_id}, duration: ${payload.egress?.duration}s`)

  // Calculate egress costs based on duration and type
  if (payload.egress?.duration && payload.egress?.egress_type) {
    const durationHours = payload.egress.duration / 3600 // Convert to hours

    // Estimate data transferred based on egress type and duration
    let estimatedDataMB = 0

    switch (payload.egress.egress_type) {
      case 'file':
        // Recording: estimate based on video bitrate (assume 1-2 Mbps)
        estimatedDataMB = durationHours * 1000 // ~1GB per hour
        break
      case 'stream':
        // Streaming: estimate based on stream bitrate
        estimatedDataMB = durationHours * 500 // ~500MB per hour
        break
      default:
        estimatedDataMB = durationHours * 100 // Conservative estimate
    }

    event.dataTransferred = estimatedDataMB
  }

  // Log egress completion
  await supabase
    .from('egress_events')
    .insert({
      egressId: payload.egress?.egress_id,
      roomId: event.roomId,
      userId: event.userId,
      egressType: payload.egress?.egress_type,
      eventType: 'ended',
      duration: payload.egress?.duration || 0,
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log egress end:', error))
}

async function handleRecordingStarted(event: any, payload: any) {
  console.log(`Recording started: ${payload.recording?.recording_id}`)

  // Log recording start
  await supabase
    .from('recording_events')
    .insert({
      recordingId: payload.recording?.recording_id,
      roomId: event.roomId,
      userId: event.userId,
      eventType: 'started',
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log recording start:', error))
}

async function handleRecordingEnded(event: any, payload: any) {
  console.log(`Recording ended: ${payload.recording?.recording_id}, duration: ${payload.recording?.duration}s`)

  // Estimate recording data usage
  if (payload.recording?.duration) {
    const durationHours = payload.recording.duration / 3600
    event.dataTransferred = durationHours * 1500 // Estimate 1.5GB per hour for HD recording
  }

  // Log recording completion
  await supabase
    .from('recording_events')
    .insert({
      recordingId: payload.recording?.recording_id,
      roomId: event.roomId,
      userId: event.userId,
      eventType: 'ended',
      duration: payload.recording?.duration || 0,
      createdAt: new Date().toISOString()
    })
    .catch(error => console.error('Failed to log recording end:', error))
}

// Check for billing triggers based on usage
async function checkBillingTriggers(userId: string, event: any) {
  try {
    // Get current usage
    const usageSummary = await usageTrackingService.getUserUsageSummary(userId)
    if (!usageSummary) return

    // Check if user has exceeded limits and needs to be billed
    const limits = usageSummary.limits
    const currentUsage = usageSummary.currentUsage

    let hasOverage = false
    let overageCost = 0

    if (limits.videoMinutes !== -1 && currentUsage.videoMinutes > limits.videoMinutes) {
      hasOverage = true
      const overageVideo = currentUsage.videoMinutes - limits.videoMinutes
      overageCost += overageVideo * 0.00072
    }
    if (limits.audioMinutes !== -1 && currentUsage.audioMinutes > limits.audioMinutes) {
      hasOverage = true
      const overageAudio = currentUsage.audioMinutes - limits.audioMinutes
      overageCost += overageAudio * 0.00036
    }
    if (limits.messages !== -1 && currentUsage.messages > limits.messages) {
      hasOverage = true
      const overageMessages = currentUsage.messages - limits.messages
      overageCost += overageMessages * 0.00012
    }
    if (limits.dataGB !== -1 && currentUsage.dataGB > limits.dataGB) {
      hasOverage = true
      const overageData = currentUsage.dataGB - limits.dataGB
      overageCost += overageData * 0.00012
    }

    // If user has significant overage, trigger billing
    if (hasOverage && overageCost > 1.0) { // $1 threshold for billing
      await billingService.generateMonthlyInvoice(userId)
      console.log(`Generated invoice for user ${userId} due to overage: $${overageCost.toFixed(2)}`)
    }

    // Check trial expiration
    const trialResult = await billingService.handleTrialExpiration(userId)
    if (trialResult.converted) {
      console.log(`User ${userId} automatically converted from trial to ${trialResult.newTier}`)
    }

  } catch (error) {
    console.error('Error checking billing triggers:', error)
  }
}