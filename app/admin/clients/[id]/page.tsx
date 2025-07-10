import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClient, getClientDocuments, getClientActivities } from "@/lib/actions"
import { Client, Document, Activity } from "@/lib/types"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { EditClientForm } from "@/components/edit-client-form" // Assuming you'll create this component
import { Button } from "@/components/ui/button"
import { RefreshCw } from 'lucide-react'
import { ResetClientPasswordButton } from "@/components/reset-client-password-button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { updateClient } from "@/lib/actions"
import { resetClientPassword } from "@/lib/actions"

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const clientId = params.id
  const client: Client | null = await getClient(clientId)

  if (!client) {
    notFound()
  }

  const documents: Document[] = await getClientDocuments(clientId)
  const activities: Activity[] = await getClientActivities(clientId)

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Client Details: {client.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Details about the client and their registration status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Client ID</p>
                <p className="text-lg font-semibold">{client.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge
                  className={`capitalize ${
                    client.status === "active"
                      ? "bg-green-100 text-green-800"
                      : client.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {client.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg">{client.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{client.email}</p>
              </div>
              {client.username && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Username</p>
                  <p className="text-lg">{client.username}</p>
                </div>
              )}
              {client.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-lg">{client.phone}</p>
                </div>
              )}
              {client.contactPerson && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Contact Person</p>
                  <p className="text-lg">{client.contactPerson}</p>
                </div>
              )}
              {client.address && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-lg">{client.address}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Registered</p>
                <p className="text-lg">{client.isRegistered ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Documents Uploaded</p>
                <p className="text-lg">{client.documents}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="text-lg">{client.createdAt}</p>
              </div>
              {client.lastActive && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Active</p>
                  <p className="text-lg">{client.lastActive}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <EditClientForm client={client} />
              <ResetClientPasswordButton clientId={client.id} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions performed by or for this client.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.slice(0, 5).map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{activity.timestamp}</TableCell>
                  </TableRow>
                ))}
                {activities.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-gray-500">
                      No recent activity.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>All documents associated with this client.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Viewed</TableHead>
                <TableHead>Downloaded</TableHead>
                <TableHead>Share Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{doc.viewed ? "Yes" : "No"}</TableCell>
                  <TableCell>{doc.downloaded}</TableCell>
                  <TableCell>
                    {doc.shareLink ? (
                      <a href={doc.shareLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        View Link
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {documents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    No documents for this client.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
