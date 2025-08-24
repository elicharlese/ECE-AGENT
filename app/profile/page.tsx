import React from 'react'
import { UserProfile } from '@/components/user/user-profile'

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <UserProfile isEditable />
    </div>
  )
}
