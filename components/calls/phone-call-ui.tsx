"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from '@/libs/design-system'
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system'
import { Dialog, DialogContent } from '@/libs/design-system'
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageCircle, UserPlus } from "lucide-react"
import { useHaptics } from "@/hooks/use-haptics"
import { useUser } from "@/contexts/user-context"
import dynamic from "next/dynamic"

// Lazy-load LiveKit only when a call connects
const LiveKitRoom = dynamic(() => import("@livekit/components-react").then(m => m.LiveKitRoom), { ssr: false })
const AudioConference = dynamic(() => import("@livekit/components-react").then(m => m.AudioConference), {
  ssr: false,
  loading: () => <div className="p-4 text-center text-sm text-gray-300">Connecting…</div>
})

interface PhoneCallUIProps {
  isOpen: boolean
  onClose: () => void
  contact: {
    id: string
    name: string
    phone?: string
    avatar?: string
  }
  callType: "incoming" | "outgoing"
}

export function PhoneCallUI({ isOpen, onClose, contact, callType }: PhoneCallUIProps) {
  const [callStatus, setCallStatus] = useState<"connecting" | "ringing" | "connected" | "ended">(
    callType === "incoming" ? "ringing" : "connecting",
  )
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaker, setIsSpeaker] = useState(false)
  const { triggerHaptic } = useHaptics()
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
    if (callType === "outgoing" && callStatus === "connecting") {
      joinCall()
    }
  }, [isOpen, callType, callStatus, joinCall])

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

  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker)
    triggerHaptic("light")
  }

  const getStatusText = () => {
    switch (callStatus) {
      case "connecting":
        return "Connecting..."
      case "ringing":
        return "Incoming call"
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
      <DialogContent className="max-w-sm mx-auto bg-gradient-to-b from-gray-900 to-black text-white border-none">
        <div className="flex flex-col items-center space-y-8 py-8">
          {/* Contact Info */}
          <div className="text-center space-y-4">
            <Avatar className="h-32 w-32 mx-auto">
              <AvatarImage src={contact.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">AGENT - {contact.name}</h2>
              {contact.phone && <p className="text-gray-300">{contact.phone}</p>}
              <p className="text-gray-400 mt-2">{getStatusText()}</p>
              {lkError && (
                <p className="text-red-400 text-sm mt-2">{lkError}</p>
              )}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center space-x-6">
            {callStatus === "ringing" && callType === "incoming" ? (
              <>
                {/* Incoming Call Controls */}
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
                  <Phone className="h-6 w-6" />
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

          {/* Additional Actions (for connected calls) */}
          {callStatus === "connected" && lkToken && lkWsUrl && (
            <div className="w-full">
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
                  <AudioConference />
                ) : (
                  <div className="p-4 text-center text-sm text-gray-300">Connecting…</div>
                )}
              </LiveKitRoom>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
