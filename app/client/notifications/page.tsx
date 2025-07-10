"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle, Trash2, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { getNotifications, markNotificationAsRead, deleteNotification, getCurrentUser } from "@/lib/actions"
import { Notification } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { redirect } from "next/navigation"

export default function ClientNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchUserAndNotifications = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.type !== "client") {
        redirect("/login")
        return
      }
      setUser(currentUser)
      setLoading(true)
      const fetchedNotifications = await getNotifications(currentUser.id, "client")
      setNotifications(fetchedNotifications)
      setLoading(false)
    }
    fetchUserAndNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    const result = await markNotificationAsRead(id)
    if (result.success) {
      toast({ title: "Notification marked as read." })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } else {
      toast({ title: "Failed to mark as read", description: result.error, variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    const result = await deleteNotification(id)
    if (result.success) {
      toast({ title: "Notification deleted." })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } else {
      toast({ title: "Failed to delete notification", description: result.error, variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 p-6 md:p-8">
        <h1 className="text-3xl font-bold">My Notifications</h1>
        <Card>
          <CardHeader>
            <CardTitle>Your Notifications</CardTitle>
            <CardDescription>Important updates and alerts from your accountant.</CardDescription>
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

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">My Notifications</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>Important updates and alerts from your accountant.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification.id} className={notification.read ? "text-gray-500" : "font-medium"}>
                  <TableCell>{notification.createdAt}</TableCell>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>{notification.message}</TableCell>
                  <TableCell>{notification.read ? "Read" : "Unread"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!notification.read && (
                        <Button variant="outline" size="icon" onClick={() => handleMarkAsRead(notification.id)}>
                          <CheckCircle className="h-4 w-4" />
                          <span className="sr-only">Mark as Read</span>
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete Notification</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this notification.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(notification.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {notifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No notifications found.
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
