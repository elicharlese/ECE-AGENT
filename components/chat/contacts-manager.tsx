"use client"

import { useState } from "react"
import {
  Button,
  DropdownMenu,
  Label,
  Select,
  Tabs,
  Textarea
} from '@/libs/design-system';
import { Input } from '@/libs/design-system'
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { TabsContent, TabsList, TabsTrigger } from '@/libs/design-system'
// TODO: Replace deprecated components: Tabs
// 
// TODO: Replace deprecated components: Tabs
// import { Tabs } from '@/components/ui/tabs'

// TODO: Replace deprecated components: Label
// 
// TODO: Replace deprecated components: Label
// import { Label } from '@/components/ui/label'

// TODO: Replace deprecated components: Textarea
// 
// TODO: Replace deprecated components: Textarea
// import { Textarea } from '@/components/ui/textarea'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/libs/design-system'
// TODO: Replace deprecated components: Select
// 
// TODO: Replace deprecated components: Select
// import { Select } from '@/components/ui/select'
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
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/libs/design-system'
// TODO: Replace deprecated components: DropdownMenu
// 
// TODO: Replace deprecated components: DropdownMenu
// import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { PhoneCallUI } from "../calls/phone-call-ui"
import { VideoCallUI } from "../calls/video-call-ui"

interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  status: "online" | "away" | "busy" | "offline"
  customStatus?: string
  lastSeen?: Date
  isFavorite: boolean
  company?: string
  notes?: string
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    phone: "+1 (555) 234-5678",
    status: "online",
    customStatus: "Working from home 🏠",
    isFavorite: true,
  },
  {
    id: "2",
    name: "Alex Chen",
    email: "alex.chen@example.com",
    status: "away",
    lastSeen: new Date(Date.now() - 1000 * 60 * 15),
    isFavorite: false,
  },
  {
    id: "3",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    phone: "+1 (555) 345-6789",
    status: "busy",
    customStatus: "In a meeting",
    isFavorite: true,
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@example.com",
    status: "offline",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isFavorite: false,
  },
  {
    id: "5",
    name: "Emma Thompson",
    email: "emma.thompson@example.com",
    status: "online",
    isFavorite: false,
  },
]

interface ContactsManagerProps {
  onStartChat: (contactId: string) => void
}

export function ContactsManager({ onStartChat }: ContactsManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts)
  const [searchQuery, setSearchQuery] = useState("")
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
    status: "offline" as const,
  })
  const [activePhoneCall, setActivePhoneCall] = useState<Contact | null>(null)
  const [activeVideoCall, setActiveVideoCall] = useState<Contact | null>(null)

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const favoriteContacts = filteredContacts.filter((contact) => contact.isFavorite)
  const regularContacts = filteredContacts.filter((contact) => !contact.isFavorite)

  const handleAddContact = () => {
    if (!newContact.email.trim() || !newContact.name.trim()) return

    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      email: newContact.email,
      phone: newContact.phone || undefined,
      company: newContact.company || undefined,
      notes: newContact.notes || undefined,
      status: newContact.status,
      isFavorite: false,
    }

    setContacts([...contacts, contact])
    setNewContact({
      name: "",
      email: "",
      phone: "",
      company: "",
      notes: "",
      status: "offline",
    })
  }

  const toggleFavorite = (contactId: string) => {
    setContacts(
      contacts.map((contact) => (contact.id === contactId ? { ...contact, isFavorite: !contact.isFavorite } : contact)),
    )
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
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="all">All Contacts</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="add">Add Contact</TabsTrigger>
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
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">FAVORITES</h3>
                  <div className="rounded-lg border border-border bg-card p-3 sm:p-4 space-y-3">
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
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">ALL CONTACTS</h3>
                  )}
                  <div className="rounded-lg border border-border bg-card p-3 sm:p-4 space-y-3">
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
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="rounded-lg border border-border bg-card p-6 sm:p-8 space-y-6">
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
            </div>
          </TabsContent>

          <TabsContent value="add" className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name..."
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address..."
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number..."
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Enter company name..."
                    value={newContact.company}
                    onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={newContact.status}
                    onValueChange={(value: any) => setNewContact({ ...newContact, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="away">Away</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this contact..."
                    value={newContact.notes}
                    onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              <Button
                onClick={handleAddContact}
                className="w-full"
                disabled={!newContact.name.trim() || !newContact.email.trim()}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
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
  onStartChat: (contactId: string) => void
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
        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{contact.email}</p>
        {contact.customStatus && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{contact.customStatus}</p>
        )}
        {contact.status === "offline" && contact.lastSeen && (
          <p className="text-xs text-gray-500 dark:text-gray-400">Last seen {formatLastSeen(contact.lastSeen)}</p>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onStartChat(contact.id)}>
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
