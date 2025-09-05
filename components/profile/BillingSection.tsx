'use client'

import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
  Tabs
} from '@/libs/design-system';
import { Button } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'

// TODO: Replace deprecated components: Progress
// 
// TODO: Replace deprecated components: Progress
// import { Progress } from '@/components/ui/progress'
import { TabsContent, TabsList, TabsTrigger } from '@/libs/design-system'
// TODO: Replace deprecated components: Tabs
// 
// TODO: Replace deprecated components: Tabs
// import { Tabs } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/libs/design-system'
import { Alert, AlertDescription, AlertTitle } from '@/libs/design-system'
import {
  CreditCard,
  DollarSign,
  Calendar,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Trash2,
  Wallet,
  Receipt,
  TrendingUp,
  Clock
} from 'lucide-react'
import { UserProfile } from '@/src/types/user-tiers'

interface BillingSectionProps {
  profile: UserProfile
}

interface Invoice {
  id: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  date: Date
  description: string
  downloadUrl?: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'crypto'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export function BillingSection({ profile }: BillingSectionProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setIsLoading(true)
      // TODO: Load real billing data from API
      setInvoices([
        {
          id: 'inv_001',
          amount: 29.00,
          status: 'paid',
          date: new Date('2024-01-01'),
          description: 'Team Plan - January 2024',
          downloadUrl: '#'
        },
        {
          id: 'inv_002',
          amount: 29.00,
          status: 'paid',
          date: new Date('2024-02-01'),
          description: 'Team Plan - February 2024',
          downloadUrl: '#'
        }
      ])

      setPaymentMethods([
        {
          id: 'pm_001',
          type: 'card',
          brand: 'visa',
          last4: '4242',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        }
      ])
    } catch (error) {
      console.error('Failed to load billing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadInvoice = (invoice: Invoice) => {
    // TODO: Implement invoice download
    console.log('Downloading invoice:', invoice.id)
  }

  const handleSetDefaultPayment = async (paymentMethodId: string) => {
    try {
      // TODO: Update default payment method via API
      setPaymentMethods(methods =>
        methods.map(method => ({
          ...method,
          isDefault: method.id === paymentMethodId
        }))
      )
    } catch (error) {
      console.error('Failed to update default payment method:', error)
    }
  }

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    try {
      // TODO: Remove payment method via API
      setPaymentMethods(methods =>
        methods.filter(method => method.id !== paymentMethodId)
      )
    } catch (error) {
      console.error('Failed to remove payment method:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'crypto') {
      return <Wallet className="h-4 w-4" />
    }
    return <CreditCard className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mr-2" />
          <span>Loading billing information...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan & Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold capitalize">{profile.tier} Plan</h3>
              <p className="text-sm text-muted-foreground">
                {profile.tier === 'personal' ? '$9/month' :
                 profile.tier === 'team' ? '$29/month per user' :
                 'Custom pricing'}
              </p>
            </div>
            <Badge variant="default" className="capitalize">
              {profile.tier}
            </Badge>
          </div>

          {/* Usage Limits */}
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Messages Used</span>
                <span>{profile.usage.conversationsToday} / {profile.limits.maxMessagesPerDay === -1 ? '∞' : profile.limits.maxMessagesPerDay}</span>
              </div>
              <Progress
                value={profile.limits.maxMessagesPerDay === -1 ? 0 : (profile.usage.conversationsToday / profile.limits.maxMessagesPerDay) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Agents Created</span>
                <span>{profile.usage.agentsCreated} / {profile.limits.maxAgents === -1 ? '∞' : profile.limits.maxAgents}</span>
              </div>
              <Progress
                value={profile.limits.maxAgents === -1 ? 0 : (profile.usage.agentsCreated / profile.limits.maxAgents) * 100}
                className="h-2"
              />
            </div>
          </div>

          {profile.tier === 'personal' && (
            <Alert className="border-blue-200 bg-blue-50">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Upgrade Available</AlertTitle>
              <AlertDescription className="text-blue-700">
                Unlock unlimited usage and team features with our Team plan.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="payment-methods" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        {/* Payment Methods */}
        <TabsContent value="payment-methods" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Methods</CardTitle>
                <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Add a new payment method for your subscription.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-20">
                          <CreditCard className="h-6 w-6 mr-2" />
                          Credit Card
                        </Button>
                        <Button variant="outline" className="h-20">
                          <Wallet className="h-6 w-6 mr-2" />
                          Crypto Wallet
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
                        Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getPaymentMethodIcon(method)}
                      <div>
                        <p className="font-medium">
                          {method.type === 'card' ?
                            `${method.brand?.toUpperCase()} **** ${method.last4}` :
                            'Crypto Wallet'
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {method.type === 'card' ?
                            `Expires ${method.expiryMonth}/${method.expiryYear}` :
                            'Connected wallet'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                      <div className="flex gap-1">
                        {!method.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultPayment(method.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePaymentMethod(method.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {paymentMethods.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No payment methods added</p>
                    <p className="text-sm">Add a payment method to manage your subscription</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing History */}
        <TabsContent value="billing-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{invoice.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {invoices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No billing history</p>
                    <p className="text-sm">Your billing history will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Invoice #{invoice.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                        {getStatusBadge(invoice.status)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadInvoice(invoice)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}

                {invoices.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No invoices found</p>
                    <p className="text-sm">Your invoices will appear here</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Billing Alerts */}
      {invoices.some(inv => inv.status === 'overdue') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Payment Required</AlertTitle>
          <AlertDescription className="text-red-700">
            You have overdue invoices. Please update your payment method or contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}