"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from '@/libs/design-system'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/libs/design-system'
import { Alert, AlertDescription } from '@/libs/design-system'
import { Loader2, CheckCircle, XCircle, Users, MessageCircle } from "lucide-react"
import { toast } from '@/libs/design-system'

interface InvitationData {
  chatId: string
  chatName: string
  inviterName: string
  isGroupChat: boolean
  participantCount: number
  inviteToken: string
  expiresAt: Date
}

export default function JoinChatPage({ params }: { params: { chatId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')

  const [invitationData, setInvitationData] = useState<InvitationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()

  useEffect(() => {
    checkAuthentication()
    validateInvitation()
  }, [params.chatId, inviteToken])

  const checkAuthentication = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error

      setUser(user)
      setIsAuthenticated(!!user)
    } catch (err) {
      console.error('Auth check failed:', err)
      setIsAuthenticated(false)
    }
  }

  const validateInvitation = async () => {
    if (!inviteToken) {
      setError('Invalid invitation link - missing token')
      setIsLoading(false)
      return
    }

    try {
      // Validate invitation token and get chat details
      const response = await fetch(`/api/invitations/validate?token=${inviteToken}&chatId=${params.chatId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid invitation')
      }

      setInvitationData(data.invitation)
    } catch (err: any) {
      setError(err.message || 'Failed to validate invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinChat = async () => {
    if (!invitationData || !user) return

    setIsJoining(true)
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: params.chatId,
          inviteToken: inviteToken,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join chat')
      }

      toast({
        title: "Successfully joined!",
        description: `You are now a member of ${invitationData.chatName}`,
      })

      // Redirect to the chat
      router.push(`/messages?c=${params.chatId}`)
    } catch (err: any) {
      toast({
        title: "Failed to join",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const handleSignIn = () => {
    // Store the current URL to redirect back after authentication
    const currentUrl = window.location.href
    localStorage.setItem('invitation_redirect', currentUrl)

    router.push('/auth')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Validating invitation...
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Please wait while we verify your invitation link.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700 dark:text-red-400">
              Invalid Invitation
            </CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/')} variant="outline">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invitationData) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {invitationData.isGroupChat ? (
              <Users className="h-12 w-12 text-blue-600" />
            ) : (
              <MessageCircle className="h-12 w-12 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-xl">
            Join {invitationData.chatName}
          </CardTitle>
          <CardDescription>
            You've been invited by {invitationData.inviterName}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {invitationData.participantCount} {invitationData.participantCount === 1 ? 'member' : 'members'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>
                {invitationData.isGroupChat ? 'Group chat' : 'Direct conversation'}
              </span>
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  You&apos;re invited to join this conversation! Sign in to continue.
                </AlertDescription>
              </Alert>
              <Button onClick={handleSignIn} className="w-full">
                Sign In to Join
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Signed in as {user.email}
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleJoinChat}
                disabled={isJoining}
                className="w-full"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Joining...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Join Chat
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            This invitation expires on {invitationData.expiresAt.toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
