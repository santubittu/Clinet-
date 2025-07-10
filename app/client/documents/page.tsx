"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Download, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getClientDocuments, downloadDocument, getCurrentUser } from "@/lib/actions"

export default function ClientDocumentsPage() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserAndDocuments = async () => {
      setIsLoading(true)
      const user = await getCurrentUser()
      if (user && user.type === "client") {
        setClientId(user.id)
        try {
          const data = await getClientDocuments(user.id)
          setDocuments(data)
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load documents.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Unauthorized",
          description: "Please log in as a client to view documents.",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }

    fetchUserAndDocuments()
  }, [toast])

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDownloadDocument = async (docId: string) => {
    setIsLoading(true)
    try {
      const result = await downloadDocument(docId)
      if (result.success && result.fileUrl) {
        window.open(result.fileUrl, "_blank")
        toast({
          title: "Download Started",
          description: "Your download should begin shortly.",
        })
        // Update the document in the local state to reflect download count
        setDocuments((prevDocs) =>
          prevDocs.map((doc) => (doc.id === docId ? { ...doc, downloaded: result.downloadCount } : doc)),
        )
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to download document.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error downloading document:", error)
      toast({
        title: "Error",
        description: "Failed to download document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search documents by name or type..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Shared Documents</CardTitle>
          <CardDescription>Access and download documents shared by Santu Saha Hero.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Viewed</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading documents...
                    </TableCell>
                  </TableRow>
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.type}</TableCell>
                      <TableCell>{doc.uploadDate}</TableCell>
                      <TableCell>{doc.size}</TableCell>
                      <TableCell>{doc.viewed ? "Yes" : "No"}</TableCell>
                      <TableCell>{doc.downloaded}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc.id)}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => window.open(doc.file_url, "_blank")}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No documents found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
