"use client"
import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs
} from '@/libs/design-system';
import { TabsContent, TabsList, TabsTrigger } from '@/libs/design-system'
// TODO: Replace deprecated components: Tabs
// 
// TODO: Replace deprecated components: Tabs
// import { Tabs } from '@/components/ui/tabs'
import { CheckInOverview } from "./CheckInOverview"
import { RecentMessages } from "./RecentMessages"
import { DocsSection } from "./DocsSection"
import { MentionsSection } from "./MentionsSection"
import { CalendarSync } from "./CalendarSync"
import { ClickUpIntegration } from "./ClickUpIntegration"
import { ProfileSettings } from "./ProfileSettings"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { PinnedDrawerTabs } from "./PinnedDrawerTabs"

export function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState("checkin")
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Profile Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Your personalized workspace overview and integrations
          </p>
        </div>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="checkin" onClick={() => setActiveTab("checkin")}>Check In</TabsTrigger>
          <TabsTrigger value="messages" onClick={() => setActiveTab("messages")}>Messages</TabsTrigger>
          <TabsTrigger value="docs" onClick={() => setActiveTab("docs")}>Documents</TabsTrigger>
          <TabsTrigger value="mentions" onClick={() => setActiveTab("mentions")}>Mentions</TabsTrigger>
          <TabsTrigger value="calendar" onClick={() => setActiveTab("calendar")}>Calendar</TabsTrigger>
          <TabsTrigger value="tasks" onClick={() => setActiveTab("tasks")}>Tasks</TabsTrigger>
          <TabsTrigger value="settings" onClick={() => setActiveTab("settings")}>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="checkin" className="space-y-6">
          <ErrorBoundary>
            <CheckInOverview />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <ErrorBoundary>
            <RecentMessages />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <ErrorBoundary>
            <DocsSection />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="mentions" className="space-y-6">
          <ErrorBoundary>
            <MentionsSection />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <ErrorBoundary>
            <CalendarSync />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <ErrorBoundary>
            <ClickUpIntegration />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <ErrorBoundary>
            <ProfileSettings />
          </ErrorBoundary>
        </TabsContent>
      </Tabs>

      {/* Pinned quick actions: agent chat and wallet manager */}
      <PinnedDrawerTabs />
    </div>
  )
}
