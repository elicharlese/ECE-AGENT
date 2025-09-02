"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Building2, 
  Zap, 
  Settings, 
  Plus, 
  Crown,
  Shield,
  Activity,
  Database,
  Phone,
  Mail,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { EnterpriseProfile as EnterpriseProfileType, LLMEndpoint } from '@/src/types/user-tiers'

interface EnterpriseProfileProps {
  profile: EnterpriseProfileType
  currentUserId: string
  onAddLLMEndpoint?: (endpoint: Omit<LLMEndpoint, 'id'>) => void
  onUpdateLLMEndpoint?: (id: string, endpoint: Partial<LLMEndpoint>) => void
  onDeleteLLMEndpoint?: (id: string) => void
  onUpdateRateLimit?: (newLimit: number) => void
}

export function EnterpriseProfile({ 
  profile, 
  currentUserId,
  onAddLLMEndpoint,
  onUpdateLLMEndpoint,
  onDeleteLLMEndpoint,
  onUpdateRateLimit
}: EnterpriseProfileProps) {
  const [showEndpointDialog, setShowEndpointDialog] = useState(false)
  const [newEndpoint, setNewEndpoint] = useState({
    name: '',
    endpoint: '',
    apiKey: '',
    model: '',
    provider: 'custom' as const,
    isActive: true
  })

  const handleAddEndpoint = () => {
    if (newEndpoint.name && newEndpoint.endpoint && onAddLLMEndpoint) {
      onAddLLMEndpoint(newEndpoint)
      setNewEndpoint({
        name: '',
        endpoint: '',
        apiKey: '',
        model: '',
        provider: 'custom',
        isActive: true
      })
      setShowEndpointDialog(false)
    }
  }

  const currentUser = profile.members.find(m => m.userId === currentUserId)
  const isOwnerOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Enterprise Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {profile.name}
                <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Enterprise
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{profile.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>Rate Limit: {profile.customRateLimit}/min</span>
                <span>•</span>
                <span>Dedicated Support</span>
                <span>•</span>
                <span>Custom LLM Endpoints</span>
              </div>
            </div>
            {isOwnerOrAdmin && (
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Enterprise Settings
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="llm-endpoints">LLM Endpoints</TabsTrigger>
          <TabsTrigger value="rate-limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{profile.customRateLimit}</p>
                    <p className="text-sm text-muted-foreground">Requests/min</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{profile.customLLMEndpoints.length}</p>
                    <p className="text-sm text-muted-foreground">Custom Endpoints</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">99.9%</p>
                    <p className="text-sm text-muted-foreground">SLA Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-2xl font-bold">Active</p>
                    <p className="text-sm text-muted-foreground">Support Status</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Custom Rate Limits
                  </span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    Custom LLM Endpoints
                  </span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Dedicated Support
                  </span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-purple-500" />
                    SLA Agreement
                  </span>
                  <Badge variant="default">99.9%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LLM Endpoints Tab */}
        <TabsContent value="llm-endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Custom LLM Endpoints ({profile.customLLMEndpoints.length})</CardTitle>
                {isOwnerOrAdmin && (
                  <Dialog open={showEndpointDialog} onOpenChange={setShowEndpointDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Endpoint
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Custom LLM Endpoint</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            placeholder="My Custom Model"
                            value={newEndpoint.name}
                            onChange={(e) => setNewEndpoint({...newEndpoint, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endpoint">Endpoint URL</Label>
                          <Input
                            id="endpoint"
                            placeholder="https://api.example.com/v1/chat/completions"
                            value={newEndpoint.endpoint}
                            onChange={(e) => setNewEndpoint({...newEndpoint, endpoint: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="model">Model Name</Label>
                          <Input
                            id="model"
                            placeholder="gpt-4-custom"
                            value={newEndpoint.model}
                            onChange={(e) => setNewEndpoint({...newEndpoint, model: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="provider">Provider</Label>
                          <Select 
                            value={newEndpoint.provider} 
                            onValueChange={(value: any) => setNewEndpoint({...newEndpoint, provider: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI Compatible</SelectItem>
                              <SelectItem value="anthropic">Anthropic</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="apiKey">API Key</Label>
                          <Input
                            id="apiKey"
                            type="password"
                            placeholder="sk-..."
                            value={newEndpoint.apiKey}
                            onChange={(e) => setNewEndpoint({...newEndpoint, apiKey: e.target.value})}
                          />
                        </div>
                        <Button onClick={handleAddEndpoint} className="w-full">
                          Add Endpoint
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.customLLMEndpoints.map((endpoint) => (
                  <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Database className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{endpoint.name}</p>
                        <p className="text-sm text-muted-foreground">{endpoint.model}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {endpoint.provider}
                          </Badge>
                          {endpoint.rateLimitOverride && (
                            <Badge variant="secondary" className="text-xs">
                              {endpoint.rateLimitOverride}/min
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={endpoint.isActive}
                          onCheckedChange={(checked) => 
                            onUpdateLLMEndpoint?.(endpoint.id, { isActive: checked })
                          }
                        />
                        <span className="text-sm text-muted-foreground">
                          {endpoint.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {isOwnerOrAdmin && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onDeleteLLMEndpoint?.(endpoint.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {profile.customLLMEndpoints.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No custom endpoints configured</p>
                    <p className="text-sm">Add your first custom LLM endpoint to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limits Tab */}
        <TabsContent value="rate-limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Global Rate Limit</p>
                  <p className="text-sm text-muted-foreground">
                    Maximum requests per minute for your organization
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={profile.customRateLimit}
                    onChange={(e) => onUpdateRateLimit?.(parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">/min</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                      Rate Limit Guidelines
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Higher rate limits may impact system performance. Contact support for limits above 2000/min.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dedicated Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <p className="font-medium">Technical Contact</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.technicalContact}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-green-500" />
                    <p className="font-medium">Billing Contact</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.billingContact}</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-200">
                      SLA Agreement Active
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      99.9% uptime guarantee with 4-hour response time
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">Enterprise - Custom Contract</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Billing Contact</p>
                    <p className="text-sm text-muted-foreground">{profile.billingContact}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                  </Button>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Custom Enterprise Agreement
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Your organization has a custom enterprise agreement. Contact your account manager for billing inquiries.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
