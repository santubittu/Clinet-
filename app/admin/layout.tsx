"use client"

import type React from "react"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AuthCheck } from "@/components/auth-check" // Import AuthCheck

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthCheck requiredRole="admin">
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
      </div>
    </AuthCheck>
  )
}
