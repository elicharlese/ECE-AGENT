'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Avatar,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/libs/design-system';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  Mail,
  Calendar,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  tier: 'TRIAL' | 'PERSONAL' | 'TEAM' | 'ENTERPRISE'
  createdAt: Date
  lastActive: Date
  totalUsage: number
  revenue: number
  status: 'active' | 'inactive' | 'suspended'
}

interface TrialUser {
  id: string
  email: string
  name: string
  trialStart: Date
  trialEnd: Date
  daysRemaining: number
  usageThisTrial: number
  likelyToConvert: 'high' | 'medium' | 'low'
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [trialUsers, setTrialUsers] = useState<TrialUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)

  useEffect(() => {
    loadUsers()
    loadTrialUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const loadTrialUsers = async () => {
    try {
      const response = await fetch('/api/admin/trial-users')
      if (response.ok) {
        const data = await response.json()
        setTrialUsers(data.trialUsers || [])
      }
    } catch (error) {
      console.error('Failed to load trial users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTierChange = async (userId: string, newTier: string) => {
    try {
      const response = await fetch('/api/admin/users/change-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newTier })
      })

      if (response.ok) {
        await loadUsers()
      }
    } catch (error) {
      console.error('Failed to change user tier:', error)
    }
  }

  const handleUserStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/users/change-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newStatus })
      })

      if (response.ok) {
        await loadUsers()
      }
    } catch (error) {
      console.error('Failed to change user status:', error)
    }
  }

  const handleExtendTrial = async (userId: string, days: number) => {
    try {
      const response = await fetch('/api/admin/trial-users/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, days })
      })

      if (response.ok) {
        await loadTrialUsers()
      }
    } catch (error) {
      console.error('Failed to extend trial:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = tierFilter === 'all' || user.tier === tierFilter
    return matchesSearch && matchesTier
  })

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'TRIAL': return 'bg-blue-100 text-blue-800'
      case 'PERSONAL': return 'bg-green-100 text-green-800'
      case 'TEAM': return 'bg-purple-100 text-purple-800'
      case 'ENTERPRISE': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConversionLikelihoodColor = (likelihood: string) => {
    switch (likelihood) {
      case 'high': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Loading user data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trialUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              {trialUsers.filter(u => u.daysRemaining <= 3).length} expiring soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${users.reduce((sum, user) => sum + user.revenue, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${users.length > 0 ? (users.reduce((sum, user) => sum + user.revenue, 0) / users.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Per user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Management Interface */}
      <Tabs defaultValue="all-users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="trial-users">Trial Management</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                Manage user accounts, tiers, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="TRIAL">Trial</SelectItem>
                    <SelectItem value="PERSONAL">Personal</SelectItem>
                    <SelectItem value="TEAM">Team</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTierBadgeColor(user.tier)}>
                            {user.tier}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>${user.revenue.toFixed(2)}</TableCell>
                        <TableCell>{user.totalUsage.toLocaleString()}</TableCell>
                        <TableCell>{user.lastActive.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setShowUserDialog(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Select
                              value={user.tier}
                              onValueChange={(value) => handleTierChange(user.id, value)}
                            >
                              <SelectTrigger className="w-24 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PERSONAL">Personal</SelectItem>
                                <SelectItem value="TEAM">Team</SelectItem>
                                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial-users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trial User Management</CardTitle>
              <CardDescription>
                Monitor trial users and manage conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trialUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{user.daysRemaining} days left</p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {user.trialEnd.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{user.usageThisTrial.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Usage this trial</p>
                      </div>
                      <Badge className={getConversionLikelihoodColor(user.likelyToConvert)}>
                        {user.likelyToConvert} conversion
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtendTrial(user.id, 7)}
                      >
                        Extend 7 days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtendTrial(user.id, 30)}
                      >
                        Extend 30 days
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Edit Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to user account settings and permissions.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={selectedUser.name} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={selectedUser.email} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={selectedUser.status}
                  onValueChange={(value) => handleUserStatusChange(selectedUser.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowUserDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}