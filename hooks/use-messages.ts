import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Message } from '@/types/message'

interface UseMessagesOptions {
  conversationId: string
  pageSize?: number
}

export function useMessages({ conversationId, pageSize = 50 }: UseMessagesOptions) {
  return useInfiniteQuery<Message[], Error, Message[], [string, string], number>({
    queryKey: ['messages', conversationId],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: false })
        .range(pageParam, pageParam + pageSize - 1)

      if (error) throw error
      const rows = data || []
      // Normalize DB rows -> shared Message type
      const mapped: Message[] = rows.map((row: any) => ({
        id: row.id,
        conversation_id: row.conversation_id,
        user_id: row.user_id,
        content: row.content,
        created_at: row.timestamp ?? row.created_at,
        edited_at: row.edited_at ?? null,
        read_at: row.read_at ?? null,
        role: row.role,
        is_ai: row.role === 'assistant' || row.is_ai,
        metadata: row.metadata ?? null,
        type: row.type,
        user: row.user,
        reactions: row.reactions,
      }))
      return mapped
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < pageSize) return undefined
      return pages.length * pageSize
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ conversationId, content, type = 'text' }: {
      conversationId: string
      content: string
      type?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          content,
          type,
          role: 'user',
        })
        .select()
        .single()

      if (error) throw error
      // Normalize to shared Message
      const normalized: Message = {
        id: data.id,
        conversation_id: data.conversation_id,
        user_id: data.user_id,
        content: data.content,
        created_at: (data as any).timestamp ?? data.created_at,
        edited_at: data.edited_at ?? null,
        read_at: data.read_at ?? null,
        role: data.role,
        is_ai: data.role === 'assistant' || data.is_ai,
        metadata: data.metadata ?? null,
        type: data.type,
        user: (data as any).user,
        reactions: (data as any).reactions,
      }
      return normalized
    },
    onSuccess: (data, variables) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ['messages', variables.conversationId],
        (old: any) => {
          if (!old) return { pages: [[data]], pageParams: [0] }
          return {
            ...old,
            pages: [[data, ...old.pages[0]], ...old.pages.slice(1)],
          }
        }
      )
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
    },
    onSuccess: (_, messageId) => {
      // Invalidate all message queries
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useEditMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, content }: {
      messageId: string
      content: string
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .update({ content, edited_at: new Date().toISOString() })
        .eq('id', messageId)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient()

  // Set up realtime subscription
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const row: any = payload.new
          const normalized: Message = {
            id: row.id,
            conversation_id: row.conversation_id,
            user_id: row.user_id,
            content: row.content,
            created_at: row.timestamp ?? row.created_at,
            edited_at: row.edited_at ?? null,
            read_at: row.read_at ?? null,
            role: row.role,
            is_ai: row.role === 'assistant' || row.is_ai,
            metadata: row.metadata ?? null,
            type: row.type,
            user: row.user,
            reactions: row.reactions,
          }
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: any) => {
              if (!old) return { pages: [[normalized]], pageParams: [0] }
              return {
                ...old,
                pages: [[normalized, ...old.pages[0]], ...old.pages.slice(1)],
              }
            }
          )
        } else {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
