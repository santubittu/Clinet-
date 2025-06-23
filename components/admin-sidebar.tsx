"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, FolderUp, Home, LogOut, Settings, Users, UserPlus, Activity } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: Home,
    },
    {
      name: "Clients",
      href: "/admin/clients",
      icon: UserPlus,
    },
    {
      name: "Admin Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      name: "Documents",
      href: "/admin/documents",
      icon: FileText,
    },
    {
      name: "Upload",
      href: "/admin/upload",
      icon: FolderUp,
    },
    {
      name: "Activity Log",
      href: "/admin/activity",
      icon: Activity,
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="p-6">
        <Link href="/admin/dashboard">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h2 className="text-xl font-bold">Santu Saha Hero</h2>
            <p className="text-xs text-gray-500">Admin Portal</p>
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
      </div>
      <div className="p-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Button variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
