'use client'

import { SidebarProvider } from '@/contexts/sidebar-context'
import { IntegratedChatLayout } from '@/components/layout/IntegratedChatLayout'

export default function MessagesPage() {
  return (
    <SidebarProvider>
      <IntegratedChatLayout />
    </SidebarProvider>
  )
}
