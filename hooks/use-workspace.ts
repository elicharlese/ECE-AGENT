import { useState, useCallback, useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export interface WorkspaceState {
  mode: 'chat' | 'workspace'
  layout: 'unified' | 'split'
  activeTab: 'chat' | 'media' | 'tools'
  isVideoCallActive: boolean
  isPhoneCallActive: boolean
  activeTools: string[]
  mediaGenerations: any[]
}

export interface WorkspaceActions {
  setMode: (mode: 'chat' | 'workspace') => void
  setLayout: (layout: 'unified' | 'split') => void
  setActiveTab: (tab: 'chat' | 'media' | 'tools') => void
  startVideoCall: () => void
  endVideoCall: () => void
  startPhoneCall: () => void
  endPhoneCall: () => void
  executeToolAction: (toolType: string, params: any) => Promise<string>
  generateMedia: (type: 'image' | 'audio' | 'video', prompt: string) => Promise<string>
}

export function useWorkspace(chatId: string): [WorkspaceState, WorkspaceActions] {
  const [state, setState] = useState<WorkspaceState>({
    mode: 'chat',
    layout: 'unified',
    activeTab: 'chat',
    isVideoCallActive: false,
    isPhoneCallActive: false,
    activeTools: [],
    mediaGenerations: []
  })

  // Restore workspace state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem(`workspace_state_${chatId}`)
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setState(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.warn('Failed to restore workspace state:', e)
      }
    }
  }, [chatId])

  // Persist workspace state
  useEffect(() => {
    localStorage.setItem(`workspace_state_${chatId}`, JSON.stringify(state))
  }, [chatId, state])

  const setMode = useCallback((mode: 'chat' | 'workspace') => {
    setState(prev => ({ ...prev, mode }))
    trackEvent({
      name: 'workspace_mode_change',
      properties: { chatId, mode }
    })
  }, [chatId])

  const setLayout = useCallback((layout: 'unified' | 'split') => {
    setState(prev => ({ ...prev, layout }))
    trackEvent({
      name: 'workspace_layout_change',
      properties: { chatId, layout }
    })
  }, [chatId])

  const setActiveTab = useCallback((activeTab: 'chat' | 'media' | 'tools') => {
    setState(prev => ({ ...prev, activeTab }))
  }, [])

  const startVideoCall = useCallback(() => {
    setState(prev => ({ ...prev, isVideoCallActive: true }))
    trackEvent({
      name: 'workspace_video_call_start',
      properties: { chatId }
    })
  }, [chatId])

  const endVideoCall = useCallback(() => {
    setState(prev => ({ ...prev, isVideoCallActive: false }))
    trackEvent({
      name: 'workspace_video_call_end',
      properties: { chatId }
    })
  }, [chatId])

  const startPhoneCall = useCallback(() => {
    setState(prev => ({ ...prev, isPhoneCallActive: true }))
    trackEvent({
      name: 'workspace_phone_call_start',
      properties: { chatId }
    })
  }, [chatId])

  const endPhoneCall = useCallback(() => {
    setState(prev => ({ ...prev, isPhoneCallActive: false }))
    trackEvent({
      name: 'workspace_phone_call_end',
      properties: { chatId }
    })
  }, [chatId])

  const executeToolAction = useCallback(async (toolType: string, params: any): Promise<string> => {
    const toolId = `tool_${Date.now()}`
    
    setState(prev => ({ 
      ...prev, 
      activeTools: [...prev.activeTools, toolId]
    }))

    await trackEvent({
      name: 'workspace_tool_execution',
      properties: { chatId, toolType, params }
    })

    // Simulate tool execution - in real implementation, this would call actual APIs
    return new Promise((resolve) => {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          activeTools: prev.activeTools.filter(id => id !== toolId)
        }))
        resolve(`Tool ${toolType} executed successfully`)
      }, 2000)
    })
  }, [chatId])

  const generateMedia = useCallback(async (type: 'image' | 'audio' | 'video', prompt: string): Promise<string> => {
    const mediaId = `media_${Date.now()}`
    
    setState(prev => ({
      ...prev,
      mediaGenerations: [...prev.mediaGenerations, { id: mediaId, type, prompt, status: 'generating' }]
    }))

    await trackEvent({
      name: 'workspace_media_generation',
      properties: { chatId, type, prompt }
    })

    // Simulate media generation
    return new Promise((resolve) => {
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          mediaGenerations: prev.mediaGenerations.map(item =>
            item.id === mediaId 
              ? { ...item, status: 'completed', url: `/placeholder-${type}.${type === 'audio' ? 'mp3' : type === 'video' ? 'mp4' : 'jpg'}` }
              : item
          )
        }))
        resolve(mediaId)
      }, 3000)
    })
  }, [chatId])

  const actions: WorkspaceActions = {
    setMode,
    setLayout,
    setActiveTab,
    startVideoCall,
    endVideoCall,
    startPhoneCall,
    endPhoneCall,
    executeToolAction,
    generateMedia
  }

  return [state, actions]
}
