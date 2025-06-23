"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, UserPlus, RefreshCw, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getClients, createClient, resetClientPassword, deleteClient } from "@/lib/actions"

export default function ClientsPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [newClient, setNewClient] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    contactPerson: "",
  })
  const [tempPassword, setTempPassword] = useState("")

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients()
        setClients(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load clients",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadClients()
  }, [toast])

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", newClient.name)
      formData.append("email", newClient.email)
      formData.append("id", newClient.id)
      formData.append("phone", newClient.phone)
      formData.append("address", newClient.address)
      formData.append("contactPerson", newClient.contactPerson)

      const result = await createClient(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      setClients([...clients, result.client])
      setTempPassword(result.tempPassword)
      setNewClient({ id: "", name: "", email: "", phone: "", address: "", contactPerson: "" })
      setIsAddDialogOpen(false)

      toast({
        title: "Success",
        description: "Client created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create client",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) return

    setIsLoading(true)

    try {
      const result = await deleteClient(selectedClient.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      setClients(clients.filter((client) => client.id !== selectedClient.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Success",
        description: "Client deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!selectedClient) return

    setIsLoading(true)

    try {
      const result = await resetClientPassword(selectedClient.id)

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>Create a new client account and generate a unique client ID.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClient}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID (Optional)</Label>
                  <Input
                    id="client-id"
                    value={newClient.id}
                    onChange={(e) => setNewClient({ ...newClient, id: e.target.value })}
                    placeholder="Leave blank to auto-generate"
                  />
                  <p className="text-xs text-gray-500">If left blank, a unique ID will be automatically generated</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name</Label>
                  <Input
                    id="client-name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    placeholder="Enter client name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-email">Client Email</Label>
                  <Input
                    id="client-email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    placeholder="Enter client email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-phone">Phone Number (Optional)</Label>
                  <Input
                    id="client-phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-contact">Contact Person (Optional)</Label>
                  <Input
                    id="client-contact"
                    value={newClient.contactPerson}
                    onChange={(e) => setNewClient({ ...newClient, contactPerson: e.target.value })}
                    placeholder="Enter primary contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-address">Address (Optional)</Label>
                  <Input
                    id="client-address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    placeholder="Enter client address"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Client"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {tempPassword && (
          <Dialog open={true} onOpenChange={() => setTempPassword("")}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Temporary Password Generated</DialogTitle>
                <DialogDescription>Please save this temporary password. It will not be shown again.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-gray-100 p-3 rounded-md font-mono text-center">{tempPassword}</div>
                <p className="text-sm text-gray-500 mt-2">
                  The client will be prompted to change this password on first login.
                </p>
              </div>
              <DialogFooter>
                <Button onClick={() => setTempPassword("")}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search clients by name, ID, or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Documents</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Loading clients...
                </TableCell>
              </TableRow>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    <span
                      className={`capitalize ${
                        client.status === "active"
                          ? "text-green-600"
                          : client.status === "inactive"
                            ? "text-red-600"
                            : "text-yellow-600"
                      }`}
                    >
                      {client.status || "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{client.documents}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedClient(client)
                          setIsResetDialogOpen(true)
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/clients/${client.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedClient(client)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No clients found matching your search
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Client Password</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the password for {selectedClient?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              This will generate a new temporary password and invalidate the current password.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleResetPassword} disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Client Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>Are you sure you want to delete {selectedClient?.name}?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              This action cannot be undone. This will permanently delete the client account and remove all associated
              data.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
