"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { RequestWithRelations, Profile, RequestStatus, Priority } from "@/lib/types"

interface RequestsTableProps {
  requests: RequestWithRelations[]
  staffMembers: Profile[]
  currentUserId: string
}

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-primary text-primary-foreground" },
  completed: { label: "Completed", className: "bg-success text-success-foreground" },
  cancelled: { label: "Cancelled", className: "bg-destructive text-destructive-foreground" },
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-warning/20 text-warning-foreground" },
  high: { label: "High", className: "bg-destructive/20 text-destructive" },
  critical: { label: "Critical", className: "bg-destructive text-destructive-foreground" },
}

export function RequestsTable({ requests, staffMembers, currentUserId }: RequestsTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<RequestWithRelations | null>(null)
  const [newStatus, setNewStatus] = useState<RequestStatus>("pending")
  const [assignedTo, setAssignedTo] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const openDialog = (request: RequestWithRelations) => {
    setSelectedRequest(request)
    setNewStatus(request.status)
    setAssignedTo(request.assigned_to || "")
    setNotes("")
    setDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedRequest) return
    
    setLoading(true)
    
    const updates: Partial<RequestWithRelations> = {
      status: newStatus,
      assigned_to: assignedTo || null,
      updated_at: new Date().toISOString(),
    }
    
    if (newStatus === "completed") {
      updates.completed_at = new Date().toISOString()
    }
    
    // Update request
    const { error: updateError } = await supabase
      .from("requests")
      .update(updates)
      .eq("id", selectedRequest.id)
    
    if (updateError) {
      console.error("Update error:", updateError)
      setLoading(false)
      return
    }
    
    // Create status log if status changed
    if (newStatus !== selectedRequest.status || notes) {
      await supabase.from("status_logs").insert({
        request_id: selectedRequest.id,
        previous_status: selectedRequest.status,
        new_status: newStatus,
        changed_by: currentUserId,
        notes: notes || null,
      })
    }
    
    setLoading(false)
    setDialogOpen(false)
    router.refresh()
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.order_number}</TableCell>
                  <TableCell>{request.building.code}</TableCell>
                  <TableCell className="max-w-[120px] truncate">{request.category.name}</TableCell>
                  <TableCell>
                    <Badge className={cn("border-0", priorityConfig[request.priority].className)}>
                      {priorityConfig[request.priority].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn("border-0", statusConfig[request.status].className)}>
                      {statusConfig[request.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{request.assignee?.full_name || "Unassigned"}</TableCell>
                  <TableCell>{formatDate(request.created_at)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openDialog(request)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Request</DialogTitle>
            <DialogDescription>
              {selectedRequest?.order_number} - {selectedRequest?.title}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">{selectedRequest.building.name}</p>
                <p className="text-sm text-muted-foreground">{selectedRequest.specific_location}</p>
                <p className="text-sm mt-2">{selectedRequest.description}</p>
              </div>
              
              <FieldGroup>
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as RequestStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                
                <Field>
                  <FieldLabel>Assign To</FieldLabel>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.full_name || staff.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                
                <Field>
                  <FieldLabel>Notes (optional)</FieldLabel>
                  <Textarea
                    placeholder="Add notes about this update..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </Field>
              </FieldGroup>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Request"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
