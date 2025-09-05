"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch
} from '@/libs/design-system';
import { Badge } from '@/libs/design-system'
import { Button } from '@/libs/design-system'

// TODO: Replace deprecated components: Switch
// 
// TODO: Replace deprecated components: Switch
// import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Video, 
  Plus,
  Settings,
  RefreshCw,
  ExternalLink,
  AlertCircle
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"

interface CalendarEvent {
  id: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  location?: string
  isVirtual: boolean
  meetingLink?: string
  attendees: Array<{
    name: string
    email: string
    avatar?: string
    status: 'accepted' | 'declined' | 'pending'
  }>
  source: 'google' | 'outlook'
}

interface CalendarIntegration {
  provider: 'google' | 'outlook'
  isConnected: boolean
  email?: string
  lastSync?: Date
  syncEnabled: boolean
}

export function CalendarSync() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([
    {
      provider: 'google',
      isConnected: false,
      syncEnabled: false
    },
    {
      provider: 'outlook',
      isConnected: false,
      syncEnabled: false
    }
  ])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock connected integrations
        setIntegrations([
          {
            provider: 'google',
            isConnected: true,
            email: 'john@company.com',
            lastSync: new Date(Date.now() - 1000 * 60 * 15),
            syncEnabled: true
          },
          {
            provider: 'outlook',
            isConnected: false,
            syncEnabled: false
          }
        ])

        // Mock calendar events
        const mockEvents: CalendarEvent[] = [
          {
            id: "1",
            title: "Team Standup",
            description: "Daily team sync to discuss progress and blockers",
            startTime: new Date(Date.now() + 1000 * 60 * 30), // 30 minutes from now
            endTime: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
            isVirtual: true,
            meetingLink: "https://meet.google.com/abc-defg-hij",
            attendees: [
              { name: "Sarah Chen", email: "sarah@company.com", status: "accepted" },
              { name: "Mike Johnson", email: "mike@company.com", status: "accepted" },
              { name: "Alex Rivera", email: "alex@company.com", status: "pending" }
            ],
            source: 'google'
          },
          {
            id: "2",
            title: "Client Presentation",
            description: "Q4 results presentation to key stakeholders",
            startTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 3), // 3 hours from now
            location: "Conference Room A",
            isVirtual: false,
            attendees: [
              { name: "Emma Davis", email: "emma@company.com", status: "accepted" },
              { name: "Client Team", email: "client@external.com", status: "accepted" }
            ],
            source: 'google'
          },
          {
            id: "3",
            title: "Design Review",
            description: "Review new dashboard mockups and user flow",
            startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 25), // Tomorrow + 1 hour
            isVirtual: true,
            meetingLink: "https://zoom.us/j/123456789",
            attendees: [
              { name: "Design Team", email: "design@company.com", status: "accepted" }
            ],
            source: 'google'
          }
        ]
        
        setEvents(mockEvents)
      } catch (error) {
        console.error('Failed to fetch calendar data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCalendarData()
  }, [])

  const handleConnect = async (provider: 'google' | 'outlook') => {
    try {
      setSyncing(true)
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIntegrations(prev => prev.map(integration => 
        integration.provider === provider 
          ? { 
              ...integration, 
              isConnected: true, 
              email: `john@${provider === 'google' ? 'gmail.com' : 'outlook.com'}`,
              lastSync: new Date(),
              syncEnabled: true
            }
          : integration
      ))
    } catch (error) {
      console.error(`Failed to connect ${provider}:`, error)
    } finally {
      setSyncing(false)
    }
  }

  const handleDisconnect = (provider: 'google' | 'outlook') => {
    setIntegrations(prev => prev.map(integration => 
      integration.provider === provider 
        ? { provider, isConnected: false, syncEnabled: false }
        : integration
    ))
  }

  const handleToggleSync = (provider: 'google' | 'outlook') => {
    setIntegrations(prev => prev.map(integration => 
      integration.provider === provider 
        ? { ...integration, syncEnabled: !integration.syncEnabled }
        : integration
    ))
  }

  const handleManualSync = async () => {
    setSyncing(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIntegrations(prev => prev.map(integration => 
        integration.isConnected 
          ? { ...integration, lastSync: new Date() }
          : integration
      ))
    } catch (error) {
      console.error('Failed to sync calendars:', error)
    } finally {
      setSyncing(false)
    }
  }

  const upcomingEvents = events
    .filter(event => event.startTime > new Date())
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar Sync</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Integration Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar Integrations
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={syncing || !integrations.some(i => i.isConnected)}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((integration) => (
            <div
              key={integration.provider}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white ${
                  integration.provider === 'google' ? 'bg-blue-500' : 'bg-blue-600'
                }`}>
                  {integration.provider === 'google' ? '📅' : '📆'}
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 capitalize">
                    {integration.provider} Calendar
                  </h4>
                  {integration.isConnected ? (
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      <p>{integration.email}</p>
                      {integration.lastSync && (
                        <p>Last sync: {formatDistanceToNow(integration.lastSync, { addSuffix: true })}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Not connected</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {integration.isConnected && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600 dark:text-gray-300">Auto-sync</span>
                    <Switch
                      checked={integration.syncEnabled}
                      onCheckedChange={() => handleToggleSync(integration.provider)}
                    />
                  </div>
                )}
                
                {integration.isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(integration.provider)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(integration.provider)}
                    disabled={syncing}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No upcoming events
            </div>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                  <Calendar className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {event.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {event.source}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(event.startTime, 'MMM d, h:mm a')} - {format(event.endTime, 'h:mm a')}
                    </span>
                    
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                    
                    {event.isVirtual && (
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        Virtual
                      </span>
                    )}
                  </div>
                  
                  {event.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {event.attendees.length} attendees
                      </span>
                    </div>
                    
                    {event.attendees.slice(0, 3).map((attendee, index) => (
                      <Avatar key={index} className="h-5 w-5">
                        <AvatarImage src={attendee.avatar} alt={attendee.name} />
                        <AvatarFallback className="text-xs">
                          {attendee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    
                    {event.attendees.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{event.attendees.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {event.meetingLink && (
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Join
                    </Button>
                  )}
                  
                  {event.startTime.getTime() - Date.now() < 1000 * 60 * 15 && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Soon
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
