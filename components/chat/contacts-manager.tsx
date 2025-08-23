"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  UserPlus,
  Users,
  MessageCircle,
  Phone,
  Video,
  MoreHorizontal,
  Mail,
  User,
  Smartphone,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PhoneCallUI } from "../calls/phone-call-ui"
import { VideoCallUI } from "../calls/video-call-ui"
import { supabase } from "@/lib/supabase/client"
import { profileService, type Profile } from "@/services/profile-service"

interface Contact {
  id: string
  username: string
  name: string
  phone?: string
  avatar?: string
  status: "online" | "away" | "busy" | "offline"
  customStatus?: string
  lastSeen?: Date
  isFavorite: boolean
  company?: string
  notes?: string
}

interface ContactsManagerProps {
  // Pass a user identifier (username or email) to start a DM
  onStartChat: (identifier: string) => void
}

export function ContactsManager({ onStartChat }: ContactsManagerProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [activePhoneCall, setActivePhoneCall] = useState<Contact | null>(null)
  const [activeVideoCall, setActiveVideoCall] = useState<Contact | null>(null)

  // Map profiles -> contacts, preserving favorites
  const contacts = useMemo<Contact[]>(() => {
    const favs = favoriteIds
    return profiles.map((p) => ({
      id: p.user_id,
      username: p.username,
      name: p.full_name || p.username,
      avatar: p.avatar_url || undefined,
      status: "offline",
      isFavorite: favs.has(p.user_id),
    }))
  }, [profiles, favoriteIds])

  // Fetch profiles on mount and when search changes
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const data = await profileService.listProfiles({ search: searchQuery, excludeSelf: true, limit: 100 })
      if (!cancelled) setProfiles(data)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [searchQuery])

  // Realtime: refresh on any profile change
  useEffect(() => {
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        profileService.listProfiles({ search: searchQuery, excludeSelf: true, limit: 100 }).then(setProfiles)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [searchQuery])

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const favoriteContacts = filteredContacts.filter((contact) => contact.isFavorite)
  const regularContacts = filteredContacts.filter((contact) => !contact.isFavorite)

  // Favorites are kept client-side for now
  const toggleFavorite = (contactId: string) => {
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (next.has(contactId)) next.delete(contactId)
      else next.add(contactId)
      return next
    })
  }

  const handlePhoneCall = (contact: Contact) => {
    setActivePhoneCall(contact)
  }

  const handleVideoCall = (contact: Contact) => {
    setActiveVideoCall(contact)
  }

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    offline: "bg-gray-400",
  }

  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>AGENT - Contacts</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="all">All Contacts</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="flex-1 flex flex-col min-h-0 space-y-4">
            {/* Search */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
              {/* Favorites */}
              {favoriteContacts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">FAVORITES</h3>
                  <div className="space-y-2">
                    {favoriteContacts.map((contact) => (
                      <ContactItem
                        key={contact.id}
                        contact={contact}
                        onStartChat={onStartChat}
                        onToggleFavorite={toggleFavorite}
                        onPhoneCall={handlePhoneCall}
                        onVideoCall={handleVideoCall}
                        formatLastSeen={formatLastSeen}
                        statusColors={statusColors}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Contacts */}
              {regularContacts.length > 0 && (
                <div>
                  {favoriteContacts.length > 0 && (
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ALL CONTACTS</h3>
                  )}
                  <div className="space-y-2">
                    {regularContacts.map((contact) => (
                      <ContactItem
                        key={contact.id}
                        contact={contact}
                        onStartChat={onStartChat}
                        onToggleFavorite={toggleFavorite}
                        onPhoneCall={handlePhoneCall}
                        onVideoCall={handleVideoCall}
                        formatLastSeen={formatLastSeen}
                        statusColors={statusColors}
                      />
                    ))}
                  </div>
                </div>
              )}

              {filteredContacts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No contacts found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {favoriteContacts.map((contact) => (
                <ContactItem
                  key={contact.id}
                  contact={contact}
                  onStartChat={onStartChat}
                  onToggleFavorite={toggleFavorite}
                  onPhoneCall={handlePhoneCall}
                  onVideoCall={handleVideoCall}
                  formatLastSeen={formatLastSeen}
                  statusColors={statusColors}
                />
              ))}
              {favoriteContacts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No favorite contacts yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
      {activePhoneCall && (
        <PhoneCallUI
          isOpen={!!activePhoneCall}
          onClose={() => setActivePhoneCall(null)}
          contact={activePhoneCall}
          callType="outgoing"
        />
      )}

      {activeVideoCall && (
        <VideoCallUI
          isOpen={!!activeVideoCall}
          onClose={() => setActiveVideoCall(null)}
          contact={activeVideoCall}
          callType="outgoing"
        />
      )}
    </Dialog>
  )
}

interface ContactItemProps {
  contact: Contact
  onStartChat: (identifier: string) => void
  onToggleFavorite: (contactId: string) => void
  onPhoneCall: (contact: Contact) => void
  onVideoCall: (contact: Contact) => void
  formatLastSeen: (date: Date) => string
  statusColors: Record<string, string>
}

function ContactItem({
  contact,
  onStartChat,
  onToggleFavorite,
  onPhoneCall,
  onVideoCall,
  formatLastSeen,
  statusColors,
}: ContactItemProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={contact.avatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {contact.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${statusColors[contact.status]} border-2 border-white dark:border-gray-800 rounded-full`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">{contact.name}</h3>
          {contact.isFavorite && (
            <Badge variant="secondary" className="text-xs">
              ★
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">@{contact.username}</p>
        {contact.customStatus && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.customStatus}</p>
        )}
        {contact.status === "offline" && contact.lastSeen && (
          <p className="text-xs text-gray-500 dark:text-gray-400">Last seen {formatLastSeen(contact.lastSeen)}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {/* Use username to start DM */}
        <Button variant="ghost" size="sm" onClick={() => onStartChat(contact.username)}>
          <MessageCircle className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onPhoneCall(contact)}>
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onVideoCall(contact)}>
          <Video className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleFavorite(contact.id)}>
              {contact.isFavorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuItem>View profile</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">Remove contact</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
