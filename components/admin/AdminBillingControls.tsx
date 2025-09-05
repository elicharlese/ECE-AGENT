"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system'
import { Button } from '@/libs/design-system'
import { Badge } from '@/libs/design-system'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,  } from '@/libs/design-system'

export function AdminBillingControls() {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing Controls</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Stripe</Badge>
            <span className="text-sm text-muted-foreground">Payments operational</span>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">View Sample Invoice</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invoice</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <p className="text-lg font-semibold">$0.00</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p>-</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <p>-</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <p>Sample invoice for admin review</p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}