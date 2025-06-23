import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Clock, Download, Bell } from "lucide-react"

export default function ClientDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
        <div className="text-sm text-gray-500">Welcome, ABC Corporation</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Documents</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-gray-500">+2 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-500">Documents viewed in the last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Downloads</CardTitle>
            <Download className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-gray-500">Documents downloaded</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Recently added or updated documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Balance Sheet Q1 2024.pdf",
                    type: "Balance Sheet",
                    date: "Apr 10, 2024",
                    size: "1.2 MB",
                  },
                  {
                    name: "Profit & Loss Statement Q1 2024.pdf",
                    type: "P&L Statement",
                    date: "Apr 10, 2024",
                    size: "1.5 MB",
                  },
                  {
                    name: "GST Return Q1 2024.pdf",
                    type: "GST Return",
                    date: "Apr 5, 2024",
                    size: "0.8 MB",
                  },
                  {
                    name: "Tax Planning Document 2024.pdf",
                    type: "Tax Planning",
                    date: "Mar 15, 2024",
                    size: "2.3 MB",
                  },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.type} • {doc.date} • {doc.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button size="sm">Download</Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <Link href="/client/documents">
                  <Button variant="outline">View All Documents</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent updates from your accountant</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "New documents available",
                    message: "Your Q1 2024 financial statements have been uploaded",
                    time: "2 days ago",
                  },
                  {
                    title: "GST Return reminder",
                    message: "Your Q1 2024 GST Return is due in 7 days",
                    time: "3 days ago",
                  },
                  {
                    title: "Tax planning meeting",
                    message: "Schedule your annual tax planning meeting",
                    time: "1 week ago",
                  },
                ].map((notification, index) => (
                  <div key={index} className="flex space-x-3 p-3 border rounded-md">
                    <Bell className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
