"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, LayoutDashboard, Bell, User, Settings, LogOut } from 'lucide-react'
import { LogoutButton } from "./logout-button"

export function ClientSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/client/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Documents",
      href: "/client/documents",
      icon: FileText,
    },
    {
      name: "Notifications",
      href: "/client/notifications",
      icon: Bell,
    },
    {
      name: "My Profile",
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
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link className="flex items-center gap-2 font-semibold" href="/client/dashboard">
            <Package2 className="h-6 w-6" />
            <span className="">Client Portal</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.name}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  {
                    "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-50": pathname === item.href,
                  },
                )}
                href={item.href}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t">
          <LogoutButton />
        </div>
      </div>
    </div>
  )
}

import { Package2 } from 'lucide-react'
