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
import { Loader2, Download, FileSpreadsheet, Users, Home } from "lucide-react"
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

export default function ReportsPage() {
  const [reportType, setReportType] = useState("population")
  const [data, setData] = useState<PopulationReport | HouseholdReport | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchReport(type: string) {
    setLoading(true)
    const res = await fetch(`/api/reports?type=${type}`)
    if (res.ok) setData(await res.json())
    else toast.error("Failed to load report")
    setLoading(false)
  }

  useEffect(() => {
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport("residents")}>
            <Download className="mr-2 h-4 w-4" /> Export Residents CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport("households")}>
            <Download className="mr-2 h-4 w-4" /> Export Households CSV
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
