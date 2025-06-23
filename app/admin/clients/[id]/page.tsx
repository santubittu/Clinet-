"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getClient, updateClient, resetClientPassword, getClientDocuments } from "@/lib/actions"

export default function ClientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const clientId = params.id as string

  const [client, setClient] = useState<Client | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedClient, setEditedClient] = useState<Partial<Client>>({})
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [tempPassword, setTempPassword] = useState("")

  useEffect(() => {
    const loadClientData = async () => {
      try {
        const clientData = await getClient(clientId)
        if (!clientData) {
          toast({
            title: "Error",
            description: "Client not found",
            variant: "destructive",
          })
          router.push("/admin/clients")
          return
        }

        setClient(clientData)
        setEditedClient(clientData)

        const clientDocuments = await getClientDocuments(clientId)
        setDocuments(clientDocuments)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load client data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadClientData()
  }, [clientId, router, toast])

  const handleSaveChanges = async () => {
    if (!client) return

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("id", client.id)
      formData.append("name", editedClient.name || "")
      formData.append("email", editedClient.email || "")
      formData.append("phone", editedClient.phone || "")
      formData.append("address", editedClient.address || "")
      formData.append("contactPerson", editedClient.contactPerson || "")
      formData.append("status", editedClient.status || "active")

      const result = await updateClient(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      setClient({ ...client, ...editedClient })
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Client information updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update client information",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!client) return

    setIsLoading(true)

    try {
      const result = await resetClientPassword(client.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      setTempPassword(result.tempPassword)
      setIsResetDialogOpen(false)

      toast({
        title: "Success",
        description: "Password reset successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p>Loading client information...</p>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p>Client not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-gray-500">Client ID: {client.id}</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsResetDialogOpen(true)}>
                Reset Password
              </Button>
              <Button onClick={() => setIsEditing(true)}>Edit Client</Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Client Details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>View and manage client details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedClient.name || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
                    />
                  ) : (
                    <div className="p-2 border rounded-md">{client.name}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedClient.email || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, email: e.target.value })}
                    />
                  ) : (
                    <div className="p-2 border rounded-md">{client.email}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editedClient.phone || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, phone: e.target.value })}
                    />
                  ) : (
                    <div className="p-2 border rounded-md">{client.phone || "Not provided"}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-person">Primary Contact Person</Label>
                  {isEditing ? (
                    <Input
                      id="contact-person"
                      value={editedClient.contactPerson || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, contactPerson: e.target.value })}
                    />
                  ) : (
                    <div className="p-2 border rounded-md">{client.contactPerson || "Not provided"}</div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Business Address</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={editedClient.address || ""}
                      onChange={(e) => setEditedClient({ ...editedClient, address: e.target.value })}
                    />
                  ) : (
                    <div className="p-2 border rounded-md">{client.address || "Not provided"}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  {isEditing ? (
                    <Select
                      value={editedClient.status || "active"}
                      onValueChange={(value: "active" | "inactive" | "pending") =>
                        setEditedClient({ ...editedClient, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div
                      className={`p-2 border rounded-md capitalize ${
                        client.status === "active"
                          ? "text-green-600"
                          : client.status === "inactive"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {client.status || "Active"}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Created On</Label>
                  <div className="p-2 border rounded-md">{client.createdAt}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Documents</CardTitle>
              <CardDescription>Documents shared with this client</CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.uploadDate}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">No documents have been shared with this client yet</div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push("/admin/upload")}>
                Upload New Document
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent client activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "Viewed document",
                    details: "Balance Sheet Q1 2024.pdf",
                    date: "Apr 12, 2024",
                    time: "10:23 AM",
                  },
                  {
                    action: "Downloaded document",
                    details: "Tax Return 2023.pdf",
                    date: "Apr 10, 2024",
                    time: "3:45 PM",
                  },
                  {
                    action: "Logged in",
                    details: "From IP 192.168.1.1",
                    date: "Apr 10, 2024",
                    time: "3:42 PM",
                  },
                  {
                    action: "Password changed",
                    details: "",
                    date: "Mar 25, 2024",
                    time: "11:30 AM",
                  },
                  {
                    action: "Account created",
                    details: "By Admin User",
                    date: "Jan 15, 2024",
                    time: "9:15 AM",
                  },
                ].map((activity, index) => (
                  <div key={index} className="flex justify-between border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      {activity.details && <p className="text-sm text-gray-500">{activity.details}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{activity.date}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Client Password</DialogTitle>
            <DialogDescription>This will generate a new temporary password for {client.name}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              The client will be required to change their password on next login. The temporary password will be sent to
              their email address.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Temporary Password Dialog */}
      {tempPassword && (
        <Dialog open={true} onOpenChange={() => setTempPassword("")}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Temporary Password Generated</DialogTitle>
              <DialogDescription>A temporary password has been generated for {client.name}.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-gray-100 p-3 rounded-md font-mono text-center">{tempPassword}</div>
              <p className="text-sm text-gray-500 mt-2">
                This password has been sent to {client.email}. The client will be prompted to change this password on
                first login.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setTempPassword("")}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
