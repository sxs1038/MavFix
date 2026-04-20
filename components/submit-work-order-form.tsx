"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react"
import type { Building, Category, Priority, Profile } from "@/lib/types"

interface SubmitWorkOrderFormProps {
  buildings: Building[]
  categories: Category[]
  user: Profile
}

const priorityOptions: { value: Priority; label: string; description: string }[] = [
  { value: "low", label: "Low", description: "Can wait a few days" },
  { value: "medium", label: "Medium", description: "Should be addressed soon" },
  { value: "high", label: "High", description: "Needs attention today" },
  { value: "critical", label: "Critical", description: "Emergency - immediate action needed" },
]

export function SubmitWorkOrderForm({ buildings, categories, user }: SubmitWorkOrderFormProps) {
  const [buildingId, setBuildingId] = useState("")
  const [specificLocation, setSpecificLocation] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [priority, setPriority] = useState<Priority>("medium")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Update priority when category changes based on default priority
  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId)
    const category = categories.find(c => c.id === catId)
    if (category) {
      setPriority(category.default_priority)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const category = categories.find(c => c.id === categoryId)
    const slaHours = category?.sla_hours ?? 48
    const dueDate = new Date()
    dueDate.setHours(dueDate.getHours() + slaHours)

    const { data, error: submitError } = await supabase
      .from("requests")
      .insert({
        requester_id: user.id,
        building_id: buildingId,
        specific_location: specificLocation,
        category_id: categoryId,
        priority,
        title,
        description,
        status: "pending",
        due_date: dueDate.toISOString(),
      })
      .select("order_number")
      .single()

    if (submitError) {
      setError(submitError.message)
      setLoading(false)
      return
    }

    setOrderNumber(data.order_number)
    setSuccess(true)
    setLoading(false)
  }

  if (success && orderNumber) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success">
            <CheckCircle className="h-6 w-6 text-success-foreground" />
          </div>
          <CardTitle className="text-2xl">Work Order Submitted</CardTitle>
          <CardDescription>
            Your request has been submitted successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="bg-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-1">Order Number</p>
            <p className="text-2xl font-bold text-primary">{orderNumber}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            You can track the status of your request on the My Orders page.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => {
              setSuccess(false)
              setOrderNumber(null)
              setBuildingId("")
              setSpecificLocation("")
              setCategoryId("")
              setPriority("medium")
              setTitle("")
              setDescription("")
            }}>
              Submit Another
            </Button>
            <Button onClick={() => router.push("/orders")}>
              View My Orders
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit Work Order</CardTitle>
        <CardDescription>
          Please provide detailed information about the maintenance issue you&apos;re reporting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Emergency Notice */}
        <div className="bg-destructive/5 border-l-4 border-destructive rounded-r-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Emergency?</p>
              <p className="text-sm text-muted-foreground">
                For immediate safety hazards (flooding, electrical hazards, security issues), call Campus Police at{" "}
                <span className="font-semibold text-destructive">(817) 272-3003</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="building">Building *</FieldLabel>
              <Select value={buildingId} onValueChange={setBuildingId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a building..." />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.name} ({building.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="location">Specific Location *</FieldLabel>
              <Input
                id="location"
                placeholder="e.g., 3rd Floor, Room 305"
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Issue Category *</FieldLabel>
              <Select value={categoryId} onValueChange={handleCategoryChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="priority">Priority Level *</FieldLabel>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label} - {opt.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="title">Issue Title *</FieldLabel>
              <Input
                id="title"
                placeholder="Brief description of the issue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">Detailed Description *</FieldLabel>
              <Textarea
                id="description"
                placeholder="Please provide as much detail as possible about the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </Field>
          </FieldGroup>

          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}

          <div className="mt-6">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Work Order"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
