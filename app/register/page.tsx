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
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react"
import { verifyClientId, registerClient, checkClientIdAvailability, verifyOtp } from "@/lib/actions"

type Step = "verify" | "register" | "otp" | "success"

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("verify")
  const [clientId, setClientId] = useState("")
  const [isCustomId, setIsCustomId] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isPending, startTransition] = useTransition()
  const [clientData, setClientData] = useState<any>(null)
  const router = useRouter()

  const handleVerifyClientId = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!clientId) {
      setError("Please enter a Client ID")
      return
    }

    startTransition(async () => {
      const result = await verifyClientId(clientId, isCustomId)

      if (result.success) {
        setClientData(result.client)
        setSuccess(isCustomId ? "Client ID is available!" : "Client ID verified! You can now register.")
        setTimeout(() => {
          setStep("register")
          setSuccess("")
        }, 1000)
      } else {
        setError(result.error || "Verification failed")
      }
    })
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    startTransition(async () => {
      const result = await registerClient({
        clientId,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        isCustomId,
      })

      if (result.success) {
        setStep("otp")
      } else {
        setError(result.error || "Registration failed")
      }
    })
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      return
    }

    startTransition(async () => {
      const result = await verifyOtp(formData.email, otp)

      if (result.success) {
        setStep("success")
      } else {
        setError(result.error || "OTP verification failed")
      }
    })
  }

  const handleCheckAvailability = async () => {
    if (!clientId || clientId.length < 4) {
      setError("Client ID must be at least 4 characters")
      return
    }

    setError("")
    startTransition(async () => {
      const result = await checkClientIdAvailability(clientId)

      if (result.available) {
        setSuccess("Client ID is available!")
      } else {
        setError(result.error || "Client ID is not available")
      }
    })
  }

  const renderVerifyStep = () => (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl text-center">Client Registration</CardTitle>
        <CardDescription className="text-center">Enter your Client ID to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyClientId} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              type="text"
              placeholder="Enter your Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value.toUpperCase())}
              disabled={isPending}
              className="h-11"
            />
            <p className="text-xs text-gray-500">Your Client ID was provided by Santu Saha Hero</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="custom-id"
              checked={isCustomId}
              onCheckedChange={(checked) => setIsCustomId(checked as boolean)}
              disabled={isPending}
            />
            <Label htmlFor="custom-id" className="text-sm">
              I want to create my own Client ID
            </Label>
          </div>

          {isCustomId && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCheckAvailability}
                disabled={isPending || !clientId}
                className="w-full bg-transparent"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Availability"
                )}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full h-11" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Client ID"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderRegisterStep = () => (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2 mb-2">
          <Button variant="ghost" size="sm" onClick={() => setStep("verify")} className="p-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-xl">Complete Registration</CardTitle>
            <CardDescription>
              Client ID: <Badge variant="secondary">{clientId}</Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isPending}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Choose a username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              disabled={isPending}
              className="h-11"
            />
            <p className="text-xs text-gray-500">You can use this username to log in instead of your Client ID</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isPending}
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={isPending}
                className="h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isPending}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full h-11" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )

  const renderOtpStep = () => (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-xl">Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a 6-digit code to <strong>{formData.email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              disabled={isPending}
              className="h-11 text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full h-11" disabled={isPending || otp.length !== 6}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Email"
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" disabled={isPending}>
            Resend Code
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSuccessStep = () => (
    <Card className="shadow-xl border-0">
      <CardHeader className="space-y-1 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-xl text-green-800">Registration Complete!</CardTitle>
        <CardDescription>Your account has been successfully created</CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Your login credentials:</p>
          <div className="space-y-1">
            <p>
              <strong>Client ID:</strong> {clientId}
            </p>
            <p>
              <strong>Username:</strong> {formData.username}
            </p>
            <p>
              <strong>Email:</strong> {formData.email}
            </p>
          </div>
        </div>

        <Button onClick={() => router.push("/login")} className="w-full h-11">
          Sign In to Your Account
        </Button>

        <p className="text-xs text-gray-500">
          You can now access your secure client portal using either your Client ID or username
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Santu Saha Hero</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Join our secure client portal</p>
        </div>

        {/* Step Content */}
        {step === "verify" && renderVerifyStep()}
        {step === "register" && renderRegisterStep()}
        {step === "otp" && renderOtpStep()}
        {step === "success" && renderSuccessStep()}

        {/* Back to Home */}
        {step === "verify" && (
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
