"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [clientId, setClientId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState(1)

  const handleVerifyClientId = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate client ID verification
    setTimeout(() => {
      setIsLoading(false)
      if (clientId === "CLIENT123") {
        toast({
          title: "Client ID verified",
          description: "Please complete your registration",
        })
        setStep(2)
      } else {
        toast({
          title: "Invalid Client ID",
          description: "Please contact your accountant for a valid Client ID",
          variant: "destructive",
        })
      }
    }, 1500)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      setIsLoading(false)
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords match",
        variant: "destructive",
      })
      return
    }

    // Simulate registration process
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Registration successful",
        description: "You can now log in to your account",
      })
      router.push("/login")
    }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-gray-900">Santu Saha Hero</h1>
            <p className="text-sm text-gray-500">Secure Client Portal</p>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Registration</CardTitle>
            <CardDescription>
              {step === 1 ? "Enter the Client ID provided by your accountant" : "Complete your account setup"}
            </CardDescription>
          </CardHeader>

          {step === 1 ? (
            <form onSubmit={handleVerifyClientId}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input
                    id="client-id"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="Enter the Client ID provided by your accountant"
                    required
                  />
                  <p className="text-xs text-gray-500">For demo purposes, use: CLIENT123</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify Client ID"}
                </Button>
                <p className="text-sm text-center text-gray-500">
                  Already have an account?{" "}
                  <Link href="/login" className="text-gray-900 hover:underline">
                    Login
                  </Link>
                </p>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a secure password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Registering..." : "Complete Registration"}
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                  Back
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
