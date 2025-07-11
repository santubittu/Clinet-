import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Eye, Bell, TrendingUp } from "lucide-react"
import Link from "next/link"
import AuthCheck from "@/components/auth-check"
import { getClientDashboardData } from "@/lib/actions"

export default async function ClientDashboard() {
  const data = await getClientDashboardData("ACME_CORP")

  return (
    <AuthCheck requiredRole="client">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {data.client?.name}</h1>
          <p className="text-gray-600">Here's what's happening with your account</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">Available for download</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Actions this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.notifications.length}</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Your latest financial documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{doc.name}</h3>
                      <p className="text-sm text-gray-600">
                        {doc.type} • {doc.size} • {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.viewed ? (
                      <Badge variant="secondary">
                        <Eye className="h-3 w-3 mr-1" />
                        Viewed
                      </Badge>
                    ) : (
                      <Badge variant="outline">New</Badge>
                    )}
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/client/documents">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Documents
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Important updates and messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.notifications.map((notification) => (
                <div key={notification.id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    <p className="text-sm text-gray-600">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.createdAt}</p>
                  </div>
                  {!notification.read && (
                    <Badge variant="default" className="bg-blue-600">
                      New
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link href="/client/notifications">
                <Button variant="outline" className="w-full bg-transparent">
                  View All Notifications
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthCheck>
  )
}
