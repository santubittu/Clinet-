"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/actions"
import { Loader2 } from "lucide-react"

interface AuthCheckProps {
  children: React.ReactNode
  requiredRole?: "admin" | "client"
  redirectTo?: string
}

export function AuthCheck({ children, requiredRole, redirectTo = "/login" }: AuthCheckProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()

        if (!user) {
          router.push(redirectTo)
          return
        }

        if (requiredRole && user.role !== requiredRole) {
          // Redirect to appropriate dashboard based on user role
          if (user.role === "admin") {
            router.push("/admin/dashboard")
          } else if (user.role === "client") {
            router.push("/client/dashboard")
          } else {
            router.push(redirectTo)
          }
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push(redirectTo)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, redirectTo, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
