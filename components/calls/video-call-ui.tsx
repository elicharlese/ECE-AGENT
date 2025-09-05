"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from '@/libs/design-system'
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'
import { Dialog, DialogContent } from '@/libs/design-system'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  MessageCircle,
  Users,
  Settings,
} from "lucide-react"
import { useHaptics } from "@/hooks/use-haptics"
import { useUser } from "@/contexts/user-context"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"

interface VideoCallUIProps {
  isOpen: boolean
  onClose: () => void
  contact: {
    id: string
    name: string
    avatar?: string
  }
  callType: "incoming" | "outgoing"
}

export function VideoCallUI({ isOpen, onClose, contact, callType }: VideoCallUIProps) {
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">(
    callType === "incoming" ? "ringing" : "connecting",
  )
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const { triggerHaptic } = useHaptics()
  const videoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const { user } = useUser()
  const [lkToken, setLkToken] = useState<string | null>(null)
  const [lkWsUrl, setLkWsUrl] = useState<string | null>(null)
  const [lkLoading, setLkLoading] = useState(false)
  const [lkError, setLkError] = useState<string | null>(null)
  // Stable guest identity across this component's lifetime
  const [guestId] = useState(() => `guest-${Math.random().toString(36).slice(2)}`)
  const [roomConnected, setRoomConnected] = useState(false)

  useEffect(() => {
    if (callStatus === "connected") {
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [callStatus])

  const joinCall = useCallback(async () => {
    try {
      setLkLoading(true)
      setLkError(null)
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: String(contact.id || "default-room"),
          identity: user?.id || guestId,
          metadata: { name: user?.email || "Guest" },
          grants: { canPublish: true, canSubscribe: true, canPublishData: true },
        }),
      })
      const data = await res.json()
      if (!res.ok || !data?.token || !data?.wsUrl) {
        throw new Error(data?.error || "Failed to mint LiveKit token")
      }
      setLkToken(data.token)
      setLkWsUrl(data.wsUrl)
      setCallStatus("connected")
      triggerHaptic("success")
    } catch (e: any) {
      console.error("LiveKit join error", e)
      setLkError(e?.message || "Failed to join LiveKit")
    } finally {
      setLkLoading(false)
    }
  }, [contact.id, triggerHaptic, user?.email, user?.id])

  useEffect(() => {
    if (!isOpen) return
    // Auto-join for outgoing calls when dialog opens
    if (callType === "outgoing" && callStatus === "connecting") {
      joinCall()
    }
  }, [isOpen, callType, callStatus, joinCall])

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    if (showControls && callStatus === "connected") {
      const timer = setTimeout(() => {
        setShowControls(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showControls, callStatus])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = () => {
    setCallStatus("connecting")
    triggerHaptic("success")
    joinCall()
  }

  const handleDecline = () => {
    setCallStatus("ended")
    triggerHaptic("error")
    setTimeout(onClose, 1000)
  }

  const handleEndCall = () => {
    setCallStatus("ended")
    triggerHaptic("error")
    setTimeout(onClose, 1000)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    triggerHaptic("light")
  }

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff)
    triggerHaptic("light")
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    triggerHaptic("light")
  }

  const getStatusText = () => {
    switch (callStatus) {
      case "connecting":
        return "Connecting..."
      case "ringing":
        return "Incoming video call"
      case "connected":
        return formatDuration(duration)
      case "ended":
        return "Call ended"
      default:
        return ""
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className={`${
          isFullscreen ? "max-w-full h-full" : "max-w-4xl h-[600px]"
        } p-0 bg-black text-white border-none overflow-hidden`}
      >
        <div
          className="relative w-full h-full flex flex-col"
          onClick={() => callStatus === "connected" && setShowControls(true)}
        >
          {/* Video Area */}
          <div className="flex-1 relative bg-gray-900">
            {callStatus === "connected" ? (
              <>
                {lkError && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-2 rounded">
                    {lkError}
                  </div>
                )}
                {lkLoading && (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-gray-300">Connecting to room...</p>
                  </div>
                )}
                {!lkLoading && lkToken && lkWsUrl && (
                  <LiveKitRoom
                    key={lkToken}
                    token={lkToken}
                    serverUrl={lkWsUrl}
                    data-lk-theme="default"
                    video={false}
                    audio={false}
                    onConnected={() => setRoomConnected(true)}
                    onDisconnected={() => {
                      setRoomConnected(false)
                      onClose()
                    }}
                  >
                    {roomConnected ? (
                      <VideoConference />
                    ) : (
                      <div className="p-8 text-center text-sm text-gray-300">Connecting…</div>
                    )}
                  </LiveKitRoom>
                )}
              </>
            ) : (
              /* Pre-call State */
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                    {contact.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-2xl font-semibold">AGENT - {contact.name}</h2>
                  <p className="text-gray-400 mt-2">{getStatusText()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
              showControls || callStatus !== "connected" ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center justify-center space-x-6">
              {callStatus === "ringing" && callType === "incoming" ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 border-red-500 text-white"
                    onClick={handleDecline}
                  >
                    <PhoneOff className="h-6 w-6" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 border-green-500 text-white"
                    onClick={handleAnswer}
                  >
                    <Video className="h-6 w-6" />
                  </Button>
                </>
              ) : callStatus === "connecting" ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 border-red-500 text-white"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              ) : null}
            </div>

            {/* Additional Controls */}
            {callStatus === "connected" && null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
