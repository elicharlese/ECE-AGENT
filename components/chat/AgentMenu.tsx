'use client'

import * as React from 'react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/icons/Icon'

export interface AgentMenuProps {
  agentId: string
  showMCPTools: boolean
  onToggleMCPTools: (checked: boolean) => void
  onEnded?: () => void
  className?: string
}

export function AgentMenu({ agentId, showMCPTools, onToggleMCPTools, onEnded, className }: AgentMenuProps) {
  const [muted, setMuted] = React.useState(false)
  const router = useRouter()

  const handleCopyAgentId = async () => {
    try {
      await navigator.clipboard.writeText(agentId)
      toast({ title: 'Agent ID copied' })
    } catch (e) {
      toast({ title: 'Copy failed', description: 'Could not copy Agent ID', variant: 'destructive' })
    }
  }

  const handleEndChat = async () => {
    // For agent chats (no backing conversation), just close session UI and navigate to messages
    onEnded?.()
    toast({ title: 'Chat ended' })
    try {
      router.push('/messages')
    } catch {
      // ignore routing errors in non-routed contexts
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={className ?? 'p-2 hover:bg-gray-100 rounded-lg'}
          aria-label="Agent options"
          title="Agent options"
        >
          <Icon name="more-vertical" className="w-5 h-5 text-gray-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Agent</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCopyAgentId}>
          Copy Agent ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showMCPTools}
          onCheckedChange={(v) => onToggleMCPTools(!!v)}
        >
          Show MCP Tools
        </DropdownMenuCheckboxItem>
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
