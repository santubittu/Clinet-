"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react"
import { authenticateClient, authenticateAdmin } from "@/lib/actions"

export default function LoginPage() {
  const [clientData, setClientData] = useState({ identifier: "", password: "" })
  const [adminData, setAdminData] = useState({ email: "", password: "" })
  const [showClientPassword, setShowClientPassword] = useState(false)
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClientLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!clientData.identifier || !clientData.password) {
      setError("Please fill in all fields")
      return
    }

    startTransition(async () => {
      const result = await authenticateClient(clientData.identifier, clientData.password)

      if (result.success) {
        router.push("/client/dashboard")
        router.refresh()
      } else {
        setError(result.error || "Login failed")
      }
    })
  }

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!adminData.email || !adminData.password) {
      setError("Please fill in all fields")
      return
    }

    startTransition(async () => {
      const result = await authenticateAdmin(adminData.email, adminData.password)

      if (result.success) {
        router.push("/admin/dashboard")
        router.refresh()
      } else {
        setError(result.error || "Login failed")
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Santu Saha Hero</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your secure portal</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">Choose your account type to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="client" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="client">Client Portal</TabsTrigger>
                <TabsTrigger value="admin">Admin Portal</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="client">
                <form onSubmit={handleClientLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-identifier">Client ID or Username</Label>
                    <Input
                      id="client-identifier"
                      type="text"
                      placeholder="Enter your Client ID or Username"
                      value={clientData.identifier}
                      onChange={(e) => setClientData({ ...clientData, identifier: e.target.value })}
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="client-password"
                        type={showClientPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={clientData.password}
                        onChange={(e) => setClientData({ ...clientData, password: e.target.value })}
                        disabled={isPending}
                        className="h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowClientPassword(!showClientPassword)}
                        disabled={isPending}
                      >
                        {showClientPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11" disabled={isPending}>
                    {isPending ? "Signing in..." : "Sign In to Client Portal"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter your email"
                      value={adminData.email}
                      onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                      disabled={isPending}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="admin-password"
                        type={showAdminPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={adminData.password}
                        onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                        disabled={isPending}
                        className="h-11 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        disabled={isPending}
                      >
                        {showAdminPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-11" disabled={isPending}>
                    {isPending ? "Signing in..." : "Sign In to Admin Portal"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:underline font-medium">
                  Register here
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                <Link href="#" className="hover:underline">
                  Forgot your password?
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-800">Demo Credentials</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-blue-700 space-y-2">
              <div>
                <strong>Client:</strong> acme_corp / password123
              </div>
              <div>
                <strong>Admin:</strong> admin@santusahahero.com / admin123
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
