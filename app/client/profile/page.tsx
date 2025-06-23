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

export default function ClientProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: "ABC Corporation",
    email: "contact@abccorp.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, New York, NY 10001",
    contactPerson: "John Smith",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    documentUploads: true,
    reminders: true,
    newsletters: false,
  })

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      })
    }, 1500)
  }

  const handleNotificationUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Notification preferences updated",
        description: "Your notification preferences have been updated successfully",
      })
    }, 1500)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account profile information</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileUpdate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-person">Primary Contact Person</Label>
                <Input
                  id="contact-person"
                  value={profile.contactPerson}
                  onChange={(e) => setProfile({ ...profile, contactPerson: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and client ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Client ID</Label>
                <div className="flex items-center space-x-2">
                  <Input value="CLIENT123" readOnly />
                  <Button variant="outline" size="sm">
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500">This is your unique client identifier in our system</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <Label>Account Status</Label>
                <p className="font-medium text-green-600">Active</p>
                <p className="text-xs text-gray-500">Your account is in good standing</p>
              </div>

              <Separator />

              <div className="space-y-1">
                <Label>Account Created</Label>
                <p>January 15, 2023</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <form onSubmit={handleNotificationUpdate}>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="document-uploads">Document Uploads</Label>
                    <p className="text-xs text-gray-500">Get notified when new documents are uploaded</p>
                  </div>
                  <Switch
                    id="document-uploads"
                    checked={notifications.documentUploads}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, documentUploads: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminders">Reminders</Label>
                    <p className="text-xs text-gray-500">Receive deadline and important date reminders</p>
                  </div>
                  <Switch
                    id="reminders"
                    checked={notifications.reminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, reminders: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newsletters">Newsletters</Label>
                    <p className="text-xs text-gray-500">Receive our monthly newsletter and updates</p>
                  </div>
                  <Switch
                    id="newsletters"
                    checked={notifications.newsletters}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newsletters: checked })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Preferences"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
