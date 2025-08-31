"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Database, 
  CreditCard, 
  Users, 
  Video, 
  Github, 
  Shield,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

interface APIEndpoint {
  name: string
  path: string
  method: 'GET' | 'POST'
  description: string
  icon: React.ReactNode
  requiresAuth: boolean
  category: 'auth' | 'data' | 'payment' | 'integration' | 'media'
}

const apiEndpoints: APIEndpoint[] = [
  // Auth & Profile
  {
    name: 'Profile',
    path: '/api/profile',
    method: 'GET',
    description: 'User profile data and settings',
    icon: <Users className="h-4 w-4" />,
    requiresAuth: true,
    category: 'auth'
  },
  {
    name: 'Solana Auth',
    path: '/api/auth/solana',
    method: 'POST',
    description: 'Solana wallet authentication',
    icon: <Shield className="h-4 w-4" />,
    requiresAuth: false,
    category: 'auth'
  },
  
  // Agents
  {
    name: 'List Agents',
    path: '/api/agents',
    method: 'GET',
    description: 'Fetch all available AI agents',
    icon: <Database className="h-4 w-4" />,
    requiresAuth: true,
    category: 'data'
  },
  {
    name: 'Create Agent',
    path: '/api/agents',
    method: 'POST',
    description: 'Create new AI agent configuration',
    icon: <Database className="h-4 w-4" />,
    requiresAuth: true,
    category: 'data'
  },
  
  // Credits System
  {
    name: 'Credits Balance',
    path: '/api/credits/balance',
    method: 'GET',
    description: 'Current user credit balance',
    icon: <CreditCard className="h-4 w-4" />,
    requiresAuth: true,
    category: 'payment'
  },
  {
    name: 'Credits Checkout',
    path: '/api/credits/checkout',
    method: 'POST',
    description: 'Initialize credit purchase flow',
    icon: <CreditCard className="h-4 w-4" />,
    requiresAuth: true,
    category: 'payment'
  },
  {
    name: 'Consume Credits',
    path: '/api/credits/consume',
    method: 'POST',
    description: 'Deduct credits for usage',
    icon: <CreditCard className="h-4 w-4" />,
    requiresAuth: true,
    category: 'payment'
  },
  
  // Stripe Integration
  {
    name: 'Stripe Checkout',
    path: '/api/stripe/checkout',
    method: 'POST',
    description: 'Create Stripe checkout session',
    icon: <CreditCard className="h-4 w-4" />,
    requiresAuth: true,
    category: 'payment'
  },
  {
    name: 'Stripe Portal',
    path: '/api/stripe/portal',
    method: 'POST',
    description: 'Access Stripe customer portal',
    icon: <CreditCard className="h-4 w-4" />,
    requiresAuth: true,
    category: 'payment'
  },
  
  // LiveKit Media
  {
    name: 'LiveKit Token',
    path: '/api/livekit/token',
    method: 'POST',
    description: 'Generate LiveKit access token',
    icon: <Video className="h-4 w-4" />,
    requiresAuth: true,
    category: 'media'
  },
  
  // MCP Integrations
  {
    name: 'GitHub MCP',
    path: '/api/mcp/github',
    method: 'POST',
    description: 'GitHub integration via MCP',
    icon: <Github className="h-4 w-4" />,
    requiresAuth: true,
    category: 'integration'
  },
  {
    name: 'GitHub MCP Test',
    path: '/api/mcp/github/test',
    method: 'GET',
    description: 'Test GitHub MCP connection',
    icon: <Github className="h-4 w-4" />,
    requiresAuth: true,
    category: 'integration'
  }
]

type TestResult = {
  status: 'idle' | 'loading' | 'success' | 'error'
  message?: string
  responseTime?: number
}

export function APIConnectionTester() {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [testingAll, setTestingAll] = useState(false)

  const testEndpoint = async (endpoint: APIEndpoint) => {
    const key = `${endpoint.method}-${endpoint.path}`
    
    setTestResults(prev => ({
      ...prev,
      [key]: { status: 'loading' }
    }))

    const startTime = Date.now()
    
    try {
      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(endpoint.method === 'POST' && {
          body: JSON.stringify({
            test: true,
            timestamp: new Date().toISOString()
          })
        })
      }

      const response = await fetch(endpoint.path, options)
      const responseTime = Date.now() - startTime
      
      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          [key]: { 
            status: 'success', 
            message: `${response.status} ${response.statusText}`,
            responseTime 
          }
        }))
      } else {
        setTestResults(prev => ({
          ...prev,
          [key]: { 
            status: 'error', 
            message: `${response.status} ${response.statusText}`,
            responseTime 
          }
        }))
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      setTestResults(prev => ({
        ...prev,
        [key]: { 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Unknown error',
          responseTime 
        }
      }))
    }
  }

  const testAllEndpoints = async () => {
    setTestingAll(true)
    
    for (const endpoint of apiEndpoints) {
      await testEndpoint(endpoint)
      // Small delay between requests to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    setTestingAll(false)
  }

  const getStatusIcon = (result: TestResult) => {
    switch (result.status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auth': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'data': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'payment': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'integration': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'media': return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const groupedEndpoints = apiEndpoints.reduce((acc, endpoint) => {
    if (!acc[endpoint.category]) {
      acc[endpoint.category] = []
    }
    acc[endpoint.category].push(endpoint)
    return acc
  }, {} as Record<string, APIEndpoint[]>)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            API Connection Testing
          </CardTitle>
          <Button 
            onClick={testAllEndpoints}
            disabled={testingAll}
            className="gap-2"
          >
            {testingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test All'
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Test all API endpoints to verify connectivity and authentication
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
            <div key={category}>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 capitalize">
                {category} APIs
              </h3>
              <div className="grid gap-3">
                {endpoints.map((endpoint) => {
                  const key = `${endpoint.method}-${endpoint.path}`
                  const result = testResults[key] || { status: 'idle' }
                  
                  return (
                    <div
                      key={key}
                      className="border rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {endpoint.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {endpoint.name}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getCategoryColor(endpoint.category)}`}
                              >
                                {endpoint.method}
                              </Badge>
                              {endpoint.requiresAuth && (
                                <Badge variant="secondary" className="text-xs">
                                  Auth Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                              {endpoint.description}
                            </p>
                            <code className="text-xs text-gray-500 dark:text-gray-400">
                              {endpoint.path}
                            </code>
                            {result.message && (
                              <p className={`text-xs mt-1 ${
                                result.status === 'success' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {result.message}
                                {result.responseTime && ` (${result.responseTime}ms)`}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusIcon(result)}
                          <Button
                            onClick={() => testEndpoint(endpoint)}
                            disabled={result.status === 'loading'}
                            variant="outline"
                            size="sm"
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
