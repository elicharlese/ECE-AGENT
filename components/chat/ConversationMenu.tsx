'use client'

import * as React from 'react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Label,
  Separator,
  Button,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '@/libs/design-system';
import { toast } from '@/libs/design-system'
import { supabase } from '@/lib/supabase/client'
import { conversationService } from '@/services/conversation-service'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/icons/Icon'
import { useConversations } from '@/hooks/use-conversations'
// import { AlertDialog } from '@/components/ui/alert-dialog'
import { UserSelectorDialog } from '@/components/chat/UserSelectorDialog'

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
  const { archiveConversation, leaveConversation, inviteParticipants } = useConversations()
  const [isArchived, setIsArchived] = React.useState<boolean>(false)
  const [inviteOpen, setInviteOpen] = React.useState<boolean>(false)

  // Load per-user flags for this conversation
  React.useEffect(() => {
    let active = true
    const loadFlags = async () => {
      try {
        const { data, error } = await supabase
          .from('conversation_participants')
          .select('is_archived')
          .eq('conversation_id', chatId)
          .eq('user_id', currentUserId)
          .maybeSingle()
        if (!active) return
        if (error) return
        setIsArchived(!!data?.is_archived)
      } catch {}
    }
    if (chatId && currentUserId) loadFlags()
    return () => { active = false }
  }, [chatId, currentUserId])

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
      await leaveConversation(chatId)
      toast({ title: 'Left conversation' })
      onEnded?.('left')
      try { router.push('/messages') } catch {}
    } catch (e) {
      toast({ title: 'Failed to end chat', description: e instanceof Error ? e.message : String(e), variant: 'destructive' })
      onEnded?.('failed')
    }
  }

  const handleToggleArchive = async (next: boolean) => {
    try {
      await archiveConversation(chatId, next)
      setIsArchived(next)
      toast({ title: next ? 'Conversation archived' : 'Conversation unarchived' })
      if (next) {
        // If archiving, navigate away
        try { router.push('/messages') } catch {}
        onEnded?.('archived')
      }
    } catch (e) {
      toast({ title: 'Failed to toggle archive', description: e instanceof Error ? e.message : String(e), variant: 'destructive' })
    }
  }

  const handleInvite = () => {
    setInviteOpen(true)
  }

  const handleConfirmInvite = async (ids: string[]) => {
    if (!ids || ids.length === 0) return
    try {
      await inviteParticipants(chatId, ids)
      toast({ title: 'Participants invited' })
    } catch (e) {
      toast({ title: 'Failed to invite', description: e instanceof Error ? e.message : String(e), variant: 'destructive' })
    }
  }

  return (
    <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={className ?? 'p-2 rounded-md hover:bg-gray-100'}
          aria-label="Conversation options"
          title="Conversation options"
        >
          <Icon name="more-vertical" className="w-5 h-5 text-gray-600" />
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
        <DropdownMenuItem onClick={handleInvite}>Invite participants…</DropdownMenuItem>
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
        <DropdownMenuCheckboxItem checked={isArchived} onCheckedChange={(v) => handleToggleArchive(!!v)}>
          {isArchived ? 'Unarchive conversation' : 'Archive conversation'}
        </DropdownMenuCheckboxItem>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem variant="destructive">End chat</DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {creatorUserId && creatorUserId === currentUserId ? 'Delete conversation?' : 'Leave conversation?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {creatorUserId && creatorUserId === currentUserId
                  ? 'This action cannot be undone. This will permanently delete the conversation and its messages for everyone.'
                  : 'You will leave this conversation. You can be invited back later.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleEndChat}>
                {creatorUserId && creatorUserId === currentUserId ? 'Delete' : 'Leave'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
    <UserSelectorDialog
      open={inviteOpen}
      onOpenChange={setInviteOpen}
      onConfirm={handleConfirmInvite}
      chatId={chatId}
      currentUserId={currentUserId}
    />
    </>
  )
}
