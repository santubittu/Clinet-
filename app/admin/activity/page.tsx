"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getActivities } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Search, Filter, Activity, User, UserPlus, FileText, Download, Eye } from 'lucide-react'
import type { Activity as ActivityType } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ActivityLogPage() {
  const { toast } = useToast()
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterUser, setFilterUser] = useState("all")

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const data = await getActivities()
        setActivities(data)
      } catch (error) {
        console.error("Failed to load activities", error)
        toast({
          title: "Error",
          description: "Failed to load activity log",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [toast])

  // Get unique action types and users for filters
  const actionTypes = ["all", ...new Set(activities.map((activity) => activity.action.split(" ")[0]))]
  const users = ["all", ...new Set(activities.map((activity) => activity.user))]

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.user.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = filterType === "all" || activity.action.startsWith(filterType)
    const matchesUser = filterUser === "all" || activity.user === filterUser

    return matchesSearch && matchesType && matchesUser
  })

  const getActivityIcon = (action: string) => {
    if (action.includes("Document uploaded")) return <FileText className="h-5 w-5 text-blue-500" />
    if (action.includes("Document viewed")) return <Eye className="h-5 w-5 text-green-500" />
    if (action.includes("Document downloaded")) return <Download className="h-5 w-5 text-purple-500" />
    if (action.includes("Client")) return <UserPlus className="h-5 w-5 text-orange-500" />
    if (action.includes("User")) return <User className="h-5 w-5 text-red-500" />
    return <Activity className="h-5 w-5 text-gray-500" />
  }

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity</CardTitle>
          <CardDescription>Track all actions performed in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search activities..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <div className="w-[180px]">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {actionTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === "all" ? "All Actions" : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[180px]">
                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger>
                    <User className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user === "all" ? "All Users" : user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredActivities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>{activity.timestamp}</TableCell>
                    <TableCell>{activity.user}</TableCell>
                    <TableCell>{activity.userType}</TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{activity.details}</TableCell>
                    <TableCell>{activity.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No activities found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
