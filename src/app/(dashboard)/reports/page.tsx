"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Download, ShieldAlert, MapPin, UserX } from "lucide-react"
import {
  CIVIL_STATUS_LABELS,
  SEX_LABELS,
  EDUCATION_LABELS,
  EMPLOYMENT_LABELS,
} from "@/lib/constants"

type PopulationReport = {
  type: "population"
  total: number
  bySex: Record<string, number>
  byCivilStatus: Record<string, number>
  byPurok: Record<string, number>
  byEducation: Record<string, number>
  byEmployment: Record<string, number>
  classifications: {
    voters: number
    seniorCitizens: number
    pwd: number
    soloParents: number
    fourPs: number
    minors: number
  }
}

type HouseholdReport = {
  type: "households"
  total: number
  fourPsHouseholds: number
  byPurok: Record<string, { count: number; members: number }>
}

type DisasterReport = {
  type: "disaster"
  summary: {
    totalProfiles: number
    riskCounts: Record<string, number>
    vulnerableHouseholds: number
    evacuationCenters: number
    totalEvacuated: number
    missingCount: number
  }
  profiles: Array<{
    id: string
    riskLevel: string
    hazardTypes: string[]
    hasPWD: boolean
    hasSenior: boolean
    hasPregnant: boolean
    hasInfant: boolean
    hasChronicIll: boolean
    evacuatedAt: string | null
    evacuationCenter?: string | null
    emergencyContactName?: string | null
    emergencyContactNo?: string | null
    notes?: string | null
    household: {
      houseNo: string | null
      purok: { name: string }
      _count: { residents: number }
    }
    evacuationCenterRef?: { name: string } | null
  }>
  evacuationCenters: Array<{
    id: string
    name: string
    address: string
    capacity: number | null
    latitude: number | null
    longitude: number | null
    contactNo: string | null
    facilities: string[]
    currentEvacuees: number
  }>
  missingPersons: Array<{
    id: string
    residentName: string
    household: string | null
    reportedAt: string
    notes: string | null
  }>
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("population")
  const [data, setData] = useState<PopulationReport | HouseholdReport | DisasterReport | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchReport(type: string) {
    setLoading(true)
    const res = await fetch(`/api/reports?type=${type}`)
    if (res.ok) setData(await res.json())
    else toast.error("Failed to load report")
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReport(reportType)
  }, [reportType])

  async function handleExport(type: string) {
    const link = document.createElement("a")
    link.href = `/api/reports/export?type=${type}`
    link.click()
    toast.success("Export started")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Data Export</h1>
          <p className="text-muted-foreground">
            Generate reports and export barangay data
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => handleExport("residents")}>
            <Download className="mr-2 h-4 w-4" /> Export Residents CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("households")}>
            <Download className="mr-2 h-4 w-4" /> Export Households CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("disaster-profiles")}>
            <ShieldAlert className="mr-2 h-4 w-4" /> Export Disaster Profiles CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("disaster-evacuation-centers")}>
            <MapPin className="mr-2 h-4 w-4" /> Export Evacuation Centers CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("disaster-missing")}>
            <UserX className="mr-2 h-4 w-4" /> Export Missing Persons CSV
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="population">Population Report</SelectItem>
            <SelectItem value="households">Household Report</SelectItem>
            <SelectItem value="disaster">Disaster Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data?.type === "population" ? (
        <PopulationReportView data={data} />
      ) : data?.type === "households" ? (
        <HouseholdReportView data={data} />
      ) : data?.type === "disaster" ? (
        <DisasterReportView data={data} />
      ) : null}
    </div>
  )
}

