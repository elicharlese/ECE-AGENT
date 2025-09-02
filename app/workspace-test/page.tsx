"use client"

import * as React from "react"
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar"

export default function WorkspaceTestPage() {
  const [panelState, setPanelState] = React.useState<"expanded" | "minimized" | "collapsed">("expanded")

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="flex-1 p-4">
        <h1 className="text-xl font-semibold mb-4">Workspace Test</h1>
        <div className="space-x-2 mb-4">
          <button
            onClick={() => setPanelState("expanded")}
            className="px-3 py-1 rounded border"
          >
            Expanded
          </button>
          <button
            onClick={() => setPanelState("minimized")}
            className="px-3 py-1 rounded border"
          >
            Minimized
          </button>
          <button
            onClick={() => setPanelState("collapsed")}
            className="px-3 py-1 rounded border"
          >
            Collapsed
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Use the controls to toggle the sidebar state. This page exists only for development/testing.
        </p>
      </div>
      <div className="w-[360px] border-l">
        <WorkspaceSidebar
          panelState={panelState}
          onSetPanelState={setPanelState}
          activeParticipants={2}
          isConnected={true}
          workspaceItems={[]}
        />
      </div>
    </div>
  )
}
