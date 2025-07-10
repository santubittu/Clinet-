"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  Activity,
  Settings,
  BarChart,
  LogOut,
  UserCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getCurrentUser, logout } from "@/lib/actions" // Import logout action

export function AdminSidebar() {
  const pathname = usePathname()
  const [userName, setUserName] = useState("Admin User")
  const [userRole, setUserRole] = useState("Admin")

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      if (user && user.type === "admin") {
        setUserName(user.name)
        setUserRole(user.role.charAt(0).toUpperCase() + user.role.slice(1))
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <aside className="flex h-screen w-16 flex-col items-center border-r bg-gray-100 p-2 dark:bg-gray-800">
      <nav className="flex flex-col items-center gap-4 py-4">
        <Link className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" href="/admin/dashboard">
          <img src="/placeholder-logo.svg" width="36" height="36" alt="Logo" className="h-9 w-9" />
          <span className="sr-only">Santu Saha Hero</span>
        </Link>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  pathname === "/admin/dashboard" ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                href="/admin/dashboard"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  pathname.startsWith("/admin/clients") ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                href="/admin/clients"
              >
                <Users className="h-5 w-5" />
                <span className="sr-only">Clients</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Clients</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  pathname.startsWith("/admin/documents") ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                href="/admin/documents"
              >
                <FileText className="h-5 w-5" />
                <span className="sr-only">Documents</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Documents</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  pathname === "/admin/upload" ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                href="/admin/upload"
              >
                <Upload className="h-5 w-5" />
                <span className="sr-only">Upload</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Upload</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  pathname === "/admin/activity" ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                href="/admin/activity"
              >
                <Activity className="h-5 w-5" />
                <span className="sr-only">Activity Log</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Activity Log</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  pathname === "/admin/reports" ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                href="/admin/reports"
              >
                <BarChart className="h-5 w-5" />
                <span className="sr-only">Reports</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Reports</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  pathname.startsWith("/admin/users") ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                href="/admin/users"
              >
                <Users className="h-5 w-5" />
                <span className="sr-only">Admin Users</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Admin Users</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  pathname === "/admin/settings" ? "bg-gray-200 dark:bg-gray-700" : ""
                }`}
                href="/admin/settings"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 py-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">User Profile</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="flex flex-col">
                <span>{userName}</span>
                <span className="text-xs text-gray-500">{userRole}</span>
              </div>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={handleLogout} // Use the logout action
              >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </nav>
    </aside>
  )
}
