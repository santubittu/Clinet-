"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getClients, uploadDocument } from "@/lib/actions"
import { motion } from "framer-motion"
import { FileText, Upload, X, Check, AlertCircle } from "lucide-react"
import type { Client, DocumentType } from "@/lib/types"

const documentTypes: DocumentType[] = [
  "Balance Sheet",
  "Tax Return",
  "GST Return",
  "P&L Statement",
  "Financial Report",
  "Tax Planning",
  "Financial Review",
  "Other",
]

export default function UploadPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState<DocumentType>("Balance Sheet")
  const [selectedClient, setSelectedClient] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await getClients()
        setClients(data)
      } catch (error) {
        console.error("Failed to load clients", error)
        toast({
          title: "Error",
          description: "Failed to load clients. Please try again.",
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
      const file = e.target.files[0]
      setSelectedFile(file)

      // If document name is empty, use the file name (without extension)
      if (!documentName) {
        const fileName = file.name.replace(/\.[^/.]+$/, "")
        setDocumentName(fileName)
      }
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const simulateProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setUploadSuccess(true)
        setTimeout(() => {
          router.push("/admin/documents")
        }, 1500)
      }
    }, 150)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile || !documentName || !documentType || !selectedClient) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select a file.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    simulateProgress()

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("name", documentName)
      formData.append("type", documentType)
      formData.append("clientId", selectedClient)
      if (description) formData.append("description", description)

      const result = await uploadDocument(formData)

      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
        setIsUploading(false)
        setUploadProgress(0)
        return
      }

      toast({
        title: "Document uploaded",
        description: "The document has been successfully uploaded.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the document. Please try again.",
        variant: "destructive",
      })
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
      </motion.div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Upload New Document</CardTitle>
          <CardDescription>Upload a document to share with your clients</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div className="space-y-2">
              <Label htmlFor="file">Document File</Label>
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX up to 10MB</p>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isUploading}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document-name">Document Name</Label>
                <Input
                  id="document-name"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  placeholder="Enter document name"
                  disabled={isUploading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type</Label>
                <Select
                  value={documentType}
                  onValueChange={(value) => setDocumentType(value as DocumentType)}
                  disabled={isUploading}
                >
                  <SelectTrigger id="document-type">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Client Selection */}
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              {isLoading ? (
                <div className="h-10 flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 mr-2"></div>
                  <span className="text-sm text-gray-500">Loading clients...</span>
                </div>
              ) : (
                <Select value={selectedClient} onValueChange={setSelectedClient} disabled={isUploading}>
                  <SelectTrigger id="client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] p-2 border rounded-md"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter additional details about this document"
                disabled={isUploading}
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center text-green-600 text-sm mt-2"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Upload complete! Redirecting to documents...
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Warning */}
            <div className="flex items-start space-x-2 text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Important</p>
                <p>Make sure you have the right to share this document with the selected client.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/documents")}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || !documentName || !documentType || !selectedClient || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
