"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DownloadCloud, Eye, FileText, Search } from "lucide-react"

// Sample document data
const initialDocuments = [
  {
    id: "DOC001",
    name: "Balance Sheet Q1 2024.pdf",
    type: "Balance Sheet",
    uploadDate: "Apr 10, 2024",
    size: "1.2 MB",
  },
  {
    id: "DOC004",
    name: "Profit & Loss Statement Q1 2024.pdf",
    type: "P&L Statement",
    uploadDate: "Apr 10, 2024",
    size: "1.5 MB",
  },
  {
    id: "DOC003",
    name: "GST Return Q1 2024.pdf",
    type: "GST Return",
    uploadDate: "Apr 5, 2024",
    size: "0.8 MB",
  },
  {
    id: "DOC007",
    name: "Tax Planning Document 2024.pdf",
    type: "Tax Planning",
    uploadDate: "Mar 15, 2024",
    size: "2.3 MB",
  },
  {
    id: "DOC002",
    name: "Tax Return 2023.pdf",
    type: "Tax Return",
    uploadDate: "Feb 28, 2024",
    size: "3.5 MB",
  },
  {
    id: "DOC005",
    name: "Annual Financial Report 2023.pdf",
    type: "Financial Report",
    uploadDate: "Jan 15, 2024",
    size: "4.2 MB",
  },
  {
    id: "DOC006",
    name: "GST Return Q4 2023.pdf",
    type: "GST Return",
    uploadDate: "Jan 10, 2024",
    size: "0.9 MB",
  },
  {
    id: "DOC008",
    name: "Quarterly Financial Review Q4 2023.pdf",
    type: "Financial Review",
    uploadDate: "Jan 5, 2024",
    size: "1.8 MB",
  },
]

export default function ClientDocumentsPage() {
  const [documents] = useState(initialDocuments)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterDate, setFilterDate] = useState("all")

  // Get unique document types for filter
  const documentTypes = ["all", ...new Set(documents.map((doc) => doc.type))]

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || doc.type === filterType

    let matchesDate = true
    const uploadDate = new Date(doc.uploadDate)
    const currentDate = new Date()

    if (filterDate === "last7days") {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(currentDate.getDate() - 7)
      matchesDate = uploadDate >= sevenDaysAgo
    } else if (filterDate === "last30days") {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(currentDate.getDate() - 30)
      matchesDate = uploadDate >= thirtyDaysAgo
    } else if (filterDate === "last90days") {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(currentDate.getDate() - 90)
      matchesDate = uploadDate >= ninetyDaysAgo
    }

    return matchesSearch && matchesType && matchesDate
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
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

          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="border rounded-md p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <FileText className="h-8 w-8 text-gray-500 shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate" title={doc.name}>
                    {doc.name}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 mt-1">
                    <span>{doc.type}</span>
                    <span>{doc.uploadDate}</span>
                    <span>{doc.size}</span>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                    <Button size="sm" className="flex-1">
                      <DownloadCloud className="mr-1 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium">No documents found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
