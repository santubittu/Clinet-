"use client"

import { useState, useEffect } from "react"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart } from "@/components/charts/bar-chart"
import { LineChart } from "@/components/charts/line-chart"
import { PieChart } from "@/components/charts/pie-chart"
import { AnimatedCard } from "@/components/ui/animated-card"
import { getClientDashboardData } from "@/lib/actions"
import { motion } from "framer-motion"
import { FileText, Download, Eye, Calendar } from "lucide-react"

export default function ClientAnalytics() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // For demo purposes, we're using CLIENT123
        const data = await getClientDashboardData("CLIENT123")
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
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
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
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const documentActivityData = {
    labels: dashboardData.documentActivity.map((item: any) => item.month),
    datasets: [
      {
        label: "Viewed",
        data: dashboardData.documentActivity.map((item: any) => item.viewed),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Downloaded",
        data: dashboardData.documentActivity.map((item: any) => item.downloaded),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  }

  const documentTrendsData = {
    labels: dashboardData.documentActivity.map((item: any) => item.month).slice(0, 4),
    datasets: [
      {
        label: "Document Activity",
        data: dashboardData.documentActivity.map((item: any) => item.viewed + item.downloaded).slice(0, 4),
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
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <div className="text-sm text-gray-500">Welcome, {dashboardData.client.name}</div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnimatedCard delay={0.1}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalDocuments}</div>
            <p className="text-xs text-gray-500">Available in your account</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Viewed</CardTitle>
            <Eye className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.documentActivity.reduce((sum: number, item: any) => sum + item.viewed, 0)}
            </div>
            <p className="text-xs text-gray-500">Total views this year</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.documentActivity.reduce((sum: number, item: any) => sum + item.downloaded, 0)}
            </div>
            <p className="text-xs text-gray-500">Total downloads this year</p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Update</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.recentDocuments[0]?.uploadDate.split(" ")[0] || "N/A"}
            </div>
            <p className="text-xs text-gray-500">Last document update</p>
          </CardContent>
        </AnimatedCard>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Document Analysis</TabsTrigger>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatedCard>
              <CardHeader>
                <CardTitle>Document Activity</CardTitle>
                <CardDescription>Views and downloads per month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart data={documentActivityData} />
              </CardContent>
            </AnimatedCard>

            <AnimatedCard>
              <CardHeader>
                <CardTitle>Documents by Type</CardTitle>
                <CardDescription>Distribution of your documents</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChart data={documentsByTypeData} />
              </CardContent>
            </AnimatedCard>
          </div>

          <AnimatedCard>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Your most recently added documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentDocuments.map((doc: any, index: number) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.type} • {doc.uploadDate} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {doc.viewed ? "Viewed" : "New"}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatedCard>
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
                <CardDescription>Breakdown of document categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <PieChart data={documentsByTypeData} />
              </CardContent>
            </AnimatedCard>

            <AnimatedCard>
              <CardHeader>
                <CardTitle>Document Statistics</CardTitle>
                <CardDescription>Detailed breakdown of your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 pt-4">
                  {Object.entries(dashboardData.documentsByType).map(([type, count]: [string, any], index: number) => (
                    <div key={type} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{type}</span>
                        <span className="text-sm text-gray-500">{count} documents</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / dashboardData.totalDocuments) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </AnimatedCard>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid gap-4 md:grid-cols-2">
            <AnimatedCard>
              <CardHeader>
                <CardTitle>Activity Trends</CardTitle>
                <CardDescription>Your document activity over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <LineChart data={documentTrendsData} />
              </CardContent>
            </AnimatedCard>

            <AnimatedCard>
              <CardHeader>
                <CardTitle>Monthly Activity</CardTitle>
                <CardDescription>Views and downloads by month</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BarChart data={documentActivityData} />
              </CardContent>
            </AnimatedCard>
          </div>

          <AnimatedCard className="mt-4">
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>Recent actions on your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    action: "Document viewed",
                    details: "Balance Sheet Q1 2024.pdf",
                    date: "Apr 12, 2024",
                    time: "10:23 AM",
                  },
                  {
                    action: "Document downloaded",
                    details: "Tax Return 2023.pdf",
                    date: "Apr 10, 2024",
                    time: "3:45 PM",
                  },
                  {
                    action: "Logged in",
                    details: "From IP 192.168.1.1",
                    date: "Apr 10, 2024",
                    time: "3:42 PM",
                  },
                  {
                    action: "Document viewed",
                    details: "GST Return Q4 2023.pdf",
                    date: "Apr 8, 2024",
                    time: "11:30 AM",
                  },
                  {
                    action: "Document downloaded",
                    details: "Profit & Loss Statement Q1 2024.pdf",
                    date: "Apr 5, 2024",
                    time: "9:15 AM",
                  },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{activity.date}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
