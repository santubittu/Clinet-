"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { logout as serverLogout } from "@/lib/actions" // Import the server action

interface LogoutButtonProps extends React.ComponentProps<typeof Button> {}

export function LogoutButton(props: LogoutButtonProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("user")
      localStorage.removeItem("userType") // Clear user type if stored separately

      // Call the server action (optional, for revalidation or server-side session cleanup)
      await serverLogout()

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button onClick={handleLogout} {...props}>
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}
