import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList, Search, AlertTriangle, Clock, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Welcome to MavFix
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
            Your one-stop solution for campus maintenance requests. Submit work
            orders, track progress, and help us keep UT Arlington in top condition.
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
          <Link href="/submit">
            <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <ClipboardList className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Submit Work Order</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Report maintenance issues and submit repair requests for any
                  building on campus.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/orders">
            <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                    <Search className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">Track My Orders</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View the status of your submitted work orders and get real-time
                  updates.
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <Card className="bg-destructive/5 border-destructive/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <CardTitle className="text-sm font-medium">Emergency Issues</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                For emergencies like flooding, electrical hazards, or security
                concerns, call Campus Police at{" "}
                <span className="font-semibold text-foreground">(817) 272-3003</span>.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-warning/10 border-warning/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning-foreground" />
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Most work orders are reviewed within 24 hours. High-priority issues
                are addressed immediately during business hours.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-success/10 border-success/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <CardTitle className="text-sm font-medium">Track Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get email notifications and track your work order status in real-time
                through your personalized dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
