import type React from "react"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex">
      <div className="w-64 hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
