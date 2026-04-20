"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { RequestWithRelations, Category } from "@/lib/types"

interface CategoryChartProps {
  requests: RequestWithRelations[]
  categories: Category[]
}

export function CategoryChart({ requests, categories }: CategoryChartProps) {
  const data = categories
    .map((category) => ({
      name: category.name.split("/")[0], // Shorten names for display
      count: requests.filter(r => r.category_id === category.id).length,
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6) // Top 6 categories

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Orders by Category</CardTitle>
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
        <CardTitle className="text-lg">Orders by Category</CardTitle>
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
              tick={{ fontSize: 11 }}
              stroke="oklch(0.5 0.02 250)"
              width={80}
            />
            <Tooltip />
            <Bar 
              dataKey="count" 
              fill="oklch(0.42 0.14 250)"
              radius={[0, 4, 4, 0]}
              name="Orders"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
