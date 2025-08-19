'use client'

import React, { useState, useEffect } from 'react'
import { ConversationSidebar } from '@/components/messages/conversation-sidebar'
import { ChatWindow } from '@/components/chat/chat-window-simple'
import { RightSidePanel, RightPanelTab } from '@/components/panels/RightSidePanel'
import { ContactInfoPanel } from '@/components/panels/ContactInfoPanel'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { startDirectMessageByUsername } from '@/services/dm-service'
import { supabase } from '@/lib/supabase/client'
import { getProfileByUserId } from '@/services/profile-service'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('agents')
  const [contactInfoOpen, setContactInfoOpen] = useState(false)
  const [mcpSettingsOpen, setMcpSettingsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [dmUsername, setDmUsername] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [refreshToken, setRefreshToken] = useState<number>(0)
  const [contact, setContact] = useState<{ name: string; phone: string; email?: string; avatar?: string; status?: string }>({ name: '', phone: 'N/A' })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load contact info for the selected conversation (the other participant)
  useEffect(() => {
    if (!selectedConversation) {
      setContact({ name: '', phone: 'N/A' })
      return
    }
    const loadContact = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth?.user) return
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', selectedConversation)
      if (error) {
        console.error('Failed to load participants', error)
        return
      }
      const others = (data || []).filter((r: any) => r.user_id !== auth.user.id)
      const otherUserId = others[0]?.user_id
      if (!otherUserId) return
      try {
        const profile = await getProfileByUserId(otherUserId)
        if (profile) {
          setContact({
            name: profile.full_name || profile.username,
            phone: 'N/A',
            email: undefined,
            avatar: profile.avatar_url || undefined,
            status: 'Active now',
          })
        }
      } catch (e) {
        console.error('Failed to load contact profile', e)
      }
    }
    loadContact()
  }, [selectedConversation])

  const handleStartDM = async (e?: React.FormEvent) => {
    e?.preventDefault?.()
    const username = dmUsername.trim()
    if (!username) return
    setIsStarting(true)
    try {
      const conv = await startDirectMessageByUsername(username)
      setSelectedConversation(conv.id)
      setRefreshToken(Date.now())
      setDmUsername('')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start chat'
      alert(msg)
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <form onSubmit={handleStartDM} className="mt-3 flex gap-2">
            <input
              type="text"
              value={dmUsername}
              onChange={(e) => setDmUsername(e.target.value)}
              placeholder="Start chat by username"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isStarting || !dmUsername.trim()}
              className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
            >
              {isStarting ? 'Starting…' : 'Start'}
            </button>
          </form>
        </div>
        <ConversationSidebar 
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          refreshToken={refreshToken}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        {selectedConversation ? (
          <>
            <ChatWindow
              chatId={selectedConversation}
              onToggleAgent={() => {
                if (!rightPanelOpen) { setRightPanelTab('agents'); setRightPanelOpen(true) }
                else if (rightPanelTab !== 'agents') { setRightPanelTab('agents') }
                else { setRightPanelOpen(false) }
              }}
              onToggleMCP={() => {
                if (!rightPanelOpen) { setRightPanelTab('mcp'); setRightPanelOpen(true) }
                else if (rightPanelTab !== 'mcp') { setRightPanelTab('mcp') }
                else { setRightPanelOpen(false) }
              }}
              onToggleContactInfo={() => setContactInfoOpen(!contactInfoOpen)}
              onOpenMCPSettings={() => setMcpSettingsOpen(true)}
            />
            {/* Right panel - Desktop */}
            {!isMobile && (
              <RightSidePanel
                isOpen={rightPanelOpen}
                activeTab={rightPanelTab}
                onTabChange={setRightPanelTab}
                onClose={() => setRightPanelOpen(false)}
                chatId={selectedConversation || ''}
                onOpen={() => setRightPanelOpen(true)}
              />
            )}

            {/* Right panel - Mobile (Sheet) */}
            {isMobile && (
              <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
                <SheetContent side="right" className="w-full sm:w-96 p-0">
                  <SheetHeader className="px-4 py-3 border-b">
                    <SheetTitle>
                      {rightPanelTab === 'agents' ? 'AI Agents' : 'MCP Tools'}
                    </SheetTitle>
                  </SheetHeader>
                  <RightSidePanel
                    isOpen={true}
                    activeTab={rightPanelTab}
                    onTabChange={setRightPanelTab}
                    onClose={() => setRightPanelOpen(false)}
                    chatId={selectedConversation || ''}
                  />
                </SheetContent>
              </Sheet>
            )}

            {/* Contact Info Panel */}
            <ContactInfoPanel
              isOpen={contactInfoOpen}
              onClose={() => setContactInfoOpen(false)}
              contact={contact}
            />

            {/* MCP Settings Modal */}
            <Sheet open={mcpSettingsOpen} onOpenChange={setMcpSettingsOpen}>
              <SheetContent side="right" className="w-full sm:w-[480px]">
                <SheetHeader>
                  <SheetTitle>Configure MCP Tools</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Available Tools</h3>
                    <div className="space-y-2">
                      {['Database Query', 'Web Search', 'Git Operations', 'File Search', 'Terminal', 'Calculator'].map(tool => (
                        <label key={tool} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <span className="text-sm">{tool}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">API Keys</h3>
                    <input
                      type="password"
                      placeholder="OpenAI API Key"
                      className="w-full px-3 py-2 border rounded-md mb-2"
                    />
                    <input
                      type="password"
                      placeholder="Database Connection String"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h2 className="mt-4 text-xl font-semibold text-gray-600">Select a conversation</h2>
              <p className="mt-2 text-gray-400">Choose a chat from the list or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

