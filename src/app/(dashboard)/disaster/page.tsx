"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, ShieldAlert, MapPin, Users, AlertTriangle, Map, UserX, CheckCircle, UserPlus, Calendar, Flag } from "lucide-react"
import { formatResidentName } from "@/lib/utils"

const DisasterMap = dynamic(
  () => import("@/components/map/disaster-map").then((m) => ({ default: m.DisasterMap })),
  { ssr: false }
)

type HouseholdProfile = {
  id: string
  riskLevel: string
  hazardTypes: string[]
  hasPWD: boolean
  hasSenior: boolean
  hasPregnant: boolean
  hasInfant: boolean
  hasChronicIll: boolean
  evacuatedAt?: string | null
  evacuationCenterId?: string | null
  evacuationCenter?: string | null
  emergencyContactName?: string | null
  emergencyContactNo?: string | null
  notes?: string | null
  household: {
    id: string
    houseNo: string | null
    purok: { name: string }
    _count: { residents: number }
  }
  evacuationCenterRef?: { id: string; name: string } | null
}

type EvacuationCenter = {
  id: string
  name: string
  address: string
  capacity?: number | null
  latitude?: number | null
  longitude?: number | null
  contactNo?: string | null
  facilities: string[]
  isActive: boolean
  currentEvacuees?: number
}

type Summary = {
  totalProfiles: number
  riskCounts: Record<string, number>
  vulnerableHouseholds: number
  evacuationCenters: number
  totalEvacuated?: number
  missingCount?: number
}

type MissingPerson = {
  id: string
  residentId: string
  residentName: string
  household: string | null
  reportedAt: string
  notes: string | null
  disasterEvent: { id: string; title: string; status: string } | null
}

type DisasterEventItem = {
  id: string
  title: string
  type: string | null
  status: string
  startedAt: string
  endedAt: string | null
  notes: string | null
  createdAt: string
  missingCount?: number
}

const RISK_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  HIGH: "destructive",
  MEDIUM: "secondary",
  LOW: "outline",
  SAFE: "default",
}

const RISK_LABELS: Record<string, string> = {
  HIGH: "High Risk",
  MEDIUM: "Medium Risk",
  LOW: "Low Risk",
  SAFE: "Safe",
}

