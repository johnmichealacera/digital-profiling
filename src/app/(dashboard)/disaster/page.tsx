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
import { Loader2, Plus, ShieldAlert, MapPin, Users, AlertTriangle, Map, UserX, CheckCircle, UserPlus } from "lucide-react"
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

  async function fetchMissing() {
    const res = await fetch("/api/disaster/missing")
    if (res.ok) {
      const data = await res.json()
      setMissingPersons(data)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
      .then(() => fetchMissing())
      .finally(() => setLoading(false))
  }, [])

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

  async function handleReportMissing() {
    if (!selectedResidentId) return
    setReportingMissing(true)
    const res = await fetch("/api/disaster/missing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ residentId: selectedResidentId, notes: missingNotes || null }),
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
                                onValueChange={(val) => handleMarkEvacuated(p.id, val)}
                                value=""
                              >
                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                  <SelectValue placeholder="Mark evacuated..." />
                                </SelectTrigger>
                                <SelectContent>
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

      {/* Missing Persons */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Missing Persons</CardTitle>
          <Dialog open={missingDialogOpen} onOpenChange={setMissingDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <UserX className="mr-1 h-4 w-4" /> Report Missing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report person as missing</DialogTitle>
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
