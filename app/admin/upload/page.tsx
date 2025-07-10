"use client"

import { CardFooter } from "@/components/ui/card"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { getClients, uploadDocument } from "@/lib/actions"
import { Loader2 } from "lucide-react"

export default function UploadPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("")
  const [selectedClient, setSelectedClient] = useState("")
  const [description, setDescription] = useState("")
  const [generateShareLink, setGenerateShareLink] = useState(false)

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients()
        setClients(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load clients.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadClients()
  }, [toast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setDocumentName(e.target.files[0].name.split(".")[0] || "") // Pre-fill name from file name
    } else {
      setFile(null)
      setDocumentName("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!file || !documentName || !documentType || !selectedClient) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", documentName)
      formData.append("type", documentType)
      formData.append("clientId", selectedClient)
      formData.append("description", description)
      formData.append("generateLink", String(generateShareLink))

      const result = await uploadDocument(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Upload Successful",
        description: `Document "${result.document.name}" uploaded and shared with ${result.document.client}.`,
      })

      // Reset form
      setFile(null)
      setDocumentName("")
      setDocumentType("")
      setSelectedClient("")
      setDescription("")
      setGenerateShareLink(false)
      if (document.getElementById("file-upload") as HTMLInputElement) {
        ;(document.getElementById("file-upload") as HTMLInputElement).value = ""
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Document Upload</CardTitle>
          <CardDescription>Upload a new document and assign it to a client.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Document File</Label>
              <Input id="file-upload" type="file" onChange={handleFileChange} required />
              {file && <p className="text-sm text-gray-500">Selected file: {file.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-name">Document Name</Label>
              <Input
                id="document-name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="e.g., Q1 2024 Financial Report"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={documentType} onValueChange={setDocumentType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Balance Sheet">Balance Sheet</SelectItem>
                  <SelectItem value="Tax Return">Tax Return</SelectItem>
                  <SelectItem value="GST Return">GST Return</SelectItem>
                  <SelectItem value="P&L Statement">P&L Statement</SelectItem>
                  <SelectItem value="Financial Report">Financial Report</SelectItem>
                  <SelectItem value="Tax Planning">Tax Planning</SelectItem>
                  <SelectItem value="Financial Review">Financial Review</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-select">Assign to Client</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient} required disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.length > 0 ? (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.id})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      No clients available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief description of the document."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="generate-link"
                checked={generateShareLink}
                onCheckedChange={(checked: boolean) => setGenerateShareLink(checked)}
              />
              <Label htmlFor="generate-link" className="text-sm font-medium leading-none">
                Generate public share link
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
