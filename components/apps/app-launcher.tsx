"use client"

import type React from "react"

import { useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Grid3X3, Calculator, Music, MapPin, Gamepad2 } from "lucide-react"
import { VerticalDraggableTab } from "@/components/ui/VerticalDraggableTab"

interface InstalledApp {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType<any>
}

const installedApps: InstalledApp[] = [
  {
    id: "calculator",
    name: "Calculator",
    icon: Calculator,
    component: () => <div>Calculator App</div>,
  },
  {
    id: "music-player",
    name: "Music Share",
    icon: Music,
    component: () => <div>Music Player App</div>,
  },
  {
    id: "location-share",
    name: "Location Share",
    icon: MapPin,
    component: () => <div>Location Share App</div>,
  },
]

interface AppLauncherProps {
  onLaunchApp: (appId: string, appName: string) => void
}

export function AppLauncher({ onLaunchApp }: AppLauncherProps) {
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleLaunchApp = (appId: string, appName: string) => {
    setSelectedApp(appId)
    onLaunchApp(appId, appName)
    // Close the drawer after launching
    setOpen(false)
  }

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      {/* Pinned icon-only draggable tab on right edge */}
      <DrawerTrigger asChild>
        <VerticalDraggableTab
          ariaLabel="Open apps drawer"
          icon={<Grid3X3 className="h-5 w-5" />}
          storageKey="apps_tab_top_pct"
          side="right"
          initialTopPercent={35}
        />
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-md">
        <DrawerHeader>
          <DrawerTitle>AGENT - Apps</DrawerTitle>
        </DrawerHeader>

        <div className="grid grid-cols-3 gap-4 p-4">
          {installedApps.map((app) => (
            <button
              key={app.id}
              onClick={() => handleLaunchApp(app.id, app.name)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-3">
                <app.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-medium text-center">{app.name}</span>
            </button>
          ))}

          {/* Add more apps placeholder */}
          <button className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="bg-gray-200 dark:bg-gray-600 rounded-lg p-3">
              <Gamepad2 className="h-6 w-6 text-gray-400" />
            </div>
            <span className="text-xs font-medium text-center text-gray-500">More Apps</span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
