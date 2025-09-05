"use client"

import { useState, useEffect } from "react"
import {
  Button,
  Switch
} from '@/libs/design-system';
import { Badge } from '@/libs/design-system'

// TODO: Replace deprecated components: Switch
// 
// TODO: Replace deprecated components: Switch
// import { Switch } from '@/components/ui/switch'
import { 
  Brain, 
  Zap, 
  Sparkles, 
  Settings,
  Activity,
  Cpu,
  Network
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AIModeConfig {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  features: string[]
  enabled: boolean
  settings: Record<string, any>
}

interface AIModeToggleProps {
  onModeChange?: (mode: string, enabled: boolean) => void
  onSettingsChange?: (mode: string, settings: Record<string, any>) => void
  className?: string
}

const defaultModes: AIModeConfig[] = [
  {
    id: "auto_complete",
    name: "Auto Complete",
    description: "Intelligent text completion and suggestions",
    icon: <Sparkles className="h-4 w-4" />,
    features: ["Smart suggestions", "Context awareness", "Multi-language support"],
    enabled: true,
    settings: {
      maxSuggestions: 5,
      confidenceThreshold: 0.7,
      enableKeyboardShortcuts: true
    }
  },
  {
    id: "code_assist",
    name: "Code Assistant",
    description: "AI-powered coding assistance and debugging",
    icon: <Cpu className="h-4 w-4" />,
    features: ["Code generation", "Bug detection", "Performance optimization"],
    enabled: false,
    settings: {
      autoFix: true,
      showHints: true,
      enableRefactoring: true
    }
  },
  {
    id: "real_time_analysis",
    name: "Real-time Analysis",
    description: "Continuous analysis of user interactions",
    icon: <Activity className="h-4 w-4" />,
    features: ["Pattern recognition", "Anomaly detection", "Predictive insights"],
    enabled: true,
    settings: {
      analysisInterval: 5000,
      enableAlerts: true,
      dataRetention: 30
    }
  },
  {
    id: "collaborative_ai",
    name: "Collaborative AI",
    description: "Multi-agent collaboration and coordination",
    icon: <Network className="h-4 w-4" />,
    features: ["Agent coordination", "Shared context", "Consensus building"],
    enabled: false,
    settings: {
      maxAgents: 5,
      consensusThreshold: 0.8,
      enableVoting: true
    }
  }
]

export function AIModeToggle({ 
  onModeChange, 
  onSettingsChange,
  className 
}: AIModeToggleProps) {
  const [modes, setModes] = useState<AIModeConfig[]>(defaultModes)
  const [activeModes, setActiveModes] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)

  // Load saved preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_modes_config')
    if (saved) {
      try {
        const config = JSON.parse(saved)
        setModes(prev => prev.map(mode => ({
          ...mode,
          enabled: config[mode.id]?.enabled ?? mode.enabled,
          settings: { ...mode.settings, ...(config[mode.id]?.settings || {}) }
        })))
      } catch (error) {
        console.warn('Failed to load AI modes config:', error)
      }
    }
  }, [])

  // Save preferences to localStorage
  const saveConfig = (updatedModes: AIModeConfig[]) => {
    const config: Record<string, any> = {}
    updatedModes.forEach(mode => {
      config[mode.id] = {
        enabled: mode.enabled,
        settings: mode.settings
      }
    })
    localStorage.setItem('ai_modes_config', JSON.stringify(config))
  }

  const toggleMode = (modeId: string) => {
    setModes(prev => {
      const updated = prev.map(mode => 
        mode.id === modeId 
          ? { ...mode, enabled: !mode.enabled }
          : mode
      )
      saveConfig(updated)
      
      const mode = updated.find(m => m.id === modeId)
      if (mode) {
        onModeChange?.(modeId, mode.enabled)
      }
      
      return updated
    })
  }

  const updateModeSettings = (modeId: string, settings: Record<string, any>) => {
    setModes(prev => {
      const updated = prev.map(mode => 
        mode.id === modeId 
          ? { ...mode, settings: { ...mode.settings, ...settings } }
          : mode
      )
      saveConfig(updated)
      onSettingsChange?.(modeId, settings)
      return updated
    })
  }

  const enabledModes = modes.filter(mode => mode.enabled)
  const activeCount = enabledModes.length

  return (
    <div className={cn("bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg", className)}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-sm">AI Mode</h3>
            {activeCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeCount} active
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Status */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              activeCount > 0 ? "bg-green-500" : "bg-gray-400"
            )} />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {activeCount > 0 ? `${activeCount} mode${activeCount > 1 ? 's' : ''} active` : 'No modes active'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Toggle */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Enable AI Features</span>
          </div>
          <Switch
            checked={activeCount > 0}
            onCheckedChange={(checked) => {
              if (!checked) {
                // Disable all modes
                setModes(prev => {
                  const updated = prev.map(mode => ({ ...mode, enabled: false }))
                  saveConfig(updated)
                  return updated
                })
              } else {
                // Enable default modes
                setModes(prev => {
                  const updated = prev.map(mode => ({ 
                    ...mode, 
                    enabled: mode.id === 'auto_complete' || mode.id === 'real_time_analysis'
                  }))
                  saveConfig(updated)
                  return updated
                })
              }
            }}
          />
        </div>
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-3 space-y-3">
            {modes.map((mode) => (
              <div key={mode.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {mode.icon}
                    <div>
                      <div className="text-sm font-medium">{mode.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {mode.description}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={mode.enabled}
                    onCheckedChange={() => toggleMode(mode.id)}
                  />
                </div>
                
                {mode.enabled && (
                  <div className="ml-6 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {mode.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Mode-specific settings */}
                    {mode.id === 'auto_complete' && (
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400">
                          Max Suggestions: {mode.settings.maxSuggestions}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={mode.settings.maxSuggestions}
                          onChange={(e) => updateModeSettings(mode.id, { maxSuggestions: parseInt(e.target.value) })}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                    
                    {mode.id === 'real_time_analysis' && (
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400">
                          Analysis Interval: {mode.settings.analysisInterval}ms
                        </label>
                        <input
                          type="range"
                          min="1000"
                          max="10000"
                          step="1000"
                          value={mode.settings.analysisInterval}
                          onChange={(e) => updateModeSettings(mode.id, { analysisInterval: parseInt(e.target.value) })}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}