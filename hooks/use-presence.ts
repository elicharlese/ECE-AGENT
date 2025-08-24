"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

/**
 * Tracks realtime presence for a given room (e.g., a conversationId) using Supabase Realtime.
 * Returns a Set of online user IDs currently in the room.
 */
export function usePresence(room: string | null | undefined, currentUserId?: string) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set())
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  useEffect(() => {
    const roomName = room || ''
    if (!roomName) return

    // Tear down any previous channel for safety
    if (channelRef.current) {
      try { supabase.removeChannel(channelRef.current) } catch {}
      channelRef.current = null
    }

    const channel = supabase.channel(`presence:${roomName}`, {
      config: { presence: { key: currentUserId || 'anonymous' } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, Array<Record<string, any>>>
        const ids = new Set<string>(Object.keys(state))
        setOnlineIds(ids)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          try {
            await channel.track({ user_id: currentUserId || 'anonymous', online_at: new Date().toISOString() })
          } catch (e) {
            console.warn('presence track failed', e)
          }
        }
      })

    channelRef.current = channel

    return () => {
      try { supabase.removeChannel(channel) } catch {}
      channelRef.current = null
    }
  }, [room, currentUserId])

  // Provide a stable reference for consumers comparing deps
  const onlineArray = useMemo(() => Array.from(onlineIds).sort(), [onlineIds])

  return { onlineIds, onlineArray }
}
