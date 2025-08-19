'use client'

import * as React from 'react'
import { X, Phone, Video, Mail, MapPin, Shield, Bell, Share } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

interface ContactInfoPanelProps {
  isOpen: boolean
  onClose: () => void
  contact: {
    name: string
    phone: string
    email?: string
    avatar?: string
    status?: string
  }
}

export function ContactInfoPanel({ isOpen, onClose, contact }: ContactInfoPanelProps) {
  const [hideAlerts, setHideAlerts] = React.useState(false)
  const [sendReadReceipts, setSendReadReceipts] = React.useState(true)
  const [shareLocation, setShareLocation] = React.useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Contact Info</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-gray-100"
          aria-label="Close contact info"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Contact Details */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 text-center">
          <Avatar className="w-24 h-24 mx-auto mb-4">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-semibold mb-1">{contact.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{contact.status || 'Active now'}</p>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100">
              <Phone className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Call</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100">
              <Video className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Video</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Mail</span>
            </button>
            <button className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-gray-100">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Info</span>
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="px-4 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-500">iMessage</p>
              <p className="text-base font-medium">Today 10:34 AM</p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Phone</p>
                <p className="text-sm font-medium">{contact.phone}</p>
              </div>
              {contact.email && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm font-medium">{contact.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Sharing */}
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Request Location
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Share className="w-4 h-4 mr-2" />
              Share My Location
            </Button>
            <Button variant="outline" className="w-full justify-start text-blue-600">
              <MapPin className="w-4 h-4 mr-2" />
              Send My Current Location
            </Button>
          </div>

          {/* Settings */}
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Advanced Message Security</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Hide Alerts</span>
              </div>
              <Switch
                checked={hideAlerts}
                onCheckedChange={setHideAlerts}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Send Read Receipts</span>
              </div>
              <Switch
                checked={sendReadReceipts}
                onCheckedChange={setSendReadReceipts}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm">Share Focus Status</span>
              </div>
              <Switch
                checked={shareLocation}
                onCheckedChange={setShareLocation}
              />
            </div>

            <Button 
              variant="link" 
              className="w-full text-blue-600 hover:text-blue-700 mt-2"
            >
              Turn On Contact Key Verification
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