function PopulationReportView({ data }: { data: PopulationReport }) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Population</p>
            <p className="text-2xl font-bold">{data.total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Registered Voters</p>
            <p className="text-2xl font-bold">{data.classifications.voters.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Senior Citizens</p>
            <p className="text-2xl font-bold">{data.classifications.seniorCitizens}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">PWD</p>
            <p className="text-2xl font-bold">{data.classifications.pwd}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Solo Parents</p>
            <p className="text-2xl font-bold">{data.classifications.soloParents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">4Ps Members</p>
            <p className="text-2xl font-bold">{data.classifications.fourPs}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* By Sex */}
        <Card>
          <CardHeader><CardTitle>By Sex</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sex</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.bySex).map(([key, count]) => (
                  <TableRow key={key}>
                    <TableCell>{SEX_LABELS[key] ?? key}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                    <TableCell className="text-right">
                      {data.total > 0 ? ((count / data.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* By Civil Status */}
        <Card>
          <CardHeader><CardTitle>By Civil Status</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.byCivilStatus).map(([key, count]) => (
                  <TableRow key={key}>
                    <TableCell>{CIVIL_STATUS_LABELS[key] ?? key}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                    <TableCell className="text-right">
                      {data.total > 0 ? ((count / data.total) * 100).toFixed(1) : 0}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* By Purok */}
        <Card>
          <CardHeader><CardTitle>By Purok</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Purok</TableHead>
                  <TableHead className="text-right">Population</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.byPurok)
                  .sort(([, a], [, b]) => b - a)
                  .map(([name, count]) => (
                    <TableRow key={name}>
                      <TableCell>{name}</TableCell>
                      <TableCell className="text-right">{count}</TableCell>
                      <TableCell className="text-right">
                        {data.total > 0 ? ((count / data.total) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* By Education */}
        <Card>
          <CardHeader><CardTitle>By Educational Attainment</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Education</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.byEducation).map(([key, count]) => (
                  <TableRow key={key}>
                    <TableCell>{EDUCATION_LABELS[key] ?? key}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* By Employment */}
        <Card>
          <CardHeader><CardTitle>By Employment Status</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(data.byEmployment).map(([key, count]) => (
                  <TableRow key={key}>
                    <TableCell>{EMPLOYMENT_LABELS[key] ?? key}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function HouseholdReportView({ data }: { data: HouseholdReport }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Households</p>
            <p className="text-2xl font-bold">{data.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">4Ps Households</p>
            <p className="text-2xl font-bold">{data.fourPsHouseholds}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Avg Members/Household</p>
            <p className="text-2xl font-bold">
              {data.total > 0
                ? (
                    Object.values(data.byPurok).reduce((s, p) => s + p.members, 0) / data.total
                  ).toFixed(1)
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Households by Purok</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Purok</TableHead>
                <TableHead className="text-right">Households</TableHead>
                <TableHead className="text-right">Members</TableHead>
                <TableHead className="text-right">Avg Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(data.byPurok)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([name, { count, members }]) => (
                  <TableRow key={name}>
                    <TableCell>{name}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                    <TableCell className="text-right">{members}</TableCell>
                    <TableCell className="text-right">
                      {count > 0 ? (members / count).toFixed(1) : 0}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

const RISK_LABELS: Record<string, string> = {
  HIGH: "High Risk",
  MEDIUM: "Medium Risk",
  LOW: "Low Risk",
  SAFE: "Safe",
}

function DisasterReportView({ data }: { data: DisasterReport }) {
  const s = data.summary
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Profiled Households</p>
            <p className="text-2xl font-bold">{s.totalProfiles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">High Risk</p>
            <p className="text-2xl font-bold">{s.riskCounts.HIGH ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Vulnerable Households</p>
            <p className="text-2xl font-bold">{s.vulnerableHouseholds}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Evacuation Centers</p>
            <p className="text-2xl font-bold">{s.evacuationCenters}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Evacuated (current)</p>
            <p className="text-2xl font-bold">{s.totalEvacuated}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Missing</p>
            <p className="text-2xl font-bold">{s.missingCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Household Risk Profiles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Export via &quot;Export Disaster Profiles CSV&quot; above
          </p>
        </CardHeader>
        <CardContent>
          {data.profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No disaster profiles recorded.</p>
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
                    <TableHead>Evacuated</TableHead>
                    <TableHead>Evacuation Center</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.profiles.map((p) => {
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
                          <Badge variant={p.riskLevel === "HIGH" ? "destructive" : "outline"}>
                            {RISK_LABELS[p.riskLevel] ?? p.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {vulns.length > 0 ? vulns.join(", ") : "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {p.hazardTypes?.length ? p.hazardTypes.join(", ") : "—"}
                        </TableCell>
                        <TableCell>{p.evacuatedAt ? "Yes" : "No"}</TableCell>
                        <TableCell className="text-sm">
                          {p.evacuationCenterRef?.name ?? p.evacuationCenter ?? "—"}
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

      <Card>
        <CardHeader>
          <CardTitle>Evacuation Centers</CardTitle>
          <p className="text-sm text-muted-foreground">
            Export via &quot;Export Evacuation Centers CSV&quot; above
          </p>
        </CardHeader>
        <CardContent>
          {data.evacuationCenters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No evacuation centers.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                    <TableHead className="text-right">Current Evacuees</TableHead>
                    <TableHead>Coordinates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.evacuationCenters.map((ec) => (
                    <TableRow key={ec.id}>
                      <TableCell className="font-medium">{ec.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ec.address}</TableCell>
                      <TableCell className="text-right">{ec.capacity ?? "—"}</TableCell>
                      <TableCell className="text-right">{ec.currentEvacuees}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {ec.latitude != null && ec.longitude != null
                          ? `${ec.latitude.toFixed(5)}, ${ec.longitude.toFixed(5)}`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Missing Persons</CardTitle>
          <p className="text-sm text-muted-foreground">
            Export via &quot;Export Missing Persons CSV&quot; above
          </p>
        </CardHeader>
        <CardContent>
          {data.missingPersons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No missing persons reported.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Household</TableHead>
                    <TableHead>Reported At</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.missingPersons.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.residentName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.household ?? "—"}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(m.reportedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{m.notes ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
