import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { StatsCards } from "@/components/admin/stats-cards"
import { StatusDistributionChart } from "@/components/admin/status-distribution-chart"
import { OrdersTrendChart } from "@/components/admin/orders-trend-chart"
import { CategoryChart } from "@/components/admin/category-chart"
import { BuildingChart } from "@/components/admin/building-chart"
import { RequestsTable } from "@/components/admin/requests-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login")
  }
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  // Check if user is admin or staff
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <ShieldAlert className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You don&apos;t have permission to access the admin dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  // Fetch all data
  const [
    { data: requests },
    { data: categories },
    { data: buildings },
    { data: staffMembers },
  ] = await Promise.all([
    supabase
      .from("requests")
      .select(`
        *,
        building:buildings(*),
        category:categories(*),
        requester:profiles!requester_id(*),
        assignee:profiles!assigned_to(*)
      `)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
    supabase.from("buildings").select("*").order("name"),
    supabase.from("profiles").select("*").in("role", ["staff", "admin"]),
  ])

  const allRequests = requests ?? []
  
  // Calculate stats
  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === "pending").length,
    in_progress: allRequests.filter(r => r.status === "in_progress").length,
    completed: allRequests.filter(r => r.status === "completed").length,
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor work orders, analyze trends, and manage maintenance across campus
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="requests">All Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <StatsCards stats={stats} />
            
            <div className="grid md:grid-cols-2 gap-6">
              <StatusDistributionChart stats={stats} />
              <OrdersTrendChart requests={allRequests} />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <CategoryChart requests={allRequests} categories={categories ?? []} />
              <BuildingChart requests={allRequests} buildings={buildings ?? []} />
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>All Work Orders</CardTitle>
                <CardDescription>
                  View and manage all maintenance requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RequestsTable 
                  requests={allRequests}
                  staffMembers={staffMembers ?? []}
                  currentUserId={user.id}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
