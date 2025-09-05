"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system'
import { Button } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { APIConnectionTester } from "@/components/test/APIConnectionTester"
import { 
  Video, 
  Phone, 
  MessageSquare, 
  TestTube,
  ArrowRight,
  CheckCircle
} from "lucide-react"

interface TestRoute {
  path: string
  title: string
  description: string
  icon: React.ReactNode
  status: 'available' | 'beta' | 'experimental'
}

const testRoutes: TestRoute[] = [
  {
    path: '/video-calls/test',
    title: 'Video Calls',
    description: 'Test video calling with LiveKit integration, camera controls, and screen sharing',
    icon: <Video className="h-5 w-5" />,
    status: 'available'
  },
  {
    path: '/phone-calls/test',
    title: 'Phone Calls',
    description: 'Test voice calling functionality, audio controls, and call quality monitoring',
    icon: <Phone className="h-5 w-5" />,
    status: 'available'
  },
  {
    path: '/text-messages/test',
    title: 'Text Messages',
    description: 'Test SMS messaging, conversation threads, and message status tracking',
    icon: <MessageSquare className="h-5 w-5" />,
    status: 'available'
  }
]

export function TestNavigation() {
  const pathname = usePathname()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'default'
      case 'beta': return 'secondary'
      case 'experimental': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* API Connection Testing */}
      <APIConnectionTester />
      
      {/* Communication Feature Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Communication Testing
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Test and validate communication features across different channels
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {testRoutes.map((route) => {
              const isActive = pathname === route.path
              
              return (
                <div
                  key={route.path}
                  className={`border rounded-lg p-4 transition-colors ${
                    isActive 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        isActive 
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {route.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {route.title}
                          </h3>
                          <Badge variant={getStatusColor(route.status)} className="text-xs">
                            {route.status}
                          </Badge>
                          {isActive && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {route.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      {isActive ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Button asChild variant="outline" size="sm" className="gap-2">
                          <Link href={route.path}>
                            Test
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
              Testing Guidelines
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Each test page simulates real communication functionality</li>
              <li>• Video calls require camera/microphone permissions</li>
              <li>• Phone calls test audio controls and call quality</li>
              <li>• Text messages demonstrate conversation threading</li>
              <li>• All tests work with mock data for safe testing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
