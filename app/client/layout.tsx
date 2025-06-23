import type React from "react"
import { ClientSidebar } from "@/components/client-sidebar"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex">
      <div className="w-64 hidden md:block">
        <ClientSidebar />
      </div>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
