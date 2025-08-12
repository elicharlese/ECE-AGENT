"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MapPin, Users } from "lucide-react"

interface EventPlannerAppProps {
  onShare?: (event: string) => void
}

export function EventPlannerApp({ onShare }: EventPlannerAppProps) {
  const [eventData, setEventData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    attendees: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setEventData((prev) => ({ ...prev, [field]: value }))
  }

  const handleShare = () => {
    const event = `📅 Event: ${eventData.title}
📍 ${eventData.location}
🕐 ${eventData.date} at ${eventData.time}
👥 Attendees: ${eventData.attendees}
📝 ${eventData.description}`

    onShare?.(event)
  }

  const isFormValid = eventData.title && eventData.date && eventData.time

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Event Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            placeholder="Birthday Party, Meeting, etc."
            value={eventData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={eventData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={eventData.time}
              onChange={(e) => handleInputChange("time", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="location"
              placeholder="Conference Room A, Central Park, etc."
              className="pl-10"
              value={eventData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendees">Attendees</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="attendees"
              placeholder="John, Sarah, Mike..."
              className="pl-10"
              value={eventData.attendees}
              onChange={(e) => handleInputChange("attendees", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Additional details about the event..."
            rows={3}
            value={eventData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </div>

        <Button onClick={handleShare} className="w-full" disabled={!isFormValid}>
          Share Event Invitation
        </Button>
      </CardContent>
    </Card>
  )
}
