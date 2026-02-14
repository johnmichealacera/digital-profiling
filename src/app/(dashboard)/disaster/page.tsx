"use client"

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
import { Loader2, Plus, ShieldAlert, MapPin, Users, AlertTriangle } from "lucide-react"

type HouseholdProfile = {
  id: string
  riskLevel: string
  hazardTypes: string[]
  hasPWD: boolean
  hasSenior: boolean
  hasPregnant: boolean
  hasInfant: boolean
  hasChronicIll: boolean
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
}

type EvacuationCenter = {
  id: string
  name: string
  address: string
  capacity?: number | null
  contactNo?: string | null
  facilities: string[]
  isActive: boolean
}

type Summary = {
  totalProfiles: number
  riskCounts: Record<string, number>
  vulnerableHouseholds: number
  evacuationCenters: number
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
  const [loading, setLoading] = useState(true)

  // Evacuation center form
  const [evacDialogOpen, setEvacDialogOpen] = useState(false)
  const [evacName, setEvacName] = useState("")
  const [evacAddress, setEvacAddress] = useState("")
  const [evacCapacity, setEvacCapacity] = useState("")
  const [evacContact, setEvacContact] = useState("")
  const [submitting, setSubmitting] = useState(false)

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

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [])

  async function handleAddCenter() {
    if (!evacName || !evacAddress) return
    setSubmitting(true)
    const res = await fetch("/api/disaster/evacuation-centers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: evacName,
        address: evacAddress,
        capacity: evacCapacity ? parseInt(evacCapacity) : null,
        contactNo: evacContact || null,
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      )}

      {/* Household Risk Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Household Risk Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No disaster profiles yet.</p>
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
                      </TableRow>
                    )
                  })}
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
                    {ec.capacity && (
                      <p className="text-sm">Capacity: {ec.capacity.toLocaleString()} persons</p>
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
