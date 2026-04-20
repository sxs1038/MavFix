import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock, Loader2, CheckCircle } from "lucide-react"
import type { DashboardStats } from "@/lib/types"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="py-4 px-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="py-4 px-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Pending</p>
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <CardTitle className="text-3xl font-bold text-warning-foreground">{stats.pending}</CardTitle>
          <p className="text-xs text-muted-foreground">Awaiting assignment</p>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="py-4 px-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <Loader2 className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">{stats.in_progress}</CardTitle>
          <p className="text-xs text-muted-foreground">Being worked on</p>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader className="py-4 px-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Completed</p>
            <CheckCircle className="h-4 w-4 text-success" />
          </div>
          <CardTitle className="text-3xl font-bold text-success">{stats.completed}</CardTitle>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardHeader>
      </Card>
    </div>
  )
}
