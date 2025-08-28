"use client"

import { useState } from "react"
import { 
  Mail, 
  AtSign, 
  Wallet, 
  UserPlus,
  Search,
  X,
  Check,
  Copy,
  Share2,
  QrCode
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface InviteUsersDialogProps {
  isOpen: boolean
  onClose: () => void
  chatId: string
  chatName: string
  isGroupChat?: boolean
  onInviteUsers: (users: InviteUser[]) => Promise<void>
}

interface InviteUser {
  id?: string
  identifier: string
  type: "email" | "username" | "wallet"
  name?: string
  avatar?: string
}

export function InviteUsersDialog({
  isOpen,
  onClose,
  chatId,
  chatName,
  isGroupChat = false,
  onInviteUsers
}: InviteUsersDialogProps) {
  const [activeTab, setActiveTab] = useState("email")
  const [emailInput, setEmailInput] = useState("")
  const [usernameInput, setUsernameInput] = useState("")
  const [walletInput, setWalletInput] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<InviteUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<InviteUser[]>([])
  const [customMessage, setCustomMessage] = useState("")
  const [isInviting, setIsInviting] = useState(false)
  const [shareLink, setShareLink] = useState("")

  // Generate share link
  const generateShareLink = () => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/join/${chatId}?invite=${Date.now()}`
    setShareLink(link)
    return link
  }

  // Search for users
  const searchUsers = async (query: string, type: "email" | "username" | "wallet") => {
    setIsSearching(true)
    
    // Simulate API search
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const mockResults: InviteUser[] = [
      {
        id: "user-1",
        identifier: type === "email" ? "john@example.com" : type === "username" ? "@johndoe" : "0x1234...5678",
        type,
        name: "John Doe",
        avatar: "/placeholder.svg"
      },
      {
        id: "user-2",
        identifier: type === "email" ? "jane@example.com" : type === "username" ? "@janesmith" : "0x8765...4321",
        type,
        name: "Jane Smith"
      }
    ].filter(user => 
      user.identifier.toLowerCase().includes(query.toLowerCase()) ||
      user.name?.toLowerCase().includes(query.toLowerCase())
    )
    
    setSearchResults(mockResults)
    setIsSearching(false)
  }

  // Add user to selection
  const addUser = (user: InviteUser) => {
    if (!selectedUsers.find(u => u.identifier === user.identifier)) {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  // Remove user from selection
  const removeUser = (identifier: string) => {
    setSelectedUsers(selectedUsers.filter(u => u.identifier !== identifier))
  }

  // Add custom email/username/wallet
  const addCustomUser = (type: "email" | "username" | "wallet") => {
    let identifier = ""
    let isValid = false
    
    switch (type) {
      case "email":
        identifier = emailInput.trim()
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
        break
      case "username":
        identifier = usernameInput.trim()
        if (!identifier.startsWith("@")) identifier = "@" + identifier
        isValid = /^@[\w\d_]{3,}$/.test(identifier)
        break
      case "wallet":
        identifier = walletInput.trim()
        isValid = /^0x[a-fA-F0-9]{40}$/.test(identifier) || /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(identifier)
        break
    }
    
    if (isValid && !selectedUsers.find(u => u.identifier === identifier)) {
      addUser({ identifier, type })
      
      // Clear input
      switch (type) {
        case "email":
          setEmailInput("")
          break
        case "username":
          setUsernameInput("")
          break
        case "wallet":
          setWalletInput("")
          break
      }
    }
  }

  // Send invitations
  const handleInvite = async () => {
    if (selectedUsers.length === 0) return
    
    setIsInviting(true)
    try {
      await onInviteUsers(selectedUsers)
      toast({
        title: "Invitations sent!",
        description: `Successfully invited ${selectedUsers.length} user${selectedUsers.length > 1 ? 's' : ''} to ${chatName}`,
      })
      onClose()
    } catch (error) {
      toast({
        title: "Failed to send invitations",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsInviting(false)
    }
  }

  // Copy share link
  const copyShareLink = () => {
    const link = shareLink || generateShareLink()
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied!",
      description: "Share link has been copied to clipboard"
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite to {chatName}</DialogTitle>
          <DialogDescription>
            Invite users via email, username, or wallet address
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </TabsTrigger>
            <TabsTrigger value="username">
              <AtSign className="h-4 w-4 mr-1" />
              Username
            </TabsTrigger>
            <TabsTrigger value="wallet">
              <Wallet className="h-4 w-4 mr-1" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="link">
              <Share2 className="h-4 w-4 mr-1" />
              Link
            </TabsTrigger>
          </TabsList>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomUser("email")}
                />
                <Button 
                  onClick={() => addCustomUser("email")}
                  disabled={!emailInput.trim()}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Enter email addresses to invite users. They'll receive an invitation link.
              </p>
            </div>
            
            {emailInput.length > 2 && (
              <div className="space-y-2">
                <Label>Search Results</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => searchUsers(emailInput, "email")}
                  disabled={isSearching}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search existing users
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Username Tab */}
          <TabsContent value="username" className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCustomUser("username")}
                    className="pl-9"
                  />
                </div>
                <Button 
                  onClick={() => addCustomUser("username")}
                  disabled={!usernameInput.trim()}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Enter usernames without the @ symbol
              </p>
            </div>
            
            {usernameInput.length > 2 && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => searchUsers(usernameInput, "username")}
                  disabled={isSearching}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search users
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-4">
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="0x... or crypto address"
                  value={walletInput}
                  onChange={(e) => setWalletInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomUser("wallet")}
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={() => addCustomUser("wallet")}
                  disabled={!walletInput.trim()}
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Supports Ethereum, Solana, and other wallet addresses
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR
              </Button>
            </div>
          </TabsContent>

          {/* Share Link Tab */}
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareLink || "Click generate to create invite link"}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={generateShareLink}
                  variant="outline"
                >
                  Generate
                </Button>
                <Button
                  onClick={copyShareLink}
                  disabled={!shareLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Share this link to invite anyone to the {isGroupChat ? 'group' : 'chat'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Custom Message (Optional)</Label>
              <Textarea
                placeholder="Add a personal message to your invitation..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 mt-4">
            <Label>Search Results</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {searchResults.map(user => (
                <div
                  key={user.identifier}
                  className="flex items-center justify-between p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name?.[0] || user.identifier[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name || user.identifier}</p>
                      <p className="text-xs text-gray-500">{user.identifier}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => addUser(user)}
                    disabled={selectedUsers.find(u => u.identifier === user.identifier) !== undefined}
                  >
                    {selectedUsers.find(u => u.identifier === user.identifier) ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2 mt-4">
            <Label>Selected Users ({selectedUsers.length})</Label>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <Badge
                  key={user.identifier}
                  variant="secondary"
                  className="pl-2 pr-1 py-1"
                >
                  <span className="mr-1">{user.identifier}</span>
                  <button
                    onClick={() => removeUser(user.identifier)}
                    className="ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleInvite}
            disabled={selectedUsers.length === 0 || isInviting}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Send Invitations ({selectedUsers.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
