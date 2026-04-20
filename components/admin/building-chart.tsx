"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { RequestWithRelations, Building } from "@/lib/types"

interface BuildingChartProps {
  requests: RequestWithRelations[]
  buildings: Building[]
}

export function BuildingChart({ requests, buildings }: BuildingChartProps) {
  const data = buildings
    .map((building) => ({
      name: building.code,
      fullName: building.name,
      count: requests.filter(r => r.building_id === building.id).length,
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // Top 8 buildings

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Buildings by Work Orders</CardTitle>
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
        <CardTitle className="text-lg">Top Buildings by Work Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
            <XAxis 
              type="number" 
              tick={{ fontSize: 12 }}
              stroke="oklch(0.5 0.02 250)"
              allowDecimals={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="oklch(0.5 0.02 250)"
              width={50}
            />
            <Tooltip 
              formatter={(value: number, name: string, props: { payload: { fullName: string } }) => [
                `${value} orders`,
                props.payload.fullName
              ]}
            />
            <Bar 
              dataKey="count" 
              fill="oklch(0.55 0.18 250)"
              radius={[0, 4, 4, 0]}
              name="Orders"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
