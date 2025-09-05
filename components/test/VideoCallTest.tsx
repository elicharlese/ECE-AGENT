"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch
} from '@/libs/design-system';
import { Button } from '@/libs/design-system'
import { Input } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'

// TODO: Replace deprecated components: Switch
// 
// TODO: Replace deprecated components: Switch
// import { Switch } from '@/components/ui/switch'
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Settings, 
  Users,
  Monitor,
  Camera,
  Volume2,
  VolumeX
} from "lucide-react"
import { useUser } from "@/hooks/use-user"

interface CallState {
  isConnected: boolean
  isVideoEnabled: boolean
  isAudioEnabled: boolean
  isSpeakerEnabled: boolean
  isScreenSharing: boolean
  participants: number
  roomName: string
  callDuration: number
}

export function VideoCallTest() {
  const { user } = useUser()
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isVideoEnabled: true,
    isAudioEnabled: true,
    isSpeakerEnabled: true,
    isScreenSharing: false,
    participants: 0,
    roomName: '',
    callDuration: 0
  })
  const [roomInput, setRoomInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (callState.isConnected) {
      interval = setInterval(() => {
        setCallState(prev => ({ ...prev, callDuration: prev.callDuration + 1 }))
      }, 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [callState.isConnected])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleJoinCall = async () => {
    if (!roomInput.trim()) {
      setError('Please enter a room name')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call to join room
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setCallState(prev => ({
        ...prev,
        isConnected: true,
        roomName: roomInput,
        participants: Math.floor(Math.random() * 5) + 1,
        callDuration: 0
      }))
    } catch (err) {
      setError('Failed to join call. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveCall = () => {
    setCallState({
      isConnected: false,
      isVideoEnabled: true,
      isAudioEnabled: true,
      isSpeakerEnabled: true,
      isScreenSharing: false,
      participants: 0,
      roomName: '',
      callDuration: 0
    })
  }

  const toggleVideo = () => {
    setCallState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }))
  }

  const toggleAudio = () => {
    setCallState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }))
  }

  const toggleSpeaker = () => {
    setCallState(prev => ({ ...prev, isSpeakerEnabled: !prev.isSpeakerEnabled }))
  }

  const toggleScreenShare = () => {
    setCallState(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }))
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Call Status
            {callState.isConnected && (
              <Badge variant="default" className="ml-2">
                Connected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!callState.isConnected ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Room Name
                </label>
                <Input
                  placeholder="Enter room name (e.g., team-meeting)"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handleJoinCall} 
                disabled={loading}
                className="gap-2"
              >
                <Video className="h-4 w-4" />
                {loading ? 'Joining...' : 'Join Video Call'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Room: {callState.roomName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Duration: {formatDuration(callState.callDuration)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {callState.participants} participants
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={handleLeaveCall} 
                variant="destructive"
                className="gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                Leave Call
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Video Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {callState.isVideoEnabled ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-75">Camera feed would appear here</p>
                  <p className="text-xs opacity-50 mt-1">
                    User: {user?.email || 'Unknown'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-center text-gray-400">
                  <VideoOff className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Camera is off</p>
                </div>
              </div>
            )}
            
            {callState.isScreenSharing && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="gap-1">
                  <Monitor className="h-3 w-3" />
                  Screen Sharing
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Call Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Call Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {callState.isVideoEnabled ? (
                  <Video className="h-4 w-4 text-green-600" />
                ) : (
                  <VideoOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">Video</span>
              </div>
              <Switch
                checked={callState.isVideoEnabled}
                onCheckedChange={toggleVideo}
                disabled={!callState.isConnected}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {callState.isAudioEnabled ? (
                  <Mic className="h-4 w-4 text-green-600" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">Audio</span>
              </div>
              <Switch
                checked={callState.isAudioEnabled}
                onCheckedChange={toggleAudio}
                disabled={!callState.isConnected}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {callState.isSpeakerEnabled ? (
                  <Volume2 className="h-4 w-4 text-green-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">Speaker</span>
              </div>
              <Switch
                checked={callState.isSpeakerEnabled}
                onCheckedChange={toggleSpeaker}
                disabled={!callState.isConnected}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Monitor className={`h-4 w-4 ${callState.isScreenSharing ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">Screen</span>
              </div>
              <Switch
                checked={callState.isScreenSharing}
                onCheckedChange={toggleScreenShare}
                disabled={!callState.isConnected}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Environment Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">LiveKit URL:</span>
              <p className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                {process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || 'Not configured'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">User:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.email || 'Not authenticated'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Browser Support:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {typeof navigator !== 'undefined' && navigator.mediaDevices ? 'WebRTC Supported' : 'WebRTC Not Available'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Connection:</span>
              <Badge variant={callState.isConnected ? 'default' : 'secondary'}>
                {callState.isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
