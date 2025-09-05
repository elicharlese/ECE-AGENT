"use client"

import { useState } from "react"
import { CreditBadge } from "@/components/credits/CreditBadge"
import { BuyCreditsButton } from "@/components/credits/BuyCreditsButton"
import {
  Drawer,
  PopoverContent,
  PopoverTrigger
} from '@/libs/design-system';
// TODO: Replace deprecated components: Popover
// 
// TODO: Replace deprecated components: Popover
// import { Popover } from '@/components/ui/popover'
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/libs/design-system'
// TODO: Replace deprecated components: Drawer
// 
// TODO: Replace deprecated components: Drawer
// import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/libs/design-system'
import { AgentExecutor } from "@/components/agents/agent-executor"
import { Bell, Zap } from "lucide-react"
import { Popover } from '@/libs/design-system';

// A thin, fixed footer bar for the Messages page with
// - Credits monitoring + purchase
// - Notifications
// - Agent progress viewer
// Tailwind-only, minimal height, blends with app background

export function ChatFooterBar() {
  const [notifOpen, setNotifOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 border-t bg-background/70 backdrop-blur supports-[backdrop-filter]:backdrop-blur shadow-sm">
      <div className="mx-auto max-w-[1400px] px-2 sm:px-3">
        <div className="h-10 flex items-center justify-between gap-2 text-xs">
          {/* Left cluster: lightweight status (placeholder for monitoring) */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="hidden sm:inline">Status:</span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              OK
            </span>
          </div>

          {/* Right cluster: credits, notifications, agent progress */}
          <div className="flex items-center gap-2">
            {/* Credits */}
            <div className="hidden sm:flex items-center gap-2">
              <CreditBadge />
              <BuyCreditsButton label="Buy" size="sm" />
            </div>

            {/* Notifications */}
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-2 text-xs">
                <div className="font-medium mb-1">Notifications</div>
                <div className="rounded border p-2 text-muted-foreground">
                  No notifications yet
                </div>
              </PopoverContent>
            </Popover>

            {/* Agent progress viewer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <Zap className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Agent Progress</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[75vh]">
                <DrawerHeader>
                  <DrawerTitle className="text-sm">Agent Progress</DrawerTitle>
                </DrawerHeader>
                <div className="px-3 pb-4">
                  {/* Demo executor for a default agent; can be wired to the active agent later */}
                  <AgentExecutor
                    agentId="ai-assistant"
                    agentName="AI Assistant"
                    onTaskComplete={() => {}}
                    onTaskError={() => {}}
                  />
                </div>
              </DrawerContent>
            </Drawer>

            {/* Quick buy (mobile-visible) */}
            <div className="sm:hidden">
              <BuyCreditsButton label="Buy" size="sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
