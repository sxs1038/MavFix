"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderCard } from "./order-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter } from "lucide-react"
import { Empty } from "@/components/ui/empty"
import type { RequestWithRelations, RequestStatus } from "@/lib/types"

interface OrdersListProps {
  requests: RequestWithRelations[]
}

export function OrdersList({ requests }: OrdersListProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all")

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = 
        search === "" ||
        req.order_number.toLowerCase().includes(search.toLowerCase()) ||
        req.building.name.toLowerCase().includes(search.toLowerCase()) ||
        req.description.toLowerCase().includes(search.toLowerCase()) ||
        req.title.toLowerCase().includes(search.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || req.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [requests, search, statusFilter])

  const stats = useMemo(() => {
    return {
      pending: requests.filter(r => r.status === "pending").length,
      in_progress: requests.filter(r => r.status === "in_progress").length,
      completed: requests.filter(r => r.status === "completed").length,
    }
  }, [requests])

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Work Orders</h1>
        <p className="text-muted-foreground">
          Track the status and progress of your submitted maintenance requests
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number, building, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequestStatus | "all")}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-3xl font-bold">{stats.pending}</CardTitle>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-3xl font-bold text-primary">{stats.in_progress}</CardTitle>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardHeader>
        </Card>
        <Card className="bg-card">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-3xl font-bold text-success">{stats.completed}</CardTitle>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardHeader>
        </Card>
      </div>

      {/* Orders List */}
      {filteredRequests.length === 0 ? (
        <Empty>
          <Empty.Icon />
          <Empty.Title>No work orders found</Empty.Title>
          <Empty.Description>
            {requests.length === 0 
              ? "You haven't submitted any work orders yet."
              : "No orders match your search criteria."
            }
          </Empty.Description>
        </Empty>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <OrderCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}
