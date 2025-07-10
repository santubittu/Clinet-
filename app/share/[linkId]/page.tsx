"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { accessSharedDocument, downloadDocument } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Download, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SharedDocumentPage() {
  const params = useParams()
  const { toast } = useToast()
  const linkId = params.linkId as string

  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const result = await accessSharedDocument(linkId)
        if (result.error) {
          setError(result.error)
        } else {
          setDocument(result.document)
        }
      } catch (err) {
        console.error("Error accessing shared document:", err)
        setError("An unexpected error occurred. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    if (linkId) {
      fetchDocument()
    }
  }, [linkId])

  const handleDownload = async () => {
    if (!document) return

    setIsLoading(true)
    try {
      const result = await downloadDocument(document.id, true) // true for isSharedLink
      if (result.success && result.fileUrl) {
        window.open(result.fileUrl, "_blank")
        toast({
          title: "Download Started",
          description: "Your download should begin shortly.",
        })
      } else {
        toast({
          title: "Download Failed",
          description: result.error || "Could not download the document.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error during download:", err)
      toast({
        title: "Download Failed",
        description: "An unexpected error occurred during download.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading document...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Please ensure the link is correct and has not expired.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => (window.location.href = "/login")} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Document Not Found</CardTitle>
            <CardDescription>The document associated with this link could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">It might have been deleted or the link is incorrect.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => (window.location.href = "/login")} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{document.name}</CardTitle>
          <CardDescription>
            Shared by {document.client} ({document.type})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Size:</div>
            <div>{document.size}</div>
            <div className="font-medium">Upload Date:</div>
            <div>{document.uploadDate}</div>
            {document.description && (
              <>
                <div className="font-medium col-span-2">Description:</div>
                <div className="col-span-2 text-gray-700">{document.description}</div>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={() => window.open(document.file_url, "_blank")} className="w-full">
            <Eye className="mr-2 h-4 w-4" /> View Document
          </Button>
          <Button onClick={handleDownload} className="w-full bg-transparent" variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download Document
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