export default function DisasterPage() {
  const [profiles, setProfiles] = useState<HouseholdProfile[]>([])
  const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenter[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([])
  const [loading, setLoading] = useState(true)

  // Disaster events ("__all__" = no event filter; Radix Select does not allow value="")
  const [events, setEvents] = useState<DisasterEventItem[]>([])
  const [activeEventId, setActiveEventId] = useState<string>("__all__")
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [eventTitle, setEventTitle] = useState("")
  const [eventType, setEventType] = useState("")
  const [eventStatus, setEventStatus] = useState("ACTIVE")
  const [eventStartedAt, setEventStartedAt] = useState("")
  const [eventEndedAt, setEventEndedAt] = useState("")
  const [eventNotes, setEventNotes] = useState("")
  const [eventSubmitting, setEventSubmitting] = useState(false)
  const [eventEditingId, setEventEditingId] = useState<string | null>(null)
  const [endingEventId, setEndingEventId] = useState<string | null>(null)

  // Evacuation center form
  const [evacDialogOpen, setEvacDialogOpen] = useState(false)
  const [evacName, setEvacName] = useState("")
  const [evacAddress, setEvacAddress] = useState("")
  const [evacCapacity, setEvacCapacity] = useState("")
  const [evacContact, setEvacContact] = useState("")
  const [evacLatitude, setEvacLatitude] = useState("")
  const [evacLongitude, setEvacLongitude] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Mark evacuated
  const [evacuatingProfileId, setEvacuatingProfileId] = useState<string | null>(null)

  // Add household to risk list
  const [addProfileDialogOpen, setAddProfileDialogOpen] = useState(false)
  const [addProfileSearchQuery, setAddProfileSearchQuery] = useState("")
  const [addProfileSearchResults, setAddProfileSearchResults] = useState<
    Array<{
      id: string
      firstName: string
      middleName?: string | null
      lastName: string
      suffix?: string | null
      householdId?: string | null
      household?: { id: string; houseNo: string | null; purok: { name: string } } | null
    }>
  >([])
  const [selectedResidentForProfile, setSelectedResidentForProfile] = useState<{
    id: string
    householdId: string
    displayName: string
    householdLabel: string
  } | null>(null)
  const [addProfileSubmitting, setAddProfileSubmitting] = useState(false)

  // Report missing
  const [missingDialogOpen, setMissingDialogOpen] = useState(false)
  const [missingSearchQuery, setMissingSearchQuery] = useState("")
  const [missingSearchResults, setMissingSearchResults] = useState<{ id: string; firstName: string; middleName?: string | null; lastName: string; suffix?: string | null; household?: { purok: { name: string } } | null }[]>([])
  const [selectedResidentId, setSelectedResidentId] = useState<string | null>(null)
  const [missingNotes, setMissingNotes] = useState("")
  const [reportingMissing, setReportingMissing] = useState(false)
  const [markingFoundId, setMarkingFoundId] = useState<string | null>(null)

  async function fetchData() {
    const res = await fetch("/api/disaster")
    if (!res.ok) {
      toast.error("Failed to load disaster data")
      return
    }
    const data = await res.json()
    setProfiles(data.profiles)
    setEvacuationCenters(data.evacuationCenters)
    setSummary(data.summary)
  }

  async function fetchEvents() {
    const res = await fetch("/api/disaster/events")
    if (res.ok) {
      const data = await res.json()
      setEvents(data)
    }
  }

  async function fetchMissing() {
    const url =
      activeEventId && activeEventId !== "__all__"
        ? `/api/disaster/missing?eventId=${encodeURIComponent(activeEventId)}`
        : "/api/disaster/missing"
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      setMissingPersons(data)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load
    fetchData()
      .then(() => fetchEvents())
      .then(() => fetchMissing())
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- refetch missing when event filter changes
      fetchMissing()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when activeEventId changes
  }, [activeEventId])

  async function handleAddCenter() {
    if (!evacName || !evacAddress) return
    setSubmitting(true)
    const lat = evacLatitude.trim() ? parseFloat(evacLatitude) : null
    const lng = evacLongitude.trim() ? parseFloat(evacLongitude) : null
    const res = await fetch("/api/disaster/evacuation-centers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: evacName,
        address: evacAddress,
        capacity: evacCapacity ? parseInt(evacCapacity) : null,
        contactNo: evacContact || null,
        latitude: lat,
        longitude: lng,
      }),
    })
    setSubmitting(false)
    if (!res.ok) {
      toast.error("Failed to add center")
      return
    }
    toast.success("Evacuation center added")
    setEvacDialogOpen(false)
    setEvacName("")
    setEvacAddress("")
    setEvacCapacity("")
    setEvacContact("")
    setEvacLatitude("")
    setEvacLongitude("")
    fetchData()
  }

  async function handleMarkEvacuated(profileId: string, evacuationCenterId: string | null) {
    setEvacuatingProfileId(profileId)
    const res = await fetch(`/api/disaster/profiles/${profileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evacuationCenterId }),
    })
    setEvacuatingProfileId(null)
    if (!res.ok) {
      toast.error("Failed to update evacuation status")
      return
    }
    toast.success(evacuationCenterId ? "Household marked as evacuated" : "Evacuation cleared")
    fetchData()
  }

  useEffect(() => {
    if (missingSearchQuery.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMissingSearchResults([])
      return
    }
    const t = setTimeout(() => {
      fetch(`/api/residents/search?q=${encodeURIComponent(missingSearchQuery)}`)
        .then((r) => r.json())
        .then(setMissingSearchResults)
    }, 300)
    return () => clearTimeout(t)
  }, [missingSearchQuery])

  useEffect(() => {
    if (addProfileSearchQuery.length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAddProfileSearchResults([])
      return
    }
    const t = setTimeout(() => {
      fetch(`/api/residents/search?q=${encodeURIComponent(addProfileSearchQuery)}`)
        .then((r) => r.json())
        .then(setAddProfileSearchResults)
    }, 300)
    return () => clearTimeout(t)
  }, [addProfileSearchQuery])

  async function handleAddProfile() {
    const householdId = selectedResidentForProfile?.householdId
    if (!householdId) return
    setAddProfileSubmitting(true)
    const res = await fetch("/api/disaster/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ householdId }),
    })
    const data = await res.json().catch(() => ({}))
    setAddProfileSubmitting(false)
    if (!res.ok) {
      toast.error(data.error ?? "Failed to add household to risk list")
      return
    }
    toast.success("Household added to risk list")
    setAddProfileDialogOpen(false)
    setAddProfileSearchQuery("")
    setAddProfileSearchResults([])
    setSelectedResidentForProfile(null)
    fetchData()
  }

  function openNewEventDialog() {
    setEventEditingId(null)
    setEventTitle("")
    setEventType("__none__")
    setEventStatus("ACTIVE")
    setEventStartedAt(new Date().toISOString().slice(0, 16))
    setEventEndedAt("")
    setEventNotes("")
    setEventDialogOpen(true)
  }

  function openEditEventDialog(ev: DisasterEventItem) {
    setEventEditingId(ev.id)
    setEventTitle(ev.title)
    setEventType(ev.type ?? "__none__")
    setEventStatus(ev.status)
    setEventStartedAt(ev.startedAt.slice(0, 16))
    setEventEndedAt(ev.endedAt?.slice(0, 16) ?? "")
    setEventNotes(ev.notes ?? "")
    setEventDialogOpen(true)
  }

  async function handleSaveEvent() {
    if (!eventTitle.trim()) return
    setEventSubmitting(true)
    const isEdit = !!eventEditingId
    const url = isEdit
      ? `/api/disaster/events/${eventEditingId}`
      : "/api/disaster/events"
    const typeValue =
      eventType && eventType !== "__none__" ? eventType.trim() : null
    const body: Record<string, unknown> = isEdit
      ? {
          title: eventTitle.trim(),
          type: typeValue,
          status: eventStatus,
          startedAt: eventStartedAt || new Date().toISOString(),
          endedAt: eventEndedAt.trim() ? eventEndedAt : null,
          notes: eventNotes.trim() || null,
        }
      : {
          title: eventTitle.trim(),
          type: typeValue,
          status: eventStatus,
          startedAt: eventStartedAt || new Date().toISOString(),
          notes: eventNotes.trim() || null,
        }
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    setEventSubmitting(false)
    if (!res.ok) {
      toast.error(data.error ?? "Failed to save event")
      return
    }
    toast.success(isEdit ? "Event updated" : "Event created")
    setEventDialogOpen(false)
    fetchEvents()
    if (!isEdit && eventStatus === "ACTIVE") setActiveEventId(data.id ?? "__all__")
  }

  async function handleEndEvent(eventId: string) {
    setEndingEventId(eventId)
    const res = await fetch(`/api/disaster/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ENDED", endedAt: new Date().toISOString() }),
    })
    setEndingEventId(null)
    if (!res.ok) {
      toast.error("Failed to end event")
      return
    }
    toast.success("Event ended")
    if (activeEventId === eventId) setActiveEventId("__all__")
    fetchEvents()
    fetchMissing()
  }

  async function handleReportMissing() {
    if (!selectedResidentId) return
    setReportingMissing(true)
    const res = await fetch("/api/disaster/missing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        residentId: selectedResidentId,
        disasterEventId: activeEventId && activeEventId !== "__all__" ? activeEventId : null,
        notes: missingNotes || null,
      }),
    })
    setReportingMissing(false)
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || "Failed to report missing")
      return
    }
    toast.success("Person reported as missing")
    setMissingDialogOpen(false)
    setSelectedResidentId(null)
    setMissingSearchQuery("")
    setMissingSearchResults([])
    setMissingNotes("")
    fetchMissing()
    fetchData()
  }

  async function handleMarkFound(id: string) {
    setMarkingFoundId(id)
    const res = await fetch(`/api/disaster/missing/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    setMarkingFoundId(null)
    if (!res.ok) {
      toast.error("Failed to mark as found")
      return
    }
    toast.success("Person marked as found")
    fetchMissing()
    fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Disaster Preparedness</h1>
        <p className="text-muted-foreground">
          Household risk assessment and evacuation center management
        </p>
      </div>

      {/* Disaster event (active) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Disaster event
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Create typhoons, floods, etc. and set an active event. Missing persons and filters are tied to the selected event.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={activeEventId}
              onValueChange={(v) => setActiveEventId(v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="All events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All events</SelectItem>
                {events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    <span className="flex items-center gap-2">
                      {ev.title}
                      {ev.type && (
                        <span className="text-muted-foreground text-xs">({ev.type})</span>
                      )}
                      <Badge variant={ev.status === "ACTIVE" ? "destructive" : "outline"} className="text-xs">
                        {ev.status}
                      </Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={openNewEventDialog}>
              <Flag className="mr-1 h-4 w-4" /> New event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No disaster events yet. Create one (e.g. typhoon) to track missing persons per event.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Ended</TableHead>
                    <TableHead>Missing</TableHead>
                    <TableHead className="w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((ev) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-medium">{ev.title}</TableCell>
                      <TableCell>{ev.type ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={ev.status === "ACTIVE" ? "destructive" : "outline"}>
                          {ev.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(ev.startedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {ev.endedAt ? new Date(ev.endedAt).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell>{ev.missingCount ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditEventDialog(ev)}
                          >
                            Edit
                          </Button>
                          {ev.status === "ACTIVE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEndEvent(ev.id)}
                              disabled={!!endingEventId}
                            >
                              {endingEventId === ev.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "End event"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profiled Households</p>
                <p className="text-xl font-bold">{summary.totalProfiles}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-xl font-bold">{summary.riskCounts.HIGH ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-100 p-3 dark:bg-amber-900">
                <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vulnerable Households</p>
                <p className="text-xl font-bold">{summary.vulnerableHouseholds}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <MapPin className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Evacuation Centers</p>
                <p className="text-xl font-bold">{summary.evacuationCenters}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Evacuated (current)</p>
                <p className="text-xl font-bold">{summary.totalEvacuated ?? 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                <UserX className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Missing</p>
                <p className="text-xl font-bold">{summary.missingCount ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Disaster Map - Socorro, Surigao del Norte (Barangay Taruc) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Disaster Preparedness Map
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Socorro, Surigao del Norte — Barangay Taruc. Household risk levels and evacuation centers.
          </p>
        </CardHeader>
        <CardContent>
          <DisasterMap />
        </CardContent>
      </Card>

      {/* Household Risk Profiles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Household Risk Profiles</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Add households to the risk list, then use &quot;Mark evacuated…&quot; to assign them to an evacuation center (evacuee count updates).
            </p>
          </div>
          <Button onClick={() => setAddProfileDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add household to risk list
          </Button>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">No disaster profiles yet</p>
              <p className="mb-4">Add a household by searching for a resident; their household will appear in the table. Then you can mark them as evacuated to a center.</p>
              <Button variant="outline" onClick={() => setAddProfileDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add household to risk list
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Household</TableHead>
                    <TableHead>Purok</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Vulnerabilities</TableHead>
                    <TableHead>Hazards</TableHead>
                    <TableHead>Evacuation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p) => {
                    const vulns = []
                    if (p.hasPWD) vulns.push("PWD")
                    if (p.hasSenior) vulns.push("Senior")
                    if (p.hasPregnant) vulns.push("Pregnant")
                    if (p.hasInfant) vulns.push("Infant")
                    if (p.hasChronicIll) vulns.push("Chronic Ill")
                    const isEvacuated = p.evacuatedAt != null
                    const centerName = p.evacuationCenterRef?.name ?? p.evacuationCenter ?? null
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono text-xs">
                          {p.household.houseNo ?? "N/A"}
                        </TableCell>
                        <TableCell>{p.household.purok.name}</TableCell>
                        <TableCell>{p.household._count.residents}</TableCell>
                        <TableCell>
                          <Badge variant={RISK_VARIANT[p.riskLevel] ?? "outline"}>
                            {RISK_LABELS[p.riskLevel] ?? p.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {vulns.length > 0 ? vulns.map((v) => (
                              <Badge key={v} variant="outline" className="text-xs">{v}</Badge>
                            )) : <span className="text-xs text-muted-foreground">None</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.hazardTypes.length > 0 ? p.hazardTypes.join(", ") : "—"}
                        </TableCell>
                        <TableCell>
                          {evacuatingProfileId === p.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : isEvacuated ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm">{centerName ?? "Evacuated"}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs"
                                onClick={() => handleMarkEvacuated(p.id, null)}
                              >
                                Clear
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Select
                                value={p.evacuationCenterId ?? "__none__"}
                                onValueChange={(val) =>
                                  handleMarkEvacuated(p.id, val === "__none__" ? null : val)
                                }
                              >
                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                  <SelectValue placeholder="Mark evacuated..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">Mark evacuated...</SelectItem>
                                  {evacuationCenters.map((ec) => (
                                    <SelectItem key={ec.id} value={ec.id}>
                                      {ec.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add household to risk list dialog */}
      <Dialog open={addProfileDialogOpen} onOpenChange={setAddProfileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add household to risk list</DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Search by resident name; their household will be added. Then use &quot;Mark evacuated…&quot; on the table to assign them to an evacuation center.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Search resident *</label>
              <Input
                placeholder="Type name to search..."
                value={addProfileSearchQuery}
                onChange={(e) => {
                  setAddProfileSearchQuery(e.target.value)
                  setSelectedResidentForProfile(null)
                }}
              />
              {addProfileSearchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-auto rounded border p-1">
                  {addProfileSearchResults.map((r) => {
                    const householdId = r.householdId ?? r.household?.id
                    const displayName = formatResidentName(r)
                    const houseNo = r.household?.houseNo ?? "—"
                    const purok = r.household?.purok?.name ?? "—"
                    const householdLabel = `House ${houseNo}, ${purok}`
                    return (
                      <button
                        key={r.id}
                        type="button"
                        className={`flex w-full flex-col items-start rounded px-2 py-1.5 text-left text-sm hover:bg-accent ${selectedResidentForProfile?.id === r.id ? "bg-accent" : ""}`}
                        onClick={() => {
                          if (!householdId) {
                            toast.error("This resident has no household")
                            return
                          }
                          setSelectedResidentForProfile({
                            id: r.id,
                            householdId,
                            displayName,
                            householdLabel,
                          })
                          setAddProfileSearchQuery(displayName)
                        }}
                      >
                        <span>{displayName}</span>
                        <span className="text-xs text-muted-foreground">{householdLabel}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            <Button
              onClick={handleAddProfile}
              disabled={!selectedResidentForProfile || addProfileSubmitting}
              className="w-full"
            >
              {addProfileSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add to risk list
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New / Edit disaster event dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{eventEditingId ? "Edit disaster event" : "New disaster event"}</DialogTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Create a typhoon, flood, or other event. Set status to ACTIVE to use it for reporting missing persons.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                placeholder="e.g. Typhoon Mario"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select
                value={eventType || "__none__"}
                onValueChange={setEventType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select type</SelectItem>
                  <SelectItem value="Typhoon">Typhoon</SelectItem>
                  <SelectItem value="Flood">Flood</SelectItem>
                  <SelectItem value="Earthquake">Earthquake</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={eventStatus} onValueChange={setEventStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="STANDDOWN">STANDDOWN</SelectItem>
                  <SelectItem value="DRILL">DRILL</SelectItem>
                  <SelectItem value="ENDED">ENDED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Started at *</label>
              <Input
                type="datetime-local"
                value={eventStartedAt}
                onChange={(e) => setEventStartedAt(e.target.value)}
              />
            </div>
            {eventEditingId && (
              <div>
                <label className="text-sm font-medium">Ended at (optional)</label>
                <Input
                  type="datetime-local"
                  value={eventEndedAt}
                  onChange={(e) => setEventEndedAt(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input
                placeholder="Details..."
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSaveEvent}
              disabled={!eventTitle.trim() || eventSubmitting}
              className="w-full"
            >
              {eventSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {eventEditingId ? "Update event" : "Create event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Missing Persons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Missing Persons</CardTitle>
            {activeEventId && activeEventId !== "__all__" && (
              <p className="text-sm text-muted-foreground mt-1">
                Showing missing for: {events.find((e) => e.id === activeEventId)?.title ?? "Selected event"}
              </p>
            )}
          </div>
          <Dialog open={missingDialogOpen} onOpenChange={setMissingDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserX className="mr-1 h-4 w-4" /> Report Missing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report person as missing</DialogTitle>
                <p className="text-sm text-muted-foreground font-normal">
                  {activeEventId && activeEventId !== "__all__"
                    ? `Linked to: ${events.find((e) => e.id === activeEventId)?.title ?? "selected event"}`
                    : "Select a disaster event above to link this report to that event."}
                </p>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium">Search resident *</label>
                  <Input
                    placeholder="Type name to search..."
                    value={missingSearchQuery}
                    onChange={(e) => {
                      setMissingSearchQuery(e.target.value)
                      setSelectedResidentId(null)
                    }}
                  />
                  {missingSearchResults.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-auto rounded border p-1">
                      {missingSearchResults.map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-accent ${selectedResidentId === r.id ? "bg-accent" : ""}`}
                          onClick={() => {
                            setSelectedResidentId(r.id)
                            setMissingSearchQuery(formatResidentName(r))
                          }}
                        >
                          {formatResidentName(r)}
                          {r.household?.purok.name && (
                            <span className="text-xs text-muted-foreground">{r.household.purok.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Input
                    placeholder="Last seen, contact..."
                    value={missingNotes}
                    onChange={(e) => setMissingNotes(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleReportMissing}
                  disabled={!selectedResidentId || reportingMissing}
                  className="w-full"
                >
                  {reportingMissing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Report as missing
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {missingPersons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No missing persons reported.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Household</TableHead>
                    <TableHead>Reported</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missingPersons.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.residentName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.household ?? "—"}</TableCell>
                      <TableCell className="text-sm">{new Date(m.reportedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => handleMarkFound(m.id)}
                          disabled={markingFoundId === m.id}
                        >
                          {markingFoundId === m.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" /> Found
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evacuation Centers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evacuation Centers</CardTitle>
          <Dialog open={evacDialogOpen} onOpenChange={setEvacDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-1 h-4 w-4" /> Add Center
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Evacuation Center</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input value={evacName} onChange={(e) => setEvacName(e.target.value)} placeholder="e.g. Taruc Elementary School" />
                </div>
                <div>
                  <label className="text-sm font-medium">Address *</label>
                  <Input value={evacAddress} onChange={(e) => setEvacAddress(e.target.value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Capacity (persons)</label>
                    <Input type="number" value={evacCapacity} onChange={(e) => setEvacCapacity(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Contact No.</label>
                    <Input value={evacContact} onChange={(e) => setEvacContact(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Latitude (map)</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 9.6215"
                      value={evacLatitude}
                      onChange={(e) => setEvacLatitude(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Longitude (map)</label>
                    <Input
                      type="number"
                      step="any"
                      placeholder="e.g. 125.9589"
                      value={evacLongitude}
                      onChange={(e) => setEvacLongitude(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Optional. Set latitude and longitude to show this center on the disaster preparedness map.
                </p>
                <Button onClick={handleAddCenter} disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Center
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {evacuationCenters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No evacuation centers.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {evacuationCenters.map((ec) => (
                <Card key={ec.id}>
                  <CardContent className="p-4 space-y-2">
                    <p className="font-semibold">{ec.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {ec.address}
                    </p>
                    {ec.latitude != null && ec.longitude != null && (
                      <p className="text-xs text-muted-foreground">
                        Coordinates: {ec.latitude.toFixed(5)}, {ec.longitude.toFixed(5)}
                      </p>
                    )}
                    {ec.capacity != null && (
                      <p className="text-sm">Capacity: {ec.capacity.toLocaleString()} persons</p>
                    )}
                    {(ec.currentEvacuees != null && ec.currentEvacuees > 0) && (
                      <p className="text-sm font-medium text-emerald-600">
                        Current evacuees: {ec.currentEvacuees}
                      </p>
                    )}
                    {ec.contactNo && (
                      <p className="text-xs text-muted-foreground">{ec.contactNo}</p>
                    )}
                    {ec.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ec.facilities.map((f) => (
                          <Badge key={f} variant="outline" className="text-xs">{f}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
