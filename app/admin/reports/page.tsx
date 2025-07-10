import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon!</CardTitle>
          <CardDescription>Detailed reports and analytics will be available here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            We are working hard to bring you comprehensive insights into your client activities and document usage. Stay
            tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
