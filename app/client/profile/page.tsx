"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, getClient, updateClient } from "@/lib/actions"
import { Client } from "@/lib/types"
import { Loader2 } from 'lucide-react'
import { redirect } from "next/navigation"

export default function ClientProfilePage() {
  const { toast } = useToast()
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchClientData = async () => {
      const user = await getCurrentUser()
      if (!user || user.type !== "client") {
        redirect("/login")
        return
      }
      const fetchedClient = await getClient(user.id)
      setClient(fetchedClient)
      setIsLoading(false)
    }
    fetchClientData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!client) return

    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    formData.append("id", client.id) // Ensure client ID is passed

    const result = await updateClient(formData)

    if (result.success) {
      toast({ title: "Profile updated successfully!" })
      // Re-fetch client data to ensure UI is in sync with latest data
      const updatedClient = await getClient(client.id)
      setClient(updatedClient)
    } else {
      toast({ title: "Failed to update profile", description: result.error, variant: "destructive" })
    }
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Loading Profile...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Could not load client profile. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your contact and personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={client.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" defaultValue={client.email} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" defaultValue={client.username || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" defaultValue={client.phone || ""} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={client.address || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person (if applicable)</Label>
              <Input id="contactPerson" name="contactPerson" defaultValue={client.contactPerson || ""} />
            </div>
            <Button type="submit" className="w-fit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
          <CardDescription>Overview of your account status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client ID</Label>
              <p className="font-medium">{client.id}</p>
            </div>
            <div className="space-y-2">
              <Label>Account Status</Label>
              <p className="font-medium capitalize">{client.status}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Registered</Label>
              <p className="font-medium">{client.isRegistered ? "Yes" : "No"}</p>
            </div>
            <div className="space-y-2">
              <Label>Documents Uploaded</Label>
              <p className="font-medium">{client.documents}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account Created</Label>
              <p className="font-medium">{client.createdAt}</p>
            </div>
            <div className="space-y-2">
              <Label>Last Active</Label>
              <p className="font-medium">{client.lastActive || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
