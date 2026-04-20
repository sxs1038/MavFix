import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react"
import type { RequestWithRelations, RequestStatus, Priority } from "@/lib/types"

interface OrderCardProps {
  request: RequestWithRelations
}

const statusConfig: Record<RequestStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { 
    label: "Pending", 
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />
  },
  in_progress: { 
    label: "In Progress", 
    variant: "default",
    icon: <Loader2 className="h-3 w-3" />
  },
  completed: { 
    label: "Completed", 
    variant: "outline",
    icon: <CheckCircle className="h-3 w-3" />
  },
  cancelled: { 
    label: "Cancelled", 
    variant: "destructive",
    icon: <XCircle className="h-3 w-3" />
  },
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-warning/20 text-warning-foreground" },
  high: { label: "High", className: "bg-destructive/20 text-destructive" },
  critical: { label: "Critical", className: "bg-destructive text-destructive-foreground" },
}

export function OrderCard({ request }: OrderCardProps) {
  const status = statusConfig[request.status]
  const priority = priorityConfig[request.priority]
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-lg">{request.order_number}</span>
          <Badge variant={status.variant} className="flex items-center gap-1">
            {status.icon}
            {status.label}
          </Badge>
          <Badge className={cn("border-0", priority.className)}>
            {priority.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {request.building.name} ({request.building.code}) - {request.specific_location}
        </p>
      </CardHeader>
      <CardContent>
        <Badge variant="outline" className="mb-3 text-primary border-primary">
          {request.category.name}
        </Badge>
        <p className="text-sm text-foreground mb-4">{request.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Submitted</p>
            <p className="font-medium">{formatDate(request.created_at)}</p>
            <p className="text-xs text-muted-foreground">{request.requester?.full_name || request.requester?.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Assigned To</p>
            <p className="font-medium">{request.assignee?.full_name || "Unassigned"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {request.status === "completed" ? "Completed" : "Est. Completion"}
            </p>
            <p className={cn(
              "font-medium",
              request.status === "completed" ? "text-success" : 
              (request.due_date && new Date(request.due_date) < new Date() ? "text-destructive" : "")
            )}>
              {request.completed_at 
                ? formatDate(request.completed_at)
                : request.due_date 
                  ? formatDate(request.due_date)
                  : "TBD"
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
