"use client"

import type React from "react"

import { ClientSidebar } from "@/components/client-sidebar"
import { AuthCheck } from "@/components/auth-check" // Import AuthCheck

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthCheck requiredRole="client">
      <div className="flex min-h-screen w-full">
        <ClientSidebar />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{children}</main>
      </div>
    </AuthCheck>
  )
}
