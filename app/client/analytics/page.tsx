"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "@/components/charts/index"
import { Activity } from "@/lib/types"
import { getCurrentUser } from "@/lib/actions"
import { redirect } from "next/navigation"
import { FileText, Download, Eye, Calendar, Bell, ActivityIcon } from 'lucide-react'
import { motion } from "framer-motion"
import { getClientDashboardData } from "@/lib/dashboard" // Import the missing function

export default async function ClientAnalyticsPage() {
  const user = await getCurrentUser()

  if (!user || user.type !== "client") {
    redirect("/login")
  }

  const dashboardData = await getClientDashboardData(user.id)

  if (dashboardData.error) {
    return <div className="p-6 md:p-8 text-red-500">Error: {dashboardData.error}</div>
  }

  const documentTypeChartData = Object.entries(dashboardData.documentsByType).map(([name, value]) => ({
    name,
    value,
  }))

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
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">My Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalDocuments}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Documents shared with you</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Notifications</CardTitle>
            <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.notifications.length}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Unread notifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Activity</CardTitle>
            <ActivityIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.documentActivity.reduce((sum, d) => sum + d.viewed + d.downloaded, 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total views and downloads</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Views & Downloads</CardTitle>
            <CardDescription>Monthly activity on your documents.</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart data={dashboardData.documentActivity} dataKey="viewed" categoryKey="month" secondaryDataKey="downloaded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Documents by Type</CardTitle>
            <CardDescription>Distribution of document types shared with you.</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart data={documentTypeChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
