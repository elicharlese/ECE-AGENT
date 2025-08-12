"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageCircle, UserPlus } from "lucide-react"
import { useHaptics } from "@/hooks/use-haptics"

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

  useEffect(() => {
    if (callStatus === "connected") {
      const timer = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [callStatus])

  useEffect(() => {
    if (callType === "outgoing" && callStatus === "connecting") {
      // Simulate connection after 2 seconds
      const timer = setTimeout(() => {
        setCallStatus("connected")
        triggerHaptic("success")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [callType, callStatus, triggerHaptic])

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = () => {
    setCallStatus("connected")
    triggerHaptic("success")
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            ) : callStatus === "connected" ? (
              <>
                {/* Active Call Controls */}
                <Button
                  variant="outline"
                  size="lg"
                  className={`h-14 w-14 rounded-full ${
                    isMuted
                      ? "bg-red-500 hover:bg-red-600 border-red-500"
                      : "bg-gray-700 hover:bg-gray-600 border-gray-600"
                  } text-white`}
                  onClick={toggleMute}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 border-red-500 text-white"
                  onClick={handleEndCall}
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className={`h-14 w-14 rounded-full ${
                    isSpeaker
                      ? "bg-blue-500 hover:bg-blue-600 border-blue-500"
                      : "bg-gray-700 hover:bg-gray-600 border-gray-600"
                  } text-white`}
                  onClick={toggleSpeaker}
                >
                  {isSpeaker ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
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
          {callStatus === "connected" && (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <MessageCircle className="h-5 w-5 mr-2" />
                Message
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <UserPlus className="h-5 w-5 mr-2" />
                Add Call
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
