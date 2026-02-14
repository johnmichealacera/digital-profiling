"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, CalendarDays, MapPin, Gavel, Plus } from "lucide-react"
import { formatResidentName, formatDate, formatShortDate } from "@/lib/utils"
import { BLOTTER_NATURE_LABELS, BLOTTER_STATUS_LABELS } from "@/lib/constants"

type BlotterDetail = {
  id: string
  blotterNo: string
  incidentDate: string
  incidentPlace: string
  nature: string
  natureDetails?: string | null
  narrative: string
  status: string
  resolution?: string | null
  complainantName?: string | null
  respondentName?: string | null
  witnesses: string[]
  createdAt: string
  resolvedAt?: string | null
  complainant: { firstName: string; middleName?: string | null; lastName: string; suffix?: string | null } | null
  respondent: { firstName: string; middleName?: string | null; lastName: string; suffix?: string | null } | null
  filedBy: { id: string; name: string } | null
  resolvedBy: { id: string; name: string } | null
  hearings: {
    id: string
    hearingDate: string
    venue: string
    notes?: string | null
    outcome?: string | null
  }[]
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  FILED: "outline",
  UNDER_MEDIATION: "secondary",
  SETTLED: "default",
  ESCALATED: "destructive",
  CLOSED: "default",
  WITHDRAWN: "secondary",
}

export default function BlotterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [blotter, setBlotter] = useState<BlotterDetail | null>(null)
  const [loading, setLoading] = useState(true)

  // Status update
  const [newStatus, setNewStatus] = useState("")
  const [resolution, setResolution] = useState("")
  const [updating, setUpdating] = useState(false)

  // Add hearing
  const [showHearingForm, setShowHearingForm] = useState(false)
  const [hearingDate, setHearingDate] = useState("")
  const [hearingVenue, setHearingVenue] = useState("Barangay Hall")
  const [hearingNotes, setHearingNotes] = useState("")
  const [addingHearing, setAddingHearing] = useState(false)

  async function fetchBlotter() {
    const res = await fetch(`/api/blotter/${id}`)
    if (!res.ok) {
      toast.error("Failed to load blotter record")
      return
    }
    const data = await res.json()
    setBlotter(data)
    setNewStatus(data.status)
    setResolution(data.resolution ?? "")
  }

  useEffect(() => {
    fetchBlotter().finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusUpdate() {
    if (!newStatus) return
    setUpdating(true)
    const res = await fetch(`/api/blotter/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, resolution: resolution || undefined }),
    })
    setUpdating(false)
    if (!res.ok) {
      toast.error("Failed to update status")
      return
    }
    toast.success("Status updated")
    const updated = await res.json()
    setBlotter(updated)
  }

  async function handleAddHearing() {
    if (!hearingDate) return
    setAddingHearing(true)
    const res = await fetch(`/api/blotter/${id}/hearings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hearingDate,
        venue: hearingVenue,
        notes: hearingNotes || undefined,
      }),
    })
    setAddingHearing(false)
    if (!res.ok) {
      toast.error("Failed to add hearing")
      return
    }
    toast.success("Hearing scheduled")
    setShowHearingForm(false)
    setHearingDate("")
    setHearingVenue("Barangay Hall")
    setHearingNotes("")
    fetchBlotter()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!blotter) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">Blotter record not found.</p>
      </div>
    )
  }

  const complainantDisplay = blotter.complainant
    ? formatResidentName(blotter.complainant)
    : blotter.complainantName ?? "N/A"
  const respondentDisplay = blotter.respondent
    ? formatResidentName(blotter.respondent)
    : blotter.respondentName ?? "N/A"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/blotter")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Case {blotter.blotterNo}
            </h1>
            <p className="text-muted-foreground">
              Filed {formatDate(blotter.createdAt)}
              {blotter.filedBy && ` by ${blotter.filedBy.name}`}
            </p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[blotter.status] ?? "outline"} className="text-sm px-3 py-1">
          {BLOTTER_STATUS_LABELS[blotter.status] ?? blotter.status}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - left 2 cols */}
        <div className="space-y-6 lg:col-span-2">
          {/* Incident Details */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date of Incident</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(blotter.incidentDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Place of Incident</p>
                    <p className="text-sm text-muted-foreground">{blotter.incidentPlace}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Gavel className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Nature</p>
                    <p className="text-sm text-muted-foreground">
                      {BLOTTER_NATURE_LABELS[blotter.nature] ?? blotter.nature}
                      {blotter.natureDetails && ` — ${blotter.natureDetails}`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle>Parties Involved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Complainant</p>
                  <p className="text-base font-semibold">{complainantDisplay}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Respondent</p>
                  <p className="text-base font-semibold">{respondentDisplay}</p>
                </div>
              </div>
              {blotter.witnesses.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Witnesses</p>
                    <ul className="list-disc list-inside text-sm">
                      {blotter.witnesses.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Narrative */}
          <Card>
            <CardHeader>
              <CardTitle>Incident Narrative</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{blotter.narrative}</p>
            </CardContent>
          </Card>

          {/* Resolution */}
          {blotter.resolution && (
            <Card>
              <CardHeader>
                <CardTitle>Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{blotter.resolution}</p>
                {blotter.resolvedAt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Resolved on {formatDate(blotter.resolvedAt)}
                    {blotter.resolvedBy && ` by ${blotter.resolvedBy.name}`}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Hearings Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Hearing Schedule</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHearingForm(!showHearingForm)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Hearing
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showHearingForm && (
                <div className="space-y-3 rounded-md border p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">Date & Time *</label>
                      <Input
                        type="datetime-local"
                        value={hearingDate}
                        onChange={(e) => setHearingDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Venue</label>
                      <Input
                        value={hearingVenue}
                        onChange={(e) => setHearingVenue(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      value={hearingNotes}
                      onChange={(e) => setHearingNotes(e.target.value)}
                      placeholder="Optional notes about this hearing..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" disabled={addingHearing || !hearingDate} onClick={handleAddHearing}>
                      {addingHearing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Schedule Hearing
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowHearingForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {blotter.hearings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hearings scheduled yet.</p>
              ) : (
                <div className="space-y-3">
                  {blotter.hearings.map((h, idx) => (
                    <div key={h.id} className="flex gap-4 rounded-md border p-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">
                          {formatShortDate(h.hearingDate)}
                        </p>
                        <p className="text-xs text-muted-foreground">{h.venue}</p>
                        {h.notes && <p className="mt-1 text-sm">{h.notes}</p>}
                        {h.outcome && (
                          <Badge variant="secondary" className="mt-1">
                            {h.outcome}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - right col */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BLOTTER_STATUS_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(newStatus === "SETTLED" || newStatus === "CLOSED") && (
                <div>
                  <label className="text-sm font-medium">Resolution</label>
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe how the case was resolved..."
                    className="min-h-[100px]"
                  />
                </div>
              )}

              <Button
                className="w-full"
                disabled={updating || newStatus === blotter.status}
                onClick={handleStatusUpdate}
              >
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Status
              </Button>
            </CardContent>
          </Card>

          {/* Case Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Case Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Case No.</span>
                <span className="font-mono">{blotter.blotterNo}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hearings</span>
                <span>{blotter.hearings.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date Filed</span>
                <span>{formatShortDate(blotter.createdAt)}</span>
              </div>
              {blotter.resolvedAt && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date Resolved</span>
                    <span>{formatShortDate(blotter.resolvedAt)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
