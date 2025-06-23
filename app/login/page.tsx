"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Client login state
  const [clientCredentials, setClientCredentials] = useState({
    clientId: "",
    password: "",
  })

  // Admin login state
  const [adminCredentials, setAdminCredentials] = useState({
    email: "admin@santusahahero.com",
    password: "admin123",
  })

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate inputs
    if (!clientCredentials.clientId || !clientCredentials.password) {
      toast({
        title: "Missing information",
        description: "Please enter your client ID and password",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Simulate login process
    setTimeout(() => {
      // For demo purposes, accept CLIENT123 with any password
      if (clientCredentials.clientId === "CLIENT123") {
        toast({
          title: "Login successful",
          description: "Welcome to your secure client portal",
        })
        router.push("/client/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Invalid client ID or password. For demo, use CLIENT123.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }, 1500)
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate inputs
    if (!adminCredentials.email || !adminCredentials.password) {
      toast({
        title: "Missing information",
        description: "Please enter your email and password",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Simulate login process
    setTimeout(() => {
      // For demo purposes, accept admin@santusahahero.com with password admin123
      if (adminCredentials.email === "admin@santusahahero.com" && adminCredentials.password === "admin123") {
        toast({
          title: "Admin login successful",
          description: "Welcome to the admin portal",
        })
        router.push("/admin/dashboard")
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. For demo, use admin@santusahahero.com and admin123.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-gray-900">Santu Saha Hero</h1>
            <p className="text-sm text-gray-500">Secure Client Portal</p>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="client">Client Login</TabsTrigger>
              <TabsTrigger value="admin">Staff Login</TabsTrigger>
            </TabsList>

            <TabsContent value="client">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Client Login</CardTitle>
                  <CardDescription>Access your financial documents securely</CardDescription>
                </CardHeader>
                <form onSubmit={handleClientLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="client-id">Client ID or Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="client-id"
                          type="text"
                          placeholder="Enter your client ID or email"
                          className="pl-10"
                          value={clientCredentials.clientId}
                          onChange={(e) => setClientCredentials({ ...clientCredentials, clientId: e.target.value })}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">For demo, use: CLIENT123</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="client-password">Password</Label>
                        <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="client-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={clientCredentials.password}
                          onChange={(e) => setClientCredentials({ ...clientCredentials, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">For demo, any password will work</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                    <p className="text-sm text-center text-gray-500">
                      Don&apos;t have an account?{" "}
                      <Link href="/register" className="text-gray-900 hover:underline">
                        Register with your Client ID
                      </Link>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Staff Login</CardTitle>
                  <CardDescription>Access the firm&apos;s admin portal</CardDescription>
                </CardHeader>
                <form onSubmit={handleAdminLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10"
                          value={adminCredentials.email}
                          onChange={(e) => setAdminCredentials({ ...adminCredentials, email: e.target.value })}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500">For demo, use: admin@santusahahero.com</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="admin-password">Password</Label>
                        <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-gray-900">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="admin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          value={adminCredentials.password}
                          onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">For demo, use: admin123</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
