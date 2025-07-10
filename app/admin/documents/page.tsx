"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Share2, Trash2, Download, LinkIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  getDocuments,
  deleteDocument,
  shareDocuments,
  generateDocumentShareLink,
  downloadDocument,
} from "@/lib/actions"
import { getClients } from "@/lib/actions" // Import getClients to select recipients

export default function DocumentsPage() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedDocumentsToShare, setSelectedDocumentsToShare] = useState<string[]>([])
  const [selectedClientsToShare, setSelectedClientsToShare] = useState<string[]>([])
  const [generatedShareLink, setGeneratedShareLink] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const docs = await getDocuments()
        setDocuments(docs)
        const clientList = await getClients()
        setClients(clientList)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return

    setIsLoading(true)

    try {
      const result = await deleteDocument(selectedDocument.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      setDocuments(documents.filter((doc) => doc.id !== selectedDocument.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Success",
        description: "Document deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShareDocuments = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      selectedDocumentsToShare.forEach((docId) => formData.append("documentIds", docId))
      selectedClientsToShare.forEach((clientId) => formData.append("clientIds", clientId))

      const result = await shareDocuments(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `Successfully shared ${result.documents.length} documents.`,
      })
      setIsShareDialogOpen(false)
      setSelectedDocumentsToShare([])
      setSelectedClientsToShare([])
      // Re-load documents to reflect changes
      const updatedDocs = await getDocuments()
      setDocuments(updatedDocs)
    } catch (error) {
      console.error("Error sharing documents:", error)
      toast({
        title: "Error",
        description: "Failed to share documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateShareLink = async (docId: string) => {
    setIsLoading(true)
    try {
      const result = await generateDocumentShareLink(docId)
      if (result.success) {
        setGeneratedShareLink(result.shareLink)
        toast({
          title: "Share Link Generated",
          description: "The public share link has been created.",
        })
        // Update the document in the local state
        setDocuments((prevDocs) =>
          prevDocs.map((doc) => (doc.id === docId ? { ...doc, shareLink: result.shareLink } : doc)),
        )
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate share link.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating share link:", error)
      toast({
        title: "Error",
        description: "Failed to generate share link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <div className="flex gap-2">
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedDocumentsToShare([])}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Documents
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Share Documents</DialogTitle>
                <DialogDescription>Select documents and clients to share with.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleShareDocuments}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="documents-to-share">Select Documents</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                      {documents.length > 0 ? (
                        documents.map((doc) => (
                          <div key={doc.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`doc-${doc.id}`}
                              checked={selectedDocumentsToShare.includes(doc.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedDocumentsToShare([...selectedDocumentsToShare, doc.id])
                                } else {
                                  setSelectedDocumentsToShare(selectedDocumentsToShare.filter((id) => id !== doc.id))
                                }
                              }}
                            />
                            <Label htmlFor={`doc-${doc.id}`} className="text-sm font-medium leading-none">
                              {doc.name} ({doc.client})
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-2">No documents available to share.</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clients-to-share">Select Clients</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border p-2 rounded-md">
                      {clients.length > 0 ? (
                        clients.map((client) => (
                          <div key={client.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`client-${client.id}`}
                              checked={selectedClientsToShare.includes(client.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedClientsToShare([...selectedClientsToShare, client.id])
                                } else {
                                  setSelectedClientsToShare(selectedClientsToShare.filter((id) => id !== client.id))
                                }
                              }}
                            />
                            <Label htmlFor={`client-${client.id}`} className="text-sm font-medium leading-none">
                              {client.name} ({client.id})
                            </Label>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 col-span-2">No clients available.</p>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsShareDialogOpen(false)} type="button">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || selectedDocumentsToShare.length === 0 || selectedClientsToShare.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      "Share Selected"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search documents by name, client, or type..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Downloads</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading documents...
                </TableCell>
              </TableRow>
            ) : filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.client}</TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell>{doc.viewed ? "Yes" : "No"}</TableCell>
                  <TableCell>{doc.downloaded}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDownloadDocument(doc.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGenerateShareLink(doc.id)}
                        disabled={!!doc.shareLink}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedDocument(doc)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No documents found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Document Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>Are you sure you want to delete {selectedDocument?.name}?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              This action cannot be undone. This will permanently delete the document and its associated data.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDocument} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Document"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated Share Link Dialog */}
      {generatedShareLink && (
        <Dialog open={true} onOpenChange={() => setGeneratedShareLink(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Document Share Link</DialogTitle>
              <DialogDescription>Copy this link to share the document publicly.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input value={generatedShareLink} readOnly className="font-mono" />
              <p className="text-sm text-gray-500 mt-2">
                Anyone with this link can view and download the document without logging in.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => navigator.clipboard.writeText(generatedShareLink || "")}>Copy Link</Button>
              <Button variant="outline" onClick={() => setGeneratedShareLink(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
