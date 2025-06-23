"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DownloadCloud, Eye, FileText, Search, Share2, Trash2 } from "lucide-react"

// Sample document data
const initialDocuments = [
  {
    id: "DOC001",
    name: "Balance Sheet Q1 2024.pdf",
    type: "Balance Sheet",
    client: "ABC Corporation",
    clientId: "CLIENT123",
    uploadDate: "Apr 10, 2024",
    size: "1.2 MB",
  },
  {
    id: "DOC002",
    name: "Tax Return 2023.pdf",
    type: "Tax Return",
    client: "XYZ Enterprises",
    clientId: "CLIENT456",
    uploadDate: "Apr 8, 2024",
    size: "3.5 MB",
  },
  {
    id: "DOC003",
    name: "GST Return Q4 2023.pdf",
    type: "GST Return",
    client: "LMN Limited",
    clientId: "CLIENT789",
    uploadDate: "Apr 5, 2024",
    size: "0.8 MB",
  },
  {
    id: "DOC004",
    name: "Profit & Loss Statement Q1 2024.pdf",
    type: "P&L Statement",
    client: "ABC Corporation",
    clientId: "CLIENT123",
    uploadDate: "Apr 10, 2024",
    size: "1.5 MB",
  },
  {
    id: "DOC005",
    name: "Annual Financial Report 2023.pdf",
    type: "Financial Report",
    client: "PQR Inc",
    clientId: "CLIENT321",
    uploadDate: "Mar 28, 2024",
    size: "4.2 MB",
  },
  {
    id: "DOC006",
    name: "GST Return Q1 2024.pdf",
    type: "GST Return",
    client: "EFG Solutions",
    clientId: "CLIENT654",
    uploadDate: "Apr 2, 2024",
    size: "0.9 MB",
  },
  {
    id: "DOC007",
    name: "Tax Planning Document 2024.pdf",
    type: "Tax Planning",
    client: "UVW Group",
    clientId: "CLIENT987",
    uploadDate: "Mar 15, 2024",
    size: "2.3 MB",
  },
  {
    id: "DOC008",
    name: "Quarterly Financial Review Q1 2024.pdf",
    type: "Financial Review",
    client: "RST Ventures",
    clientId: "CLIENT135",
    uploadDate: "Apr 9, 2024",
    size: "1.8 MB",
  },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(initialDocuments)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterClient, setFilterClient] = useState("all")

  // Get unique document types and clients for filters
  const documentTypes = ["all", ...new Set(documents.map((doc) => doc.type))]
  const clients = ["all", ...new Set(documents.map((doc) => doc.client))]

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || doc.type === filterType
    const matchesClient = filterClient === "all" || doc.client === filterClient

    return matchesSearch && matchesType && matchesClient
  })

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Upload New Document
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === "all" ? "All Types" : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client} value={client}>
                  {client === "all" ? "All Clients" : client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.type}</TableCell>
                  <TableCell>{doc.client}</TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell>{doc.size}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <DownloadCloud className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No documents found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
