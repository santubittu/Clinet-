import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Under Construction</CardTitle>
          <CardDescription>Manage your portal settings here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This section will allow you to configure various aspects of your client portal, including user roles,
            notification preferences, and integration settings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
