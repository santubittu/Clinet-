"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/charts/bar-chart"
import { LineChart } from "@/components/charts/line-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { AnimatedCard } from "@/components/ui/animated-card"
import { getAdminDashboardData } from "@/lib/actions"
import { motion } from "framer-motion"
import { FileText, Users, Clock, AlertCircle } from "lucide-react"

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await getAdminDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  const documentsByTypeData = {
    labels: Object.keys(dashboardData.documentsByType),
    datasets: [
      {
        label: "Documents",
        data: Object.values(dashboardData.documentsByType),
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(201, 203, 207, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(201, 203, 207, 1)",
          "rgba(255, 99, 132, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const monthlyDocumentsData = {
    labels: dashboardData.monthlyDocuments.map((item: any) => item.month),
    datasets: [
      {
        label: "Documents Uploaded",
        data: dashboardData.monthlyDocuments.map((item: any) => item.count),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  }

  const clientGrowthData = {
    labels: dashboardData.clientGrowth.map((item: any) => item.month),
    datasets: [
      {
        label: "New Clients",
        data: dashboardData.clientGrowth.map((item: any) => item.count),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">Welcome back, Admin</div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard delay={0.1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalClients}</div>
            <p className="text-xs text-gray-500">{dashboardData.activeClients} active clients</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Uploaded</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalDocuments}</div>
            <p className="text-xs text-gray-500">+{dashboardData.monthlyDocuments[3].count} this month</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.recentActivities.length}</div>
            <p className="text-xs text-gray-500">Actions in the last 24 hours</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-500">Documents awaiting upload</p>
          </CardContent>
        </AnimatedCard>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatedCard>
              <CardHeader>
                <CardTitle>Monthly Document Uploads</CardTitle>
                <CardDescription>Number of documents uploaded per month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart data={monthlyDocumentsData} />
              </CardContent>
            </AnimatedCard>

            <AnimatedCard>
              <CardHeader>
                <CardTitle>Client Growth</CardTitle>
                <CardDescription>New clients onboarded per month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <LineChart data={clientGrowthData} />
              </CardContent>
            </AnimatedCard>
          </div>

          <AnimatedCard>
            <CardHeader>
              <CardTitle>Documents by Type</CardTitle>
              <CardDescription>Distribution of documents by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PieChart data={documentsByTypeData} />
            </CardContent>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="documents">
          <AnimatedCard>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Latest documents uploaded to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivities
                  .filter((activity: any) => activity.action.includes("Document"))
                  .slice(0, 5)
                  .map((activity: any, index: number) => (
                    <div key={index} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{activity.user}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="clients">
          <AnimatedCard>
            <CardHeader>
              <CardTitle>Client Activity</CardTitle>
              <CardDescription>Recent client logins and document access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    client: "ABC Corporation",
                    clientId: "CLIENT123",
                    action: "Viewed Balance Sheet Q1 2024",
                    time: "30 minutes ago",
                  },
                  {
                    client: "XYZ Enterprises",
                    clientId: "CLIENT456",
                    action: "Downloaded Tax Return 2023",
                    time: "2 hours ago",
                  },
                  {
                    client: "LMN Ltd",
                    clientId: "CLIENT789",
                    action: "Logged in",
                    time: "3 hours ago",
                  },
                  {
                    client: "PQR Inc",
                    clientId: "CLIENT321",
                    action: "Viewed GST Return Q4 2023",
                    time: "5 hours ago",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{item.client}</p>
                      <p className="text-sm text-gray-500">Client ID: {item.clientId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="activity">
          <AnimatedCard>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent actions performed in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity: any, index: number) => (
                  <div key={index} className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{activity.user}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
