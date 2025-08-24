"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { supabase } from "@/lib/supabase/client"

export default function LiveKitTestPage() {
  const [roomName, setRoomName] = useState("lk-test-room")
  const [token, setToken] = useState<string | null>(null)
  const [wsUrl, setWsUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [lastResponse, setLastResponse] = useState<any>(null)
  // Stable guest identity for this session to avoid identity changes between joins
  const [guestId] = useState(() => `guest-${Math.random().toString(36).slice(2)}`)
  const [connected, setConnected] = useState(false)

  const clientWsUrl = useMemo(() => process.env.NEXT_PUBLIC_LIVEKIT_WS_URL ?? null, [])

  useEffect(() => {
    let cancel = false
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!cancel) {
          setUserId(user?.id ?? null)
          setUserEmail(user?.email ?? null)
        }
      } catch (e) {
        // Non-blocking for test page
      }
    }
    init()
    return () => { cancel = true }
  }, [])

  const join = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLastResponse(null)
    try {
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: roomName || "lk-test-room",
          identity: userId || guestId,
          metadata: { name: userEmail || "Guest" },
        }),
      })
      const data = await res.json()
      setLastResponse({ status: res.status, ok: res.ok, ...data })
      if (!res.ok) throw new Error(data?.error || "Token API failed")
      if (!data?.token || !data?.wsUrl) throw new Error("Missing token or wsUrl in response")
      setToken(data.token)
      setWsUrl(data.wsUrl)
    } catch (e: any) {
      setError(e?.message || "Failed to join room")
    } finally {
      setLoading(false)
    }
  }, [roomName, userEmail, userId])

  const leave = () => {
    setToken(null)
    setWsUrl(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow border p-6">
          <h1 className="text-xl font-semibold text-gray-900">LiveKit Test</h1>
          <p className="text-sm text-gray-600 mt-1">Quickly verify token issuance and room connection.</p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Room name</label>
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="lk-test-room"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700">Identity</label>
              <div className="mt-1 text-sm text-gray-900 truncate">{userId || "Guest (no auth)"}</div>
              <div className="text-xs text-gray-500 truncate">{userEmail || "No email"}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={join}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? "Joining…" : "Join Room"}
            </button>
            {(token && wsUrl) && (
              <button
                onClick={leave}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Leave
              </button>
            )}
          </div>

          {/* Diagnostics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-700">Env Check</div>
              <div className="text-xs text-gray-600 mt-1">NEXT_PUBLIC_LIVEKIT_WS_URL: {clientWsUrl ? "present" : "missing"}</div>
            </div>
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-700">Token</div>
              <div className="text-[10px] text-gray-600 break-words mt-1">{token ? token.slice(0, 24) + "…" : "—"}</div>
            </div>
            <div className="bg-gray-50 border rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-700">WS URL</div>
              <div className="text-xs text-gray-600 break-all mt-1">{wsUrl || "—"}</div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded bg-red-50 text-red-700 border border-red-200 text-sm">
              {error}
            </div>
          )}

          {lastResponse && (
            <details className="mt-4 bg-gray-50 border rounded-lg p-3">
              <summary className="cursor-pointer text-sm font-medium text-gray-800">Last response</summary>
              <pre className="text-xs text-gray-700 mt-2 whitespace-pre-wrap">{JSON.stringify(lastResponse, null, 2)}</pre>
            </details>
          )}
        </div>

        {/* LiveKit Room */}
        {(token && wsUrl) && (
          <div className="bg-white rounded-xl shadow border p-2">
            <LiveKitRoom
              key={token}
              token={token}
              serverUrl={wsUrl}
              data-lk-theme="default"
              video={false}
              audio={false}
              onConnected={() => setConnected(true)}
              onDisconnected={() => setConnected(false)}
            >
              {connected ? (
                <VideoConference />
              ) : (
                <div className="p-8 text-center text-sm text-gray-600">Connecting…</div>
              )}
            </LiveKitRoom>
          </div>
        )}
      </div>
    </div>
  )
}
