"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getActivities } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { Search, Filter, Activity, User, UserPlus, FileText, Download, Eye } from "lucide-react"
import type { Activity as ActivityType } from "@/lib/types"

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
    <div className="p-6 space-y-6">
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
            <div className="space-y-4">
              {filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="mt-1">{getActivityIcon(activity.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500 sm:text-right">{activity.timestamp}</p>
                    </div>
                    {activity.details && <p className="text-sm text-gray-600 mt-1">{activity.details}</p>}
                    <div className="flex flex-wrap gap-x-4 text-sm mt-2">
                      <span className="text-gray-500">
                        <User className="inline h-3.5 w-3.5 mr-1" />
                        {activity.user}
                      </span>
                      {activity.ip && <span className="text-gray-500">IP: {activity.ip}</span>}
                      <span className={`${activity.userType === "admin" ? "text-blue-600" : "text-green-600"}`}>
                        {activity.userType === "admin" ? "Staff" : "Client"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
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
