"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function ClientSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
    loginNotifications: true,
  })

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirmation password must match",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }, 1500)
  }

  const handleSecurityUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Security settings updated",
        description: "Your security preferences have been updated successfully",
      })
    }, 1500)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordChange}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Password must be at least 8 characters long and include a mix of letters, numbers, and special
                  characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your account security preferences</CardDescription>
          </CardHeader>
          <form onSubmit={handleSecurityUpdate}>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                  <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  id="two-factor"
                  checked={security.twoFactorAuth}
                  onCheckedChange={(checked) => setSecurity({ ...security, twoFactorAuth: checked })}
                />
              </div>

              {security.twoFactorAuth && (
                <Button variant="outline" className="w-full">
                  Set Up Two-Factor Authentication
                </Button>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="session-timeout">Session Timeout</Label>
                  <p className="text-xs text-gray-500">Automatically log out after 30 minutes of inactivity</p>
                </div>
                <Switch
                  id="session-timeout"
                  checked={security.sessionTimeout}
                  onCheckedChange={(checked) => setSecurity({ ...security, sessionTimeout: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="login-notifications">Login Notifications</Label>
                  <p className="text-xs text-gray-500">Receive email notifications for new login attempts</p>
                </div>
                <Switch
                  id="login-notifications"
                  checked={security.loginNotifications}
                  onCheckedChange={(checked) => setSecurity({ ...security, loginNotifications: checked })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account data and access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Download Your Data</h3>
                <p className="text-sm text-gray-500 mb-4">Request a copy of all your data stored in our system</p>
                <Button variant="outline">Request Data Export</Button>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Session Management</h3>
                <p className="text-sm text-gray-500 mb-4">View and manage your active login sessions</p>
                <Button variant="outline">Manage Sessions</Button>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Access Logs</h3>
                <p className="text-sm text-gray-500 mb-4">View a history of your account access and activity</p>
                <Button variant="outline">View Access Logs</Button>
              </div>

              <div className="border rounded-md p-4 border-red-200 bg-red-50">
                <h3 className="font-medium text-red-600 mb-2">Deactivate Account</h3>
                <p className="text-sm text-gray-500 mb-4">Temporarily disable your account access</p>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-100">
                  Deactivate Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
