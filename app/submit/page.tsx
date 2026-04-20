import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { SubmitWorkOrderForm } from "@/components/submit-work-order-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogIn } from "lucide-react"

export default async function SubmitPage() {
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
                You need to sign in to submit a maintenance request.
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

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
  
  if (!profile) {
    redirect("/auth/login")
  }

  // Fetch buildings and categories
  const [{ data: buildings }, { data: categories }] = await Promise.all([
    supabase.from("buildings").select("*").order("name"),
    supabase.from("categories").select("*").order("name"),
  ])

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8">
        <SubmitWorkOrderForm
          buildings={buildings ?? []}
          categories={categories ?? []}
          user={profile}
        />
      </div>
    </AppShell>
  )
}
