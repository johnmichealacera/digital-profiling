"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import {
  AYUDA_TYPE_LABELS,
  AYUDA_STATUS_LABELS,
  AYUDA_SOURCE_LABELS,
} from "@/lib/constants"

interface Props {
  barangays: { id: string; name: string }[]
  isSuperAdmin: boolean
  programId?: string
  defaultValues?: {
    name?: string
    type?: string
    source?: string
    description?: string | null
    totalBudget?: number | null
    status?: string
    startDate?: string | null
    endDate?: string | null
    barangayId?: string
  }
}

export function AyudaForm({
  barangays,
  isSuperAdmin,
  programId,
  defaultValues,
}: Props) {
  const router = useRouter()
  const isEditing = !!programId
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    name: defaultValues?.name ?? "",
    type: defaultValues?.type ?? "CASH",
    source: defaultValues?.source ?? "BARANGAY_FUND",
    description: defaultValues?.description ?? "",
    totalBudget:
      defaultValues?.totalBudget != null
        ? String(defaultValues.totalBudget)
        : "",
    status: defaultValues?.status ?? "PLANNED",
    startDate: defaultValues?.startDate ?? "",
    endDate: defaultValues?.endDate ?? "",
    barangayId:
      defaultValues?.barangayId ?? (barangays[0]?.id ?? ""),
  })

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const body = {
      ...form,
      totalBudget: form.totalBudget ? Number(form.totalBudget) : null,
      description: form.description || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    }
    try {
      const res = await fetch(
        isEditing ? `/api/ayuda/${programId}` : "/api/ayuda",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || "Failed to save program")
        return
      }
      toast.success(isEditing ? "Program updated" : "Program created")
      router.push(isEditing ? `/ayuda/${programId}` : `/ayuda/${data.id}`)
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
          {/* Name */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="name">Program Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. SAP 2025, Christmas Food Pack"
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label>Ayuda Type *</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AYUDA_TYPE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Source */}
          <div className="space-y-1.5">
            <Label>Fund Source *</Label>
            <Select value={form.source} onValueChange={(v) => set("source", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AYUDA_SOURCE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label>Status *</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AYUDA_STATUS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <Label htmlFor="totalBudget">Total Budget / Value (&#8369;)</Label>
            <Input
              id="totalBudget"
              type="number"
              min="0"
              step="0.01"
              value={form.totalBudget}
              onChange={(e) => set("totalBudget", e.target.value)}
              placeholder="Optional"
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </div>

          {/* Barangay (Super Admin only) */}
          {isSuperAdmin && (
            <div className="space-y-1.5">
              <Label>Barangay *</Label>
              <Select
                value={form.barangayId}
                onValueChange={(v) => set("barangayId", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {barangays.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Program details, target beneficiaries, conditions..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="sm:col-span-2 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Program"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
