"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getNotifications, markNotificationAsRead, deleteNotification } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle } from "lucide-react"
import type { Notification } from "@/lib/types"

export default function NotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        // For demo purposes, we're using CLIENT123
        const data = await getNotifications("CLIENT123", "client")
        setNotifications(data)
      } catch (error) {
        console.error("Failed to load notifications", error)
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [toast])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
      toast({
        title: "Success",
        description: "Notification marked as read",
      })
    } catch (error) {
      console.error("Failed to mark notification as read", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id)
      setNotifications(notifications.filter((n) => n.id !== id))
      toast({
        title: "Success",
        description: "Notification deleted",
      })
    } catch (error) {
      console.error("Failed to delete notification", error)
      toast({
        title: "Error",
        description: "Failed to delete notification",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>Stay updated with important information about your account and documents</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length > 0 ? (
            <AnimatePresence>
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex items-start space-x-4 p-4 border rounded-lg ${!notification.read ? "bg-blue-50 border-blue-100" : "hover:bg-gray-50"} transition-colors`}
                  >
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <p className={`font-medium ${!notification.read ? "text-blue-800" : ""}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 sm:text-right">{notification.createdAt}</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex justify-end mt-3 space-x-2">
                        {!notification.read && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="flex items-center"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Mark as Read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-gray-500">You're all caught up! Check back later for updates.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
