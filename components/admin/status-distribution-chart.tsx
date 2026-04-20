"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { DashboardStats } from "@/lib/types"

interface StatusDistributionChartProps {
  stats: DashboardStats
}

const COLORS = {
  pending: "oklch(0.75 0.15 85)", // warning/yellow
  in_progress: "oklch(0.42 0.14 250)", // primary/blue  
  completed: "oklch(0.65 0.18 145)", // success/green
}

export function StatusDistributionChart({ stats }: StatusDistributionChartProps) {
  const data = [
    { name: "Pending", value: stats.pending, color: COLORS.pending },
    { name: "In Progress", value: stats.in_progress, color: COLORS.in_progress },
    { name: "Completed", value: stats.completed, color: COLORS.completed },
  ].filter(d => d.value > 0)

  const total = stats.pending + stats.in_progress + stats.completed

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value, "Orders"]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
