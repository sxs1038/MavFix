"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wrench, Home, ClipboardList, FileText, LayoutDashboard, LogIn, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

interface NavbarProps {
  user: Profile | null
}

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/submit", label: "Submit Order", icon: ClipboardList },
  { href: "/orders", label: "My Orders", icon: FileText },
]

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const isAdmin = user?.role === "admin"
  const isStaff = user?.role === "staff"

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight">MavFix</span>
              <span className="text-xs opacity-80">UT Arlington Maintenance</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/20"
                      : "hover:bg-white/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}

            {(isAdmin || isStaff) && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname.startsWith("/admin")
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-primary-foreground hover:bg-white/10"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user.full_name || user.email}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize mt-1">
                      Role: {user.role}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-primary-foreground hover:bg-white/10"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
