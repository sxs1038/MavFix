import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { OrdersList } from "@/components/orders-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogIn } from "lucide-react"

export default async function OrdersPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // If not logged in, show login prompt
  if (!user) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Sign In Required</CardTitle>
              <CardDescription>
                You need to sign in to view your work orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link href="/auth/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  // Fetch user's requests with relations
  const { data: requests } = await supabase
    .from("requests")
    .select(`
      *,
      building:buildings(*),
      category:categories(*),
      requester:profiles!requester_id(*),
      assignee:profiles!assigned_to(*)
    `)
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <OrdersList requests={requests ?? []} />
      </div>
    </AppShell>
  )
}
