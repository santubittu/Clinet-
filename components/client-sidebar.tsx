"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Home, LogOut, Settings, User, Bell, BarChart2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function ClientSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      name: "Dashboard",
      href: "/client/dashboard",
      icon: Home,
    },
    {
      name: "Documents",
      href: "/client/documents",
      icon: FileText,
    },
    {
      name: "Analytics",
      href: "/client/analytics",
      icon: BarChart2,
    },
    {
      name: "Notifications",
      href: "/client/notifications",
      icon: Bell,
    },
    {
      name: "Profile",
      href: "/client/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/client/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-6">
        <Link href="/client/dashboard">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h2 className="text-xl font-bold">Santu Saha Hero</h2>
            <p className="text-xs text-gray-500">Client Portal</p>
          </motion.div>
        </Link>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <nav className="flex-1 px-2 space-y-1">
          {routes.map((route, index) => (
            <motion.div
              key={route.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link
                href={route.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                  pathname === route.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <route.icon className="mr-3 h-5 w-5" />
                {route.name}
              </Link>
            </motion.div>
          ))}
        </nav>
        <div className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Link href="/login">
              <Button variant="outline" className="w-full flex items-center justify-center">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
