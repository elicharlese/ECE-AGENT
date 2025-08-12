"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Edit, Save, X } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  bio: string
  avatar?: string
  status: "online" | "away" | "busy" | "offline"
  customStatus?: string
}

const mockUser: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  bio: "Software developer passionate about creating amazing user experiences.",
  status: "online",
  customStatus: "Working on something cool 🚀",
}

interface UserProfileProps {
  user?: UserProfile
  isOwnProfile?: boolean
}

export function UserProfile({ user = mockUser, isOwnProfile = true }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState<UserProfile>(user)

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log("Saving user profile:", editedUser)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
  }

  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    offline: "bg-gray-400",
  }

  const statusLabels = {
    online: "Online",
    away: "Away",
    busy: "Busy",
    offline: "Offline",
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="h-auto p-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 ${statusColors[user.status]} border-2 border-white dark:border-gray-800 rounded-full`}
              />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{statusLabels[user.status]}</p>
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            AGENT - {isOwnProfile ? "Your Profile" : user.name}
            {isOwnProfile && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={editedUser.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {editedUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full" variant="secondary">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 ${statusColors[editedUser.status]} rounded-full`} />
              {isEditing ? (
                <Select
                  value={editedUser.status}
                  onValueChange={(value) => setEditedUser({ ...editedUser, status: value as UserProfile["status"] })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary">{statusLabels[editedUser.status]}</Badge>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={editedUser.name}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{editedUser.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={editedUser.email}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{editedUser.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editedUser.phone}
                  onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{editedUser.phone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customStatus">Custom Status</Label>
              {isEditing ? (
                <Input
                  id="customStatus"
                  value={editedUser.customStatus || ""}
                  onChange={(e) => setEditedUser({ ...editedUser, customStatus: e.target.value })}
                  placeholder="What's on your mind?"
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {editedUser.customStatus || "No custom status"}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editedUser.bio}
                  onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{editedUser.bio}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
