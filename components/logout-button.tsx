"use client"

import { useUser } from '@/contexts/user-context'
import { Button } from '@/libs/design-system'

export function LogoutButton() {
  const { logout } = useUser()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Button 
      onClick={handleLogout}
      variant="outline" 
      size="sm"
      className="ml-2"
    >
      Logout
    </Button>
  )
}
