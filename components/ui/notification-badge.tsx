"use client"

import { useState, useEffect } from "react"
import { Bell } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getNotifications, markNotificationAsRead, type Notification } from "@/lib/actions"

interface NotificationBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  recipientId: string
  recipientType: "admin" | "client"
  count: number
}

export function NotificationBadge({ recipientId, recipientType, count, className, ...props }: NotificationBadgeProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications(recipientId, recipientType)
        setNotifications(data)
      } catch (error) {
        console.error("Failed to load notifications", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [recipientId, recipientType])

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Failed to mark notification as read", error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className={cn("relative", className)} {...props}>
          <Bell className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {count}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">Loading notifications...</div>
        ) : notifications.length > 0 ? (
          <div className="max-h-[400px] overflow-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read ? "bg-gray-50" : ""}`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="w-full">
                  <div className="flex items-start justify-between">
                    <div className={`font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}>
                      {notification.title}
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap ml-2">{notification.createdAt}</div>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                  {!notification.read && (
                    <div className="mt-2 flex justify-end">
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">New</div>
                    </div>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-2 cursor-pointer justify-center">
          <Button variant="ghost" size="sm" className="w-full">
            View All Notifications
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
