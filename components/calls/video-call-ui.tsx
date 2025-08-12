"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
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
      const timer = setTimeout(() => {
        setCallStatus("connected")
        triggerHaptic("success")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [callType, callStatus, triggerHaptic])

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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                {/* Remote Video */}
                <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                  {isVideoOff ? (
                    <div className="text-center">
                      <Avatar className="h-32 w-32 mx-auto mb-4">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                          {contact.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-gray-300">Camera is off</p>
                    </div>
                  ) : (
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                  )}
                </div>

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
                  <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                </div>

                {/* Call Info Overlay */}
                <div className="absolute top-4 left-4 bg-black/50 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium">{contact.name}</p>
                  <p className="text-xs text-gray-300">{formatDuration(duration)}</p>
                </div>
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
                  <h2 className="text-2xl font-semibold">{contact.name}</h2>
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
              ) : callStatus === "connected" ? (
                <>
                  <Button
                    variant="outline"
                    size="lg"
                    className={`h-14 w-14 rounded-full ${
                      isMuted
                        ? "bg-red-500 hover:bg-red-600 border-red-500"
                        : "bg-gray-700/80 hover:bg-gray-600 border-gray-600"
                    } text-white backdrop-blur-sm`}
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
                      isVideoOff
                        ? "bg-red-500 hover:bg-red-600 border-red-500"
                        : "bg-gray-700/80 hover:bg-gray-600 border-gray-600"
                    } text-white backdrop-blur-sm`}
                    onClick={toggleVideo}
                  >
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
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
            {callStatus === "connected" && (
              <div className="flex items-center justify-center space-x-4 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white backdrop-blur-sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white backdrop-blur-sm">
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white backdrop-blur-sm">
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white backdrop-blur-sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
