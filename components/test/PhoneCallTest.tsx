"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  Signal,
  Headphones,
  Speaker
} from "lucide-react"
import { useUser } from "@/hooks/use-user"

interface CallState {
  isConnected: boolean
  isAudioEnabled: boolean
  isSpeakerEnabled: boolean
  isHeadphonesConnected: boolean
  phoneNumber: string
  callDuration: number
  signalStrength: number
  callQuality: 'excellent' | 'good' | 'fair' | 'poor'
}

export function PhoneCallTest() {
  const { user } = useUser()
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isAudioEnabled: true,
    isSpeakerEnabled: false,
    isHeadphonesConnected: false,
    phoneNumber: '',
    callDuration: 0,
    signalStrength: 4,
    callQuality: 'excellent'
  })
  const [phoneInput, setPhoneInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (callState.isConnected) {
      interval = setInterval(() => {
        setCallState(prev => ({
          ...prev,
          callDuration: prev.callDuration + 1,
          signalStrength: Math.max(1, Math.min(5, prev.signalStrength + (Math.random() - 0.5))),
          callQuality: prev.signalStrength > 4 ? 'excellent' : 
                      prev.signalStrength > 3 ? 'good' : 
                      prev.signalStrength > 2 ? 'fair' : 'poor'
        }))
      }, 1000)
    }
    return () => { if (interval) clearInterval(interval) }
  }, [callState.isConnected])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const handleStartCall = async () => {
    if (!phoneInput.trim()) {
      setError('Please enter a phone number')
      return
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    const cleanedPhone = phoneInput.replace(/\D/g, '')
    if (cleanedPhone.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call to start call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setCallState(prev => ({
        ...prev,
        isConnected: true,
        phoneNumber: phoneInput,
        callDuration: 0,
        signalStrength: 4 + Math.random(),
        callQuality: 'excellent'
      }))
    } catch (err) {
      setError('Failed to start call. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleEndCall = () => {
    setCallState(prev => ({
      ...prev,
      isConnected: false,
      phoneNumber: '',
      callDuration: 0,
      signalStrength: 4,
      callQuality: 'excellent'
    }))
  }

  const toggleAudio = () => {
    setCallState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }))
  }

  const toggleSpeaker = () => {
    setCallState(prev => ({ ...prev, isSpeakerEnabled: !prev.isSpeakerEnabled }))
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSignalBars = (strength: number) => {
    const bars = Math.round(strength)
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-1 bg-current ${
          i < bars ? 'opacity-100' : 'opacity-20'
        }`}
        style={{ height: `${(i + 1) * 3 + 2}px` }}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Call Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Call Status
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
                  Phone Number
                </label>
                <Input
                  placeholder="Enter phone number (e.g., +1 555-123-4567)"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}
              
              <Button 
                onClick={handleStartCall} 
                disabled={loading}
                className="gap-2"
              >
                <PhoneCall className="h-4 w-4" />
                {loading ? 'Calling...' : 'Start Call'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Calling: {formatPhoneNumber(callState.phoneNumber)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Duration: {formatDuration(callState.callDuration)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Signal className="h-4 w-4 text-gray-500" />
                    <div className="flex items-end gap-px h-4">
                      {getSignalBars(callState.signalStrength)}
                    </div>
                  </div>
                  <Badge variant="outline" className={getQualityColor(callState.callQuality)}>
                    {callState.callQuality}
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={handleEndCall} 
                variant="destructive"
                className="gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                End Call
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Audio Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                {callState.isAudioEnabled ? (
                  <Mic className="h-5 w-5 text-green-600" />
                ) : (
                  <MicOff className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">Microphone</span>
              </div>
              <Switch
                checked={callState.isAudioEnabled}
                onCheckedChange={toggleAudio}
                disabled={!callState.isConnected}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                {callState.isSpeakerEnabled ? (
                  <Speaker className="h-5 w-5 text-blue-600" />
                ) : (
                  <Volume2 className="h-5 w-5 text-gray-600" />
                )}
                <span className="font-medium">Speaker</span>
              </div>
              <Switch
                checked={callState.isSpeakerEnabled}
                onCheckedChange={toggleSpeaker}
                disabled={!callState.isConnected}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Headphones className={`h-5 w-5 ${callState.isHeadphonesConnected ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className="font-medium">Headphones</span>
              </div>
              <Badge variant={callState.isHeadphonesConnected ? 'default' : 'secondary'}>
                {callState.isHeadphonesConnected ? 'Connected' : 'Not Detected'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Simulation */}
      <Card>
        <CardHeader>
          <CardTitle>Call Simulation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
              {callState.isConnected ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <PhoneCall className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Call in Progress
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Audio streaming to {formatPhoneNumber(callState.phoneNumber)}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live Audio</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
                    <Phone className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-500">
                    No Active Call
                  </h3>
                  <p className="text-sm text-gray-400">
                    Enter a phone number to start a call
                  </p>
                </div>
              )}
            </div>

            {callState.isConnected && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Call Quality:</span>
                  <p className={`capitalize ${getQualityColor(callState.callQuality)}`}>
                    {callState.callQuality}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Signal Strength:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {Math.round(callState.signalStrength)}/5 bars
                  </p>
                </div>
              </div>
            )}
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
              <span className="font-medium text-gray-700 dark:text-gray-300">User:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.email || 'Not authenticated'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Audio Support:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {typeof navigator !== 'undefined' && navigator.mediaDevices ? 'WebRTC Audio Supported' : 'Audio Not Available'}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Connection:</span>
              <Badge variant={callState.isConnected ? 'default' : 'secondary'}>
                {callState.isConnected ? 'Active Call' : 'No Call'}
              </Badge>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Audio Output:</span>
              <p className="text-gray-600 dark:text-gray-400">
                {callState.isSpeakerEnabled ? 'Speaker' : callState.isHeadphonesConnected ? 'Headphones' : 'Default'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
