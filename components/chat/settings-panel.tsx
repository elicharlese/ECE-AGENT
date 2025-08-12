"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Globe,
  MessageSquare,
  Download,
  Trash2,
  Moon,
  Sun,
  Monitor,
} from "lucide-react"

interface SettingsState {
  theme: "light" | "dark" | "system"
  language: string
  notifications: {
    enabled: boolean
    sound: boolean
    desktop: boolean
    mobile: boolean
    messagePreview: boolean
  }
  privacy: {
    readReceipts: boolean
    lastSeen: boolean
    profilePhoto: "everyone" | "contacts" | "nobody"
    status: "everyone" | "contacts" | "nobody"
  }
  chat: {
    enterToSend: boolean
    fontSize: number
    autoDownload: boolean
    messageHistory: number // days
    autoDelete: boolean
    autoDeleteDays: number
  }
}

const defaultSettings: SettingsState = {
  theme: "system",
  language: "en",
  notifications: {
    enabled: true,
    sound: true,
    desktop: true,
    mobile: true,
    messagePreview: true,
  },
  privacy: {
    readReceipts: true,
    lastSeen: true,
    profilePhoto: "everyone",
    status: "everyone",
  },
  chat: {
    enterToSend: true,
    fontSize: 14,
    autoDownload: true,
    messageHistory: 30,
    autoDelete: false,
    autoDeleteDays: 7,
  },
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
]

export function SettingsPanel() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings)
  const [isOpen, setIsOpen] = useState(false)

  const updateSettings = (section: keyof SettingsState, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  const updateRootSetting = (key: keyof SettingsState, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const exportData = () => {
    // Mock export functionality
    const data = {
      chats: [],
      contacts: [],
      settings: settings,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "chat-data-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      // Mock clear functionality
      console.log("Clearing all data...")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs">
          <Settings className="h-3 w-3 mr-1" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-12">
            <TabsTrigger value="general" className="flex items-center justify-center p-2" title="General">
              <Settings className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center p-2" title="Notifications">
              <Bell className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center justify-center p-2" title="Privacy">
              <Shield className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center justify-center p-2" title="Chat">
              <MessageSquare className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center justify-center p-2" title="Data">
              <Download className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 max-h-[60vh] overflow-y-auto">
            <TabsContent value="general" className="space-y-6">
              {/* Theme Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Appearance</h3>
                </div>
                <div className="space-y-4 pl-7">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={settings.theme} onValueChange={(value) => updateRootSetting("theme", value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Language Settings */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Language & Region</h3>
                </div>
                <div className="space-y-4 pl-7">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="language">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => updateRootSetting("language", value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              {lang.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                  <Switch
                    id="notifications-enabled"
                    checked={settings.notifications.enabled}
                    onCheckedChange={(checked) => updateSettings("notifications", "enabled", checked)}
                  />
                </div>

                {settings.notifications.enabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notification-sound">Sound</Label>
                      <Switch
                        id="notification-sound"
                        checked={settings.notifications.sound}
                        onCheckedChange={(checked) => updateSettings("notifications", "sound", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                      <Switch
                        id="desktop-notifications"
                        checked={settings.notifications.desktop}
                        onCheckedChange={(checked) => updateSettings("notifications", "desktop", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobile-notifications">Mobile Push Notifications</Label>
                      <Switch
                        id="mobile-notifications"
                        checked={settings.notifications.mobile}
                        onCheckedChange={(checked) => updateSettings("notifications", "mobile", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="message-preview">Show Message Preview</Label>
                      <Switch
                        id="message-preview"
                        checked={settings.notifications.messagePreview}
                        onCheckedChange={(checked) => updateSettings("notifications", "messagePreview", checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="read-receipts">Read Receipts</Label>
                  <Switch
                    id="read-receipts"
                    checked={settings.privacy.readReceipts}
                    onCheckedChange={(checked) => updateSettings("privacy", "readReceipts", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="last-seen">Last Seen</Label>
                  <Switch
                    id="last-seen"
                    checked={settings.privacy.lastSeen}
                    onCheckedChange={(checked) => updateSettings("privacy", "lastSeen", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="profile-photo">Who can see my profile photo</Label>
                  <Select
                    value={settings.privacy.profilePhoto}
                    onValueChange={(value) => updateSettings("privacy", "profilePhoto", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="contacts">Contacts</SelectItem>
                      <SelectItem value="nobody">Nobody</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="status">Who can see my status</Label>
                  <Select
                    value={settings.privacy.status}
                    onValueChange={(value) => updateSettings("privacy", "status", value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="contacts">Contacts</SelectItem>
                      <SelectItem value="nobody">Nobody</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enter-to-send">Press Enter to send</Label>
                  <Switch
                    id="enter-to-send"
                    checked={settings.chat.enterToSend}
                    onCheckedChange={(checked) => updateSettings("chat", "enterToSend", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size: {settings.chat.fontSize}px</Label>
                  <Slider
                    id="font-size"
                    min={12}
                    max={20}
                    step={1}
                    value={[settings.chat.fontSize]}
                    onValueChange={([value]) => updateSettings("chat", "fontSize", value)}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-download">Auto-download media</Label>
                  <Switch
                    id="auto-download"
                    checked={settings.chat.autoDownload}
                    onCheckedChange={(checked) => updateSettings("chat", "autoDownload", checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message-history">Keep message history for {settings.chat.messageHistory} days</Label>
                  <Slider
                    id="message-history"
                    min={7}
                    max={365}
                    step={7}
                    value={[settings.chat.messageHistory]}
                    onValueChange={([value]) => updateSettings("chat", "messageHistory", value)}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-delete">Auto-delete messages</Label>
                  <Switch
                    id="auto-delete"
                    checked={settings.chat.autoDelete}
                    onCheckedChange={(checked) => updateSettings("chat", "autoDelete", checked)}
                  />
                </div>

                {settings.chat.autoDelete && (
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    <Label htmlFor="auto-delete-days">Delete after {settings.chat.autoDeleteDays} days</Label>
                    <Slider
                      id="auto-delete-days"
                      min={1}
                      max={30}
                      step={1}
                      value={[settings.chat.autoDeleteDays]}
                      onValueChange={([value]) => updateSettings("chat", "autoDeleteDays", value)}
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="data" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Export Data</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Download a copy of your chat data, contacts, and settings.
                  </p>
                  <Button onClick={exportData} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Permanently delete all your data. This action cannot be undone.
                  </p>
                  <Button onClick={clearAllData} variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
