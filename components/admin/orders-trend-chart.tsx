"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { RequestWithRelations } from "@/lib/types"

interface OrdersTrendChartProps {
  requests: RequestWithRelations[]
}

export function OrdersTrendChart({ requests }: OrdersTrendChartProps) {
  // Generate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date
  })

  const data = last7Days.map((date) => {
    const dateStr = date.toISOString().split("T")[0]
    const dayRequests = requests.filter(r => 
      r.created_at.split("T")[0] === dateStr
    )
    const completedRequests = requests.filter(r => 
      r.completed_at && r.completed_at.split("T")[0] === dateStr
    )
    
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      submitted: dayRequests.length,
      completed: completedRequests.length,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Orders Trend (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="oklch(0.5 0.02 250)"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="oklch(0.5 0.02 250)"
              allowDecimals={false}
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="submitted" 
              stroke="oklch(0.42 0.14 250)"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Submitted"
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="oklch(0.65 0.18 145)"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Completed"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
