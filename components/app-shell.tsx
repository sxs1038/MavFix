import { createClient } from "@/lib/supabase/server"
import { Navbar } from "./navbar"
import { Footer } from "./footer"
import type { Profile } from "@/lib/types"

interface AppShellProps {
  children: React.ReactNode
}

export async function AppShell({ children }: AppShellProps) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile: Profile | null = null
  
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    
    profile = data
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={profile} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
