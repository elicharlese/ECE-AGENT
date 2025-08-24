'use client'

import * as React from 'react'
import { MoreVertical } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { supabase } from '@/lib/supabase/client'
import { conversationService } from '@/services/conversation-service'
import { useRouter } from 'next/navigation'

export interface ConversationMenuProps {
  chatId: string
  currentUserId: string
  creatorUserId?: string
  onOpenMCPSettings?: () => void
  onEnded?: (result: 'deleted' | 'left' | 'archived' | 'failed') => void
  className?: string
}

export function ConversationMenu({ chatId, currentUserId, creatorUserId, onOpenMCPSettings, onEnded, className }: ConversationMenuProps) {
  const [muted, setMuted] = React.useState(false)
  const router = useRouter()

  const handleMarkAllAsRead = async () => {
    try {
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', chatId)
        .eq('user_id', currentUserId)
      toast({ title: 'Marked as read' })
    } catch (e) {
      toast({ title: 'Failed to mark as read', description: e instanceof Error ? e.message : String(e), variant: 'destructive' })
    }
  }

  const handleCopyConversationId = async () => {
    try {
      await navigator.clipboard.writeText(chatId)
      toast({ title: 'Conversation ID copied' })
    } catch (e) {
      toast({ title: 'Copy failed', description: 'Could not copy Conversation ID', variant: 'destructive' })
    }
  }

  const handleEndChat = async () => {
    // If current user is the creator, delete conversation (RLS allows)
    if (creatorUserId && creatorUserId === currentUserId) {
      try {
        await conversationService.deleteConversation(chatId)
        toast({ title: 'Conversation deleted' })
        onEnded?.('deleted')
        try { router.push('/messages') } catch {}
        return
      } catch (e) {
        toast({ title: 'Failed to delete', description: e instanceof Error ? e.message : String(e), variant: 'destructive' })
        onEnded?.('failed')
        return
      }
    }

    // Otherwise, attempt to leave by removing membership row
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', chatId)
        .eq('user_id', currentUserId)

      if (error) {
        // Likely blocked by RLS (only creator can delete membership per current policy)
        toast({ title: 'Unable to leave conversation', description: 'Only the conversation owner can delete it. We can add "leave" support with a small DB change.', variant: 'destructive' })
        onEnded?.('failed')
        return
      }

      toast({ title: 'Left conversation' })
      onEnded?.('left')
      try { router.push('/messages') } catch {}
    } catch (e) {
      toast({ title: 'Failed to end chat', description: e instanceof Error ? e.message : String(e), variant: 'destructive' })
      onEnded?.('failed')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={className ?? 'p-2 rounded-md hover:bg-gray-100'}
          aria-label="Conversation options"
          title="Conversation options"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Conversation</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleMarkAllAsRead}>
          Mark all as read
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyConversationId}>
          Copy Conversation ID
        </DropdownMenuItem>
        {onOpenMCPSettings && (
          <DropdownMenuItem onClick={() => onOpenMCPSettings()}>
            Open MCP Settings
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={muted}
          onCheckedChange={(v) => {
            setMuted(!!v)
            toast({ title: !!v ? 'Notifications muted' : 'Notifications unmuted' })
          }}
        >
          Mute notifications
        </DropdownMenuCheckboxItem>
        <DropdownMenuItem
          onClick={handleEndChat}
          variant="destructive"
        >
          End chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
