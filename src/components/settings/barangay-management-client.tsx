"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, Building2, Landmark } from "lucide-react"

type MunicipalityRow = {
  id: string
  name: string
  province: string
  region: string | null
  mapCenterLat: number | null
  mapCenterLng: number | null
  mapDefaultZoom: number
}

type BarangayRow = {
  id: string
  name: string
  province: string
  zipCode: string | null
  region: string | null
  code: string | null
  mapCenterLat: number | null
  mapCenterLng: number | null
  mapDefaultZoom: number
  municipality: MunicipalityRow
}

export function BarangayManagementClient() {
  const [municipalities, setMunicipalities] = useState<MunicipalityRow[]>([])
  const [barangays, setBarangays] = useState<BarangayRow[]>([])
  const [loading, setLoading] = useState(true)

  const [muniSubmitting, setMuniSubmitting] = useState(false)
  const [muniName, setMuniName] = useState("")
  const [muniProvince, setMuniProvince] = useState("")
  const [muniRegion, setMuniRegion] = useState("")
  const [muniLat, setMuniLat] = useState("")
  const [muniLng, setMuniLng] = useState("")
  const [muniZoom, setMuniZoom] = useState("15")

  const [brgySubmitting, setBrgySubmitting] = useState(false)
  const [brgyMunicipalityId, setBrgyMunicipalityId] = useState("")
  const [brgyName, setBrgyName] = useState("")
  const [brgyProvince, setBrgyProvince] = useState("")
  const [brgyZip, setBrgyZip] = useState("")
  const [brgyRegion, setBrgyRegion] = useState("")
  const [brgyCode, setBrgyCode] = useState("")
  const [brgyLat, setBrgyLat] = useState("")
  const [brgyLng, setBrgyLng] = useState("")
  const [brgyZoom, setBrgyZoom] = useState("15")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [mRes, bRes] = await Promise.all([
        fetch("/api/municipalities"),
        fetch("/api/barangays"),
      ])
      if (mRes.ok) setMunicipalities(await mRes.json())
      else toast.error("Could not load municipalities")
      if (bRes.ok) setBarangays(await bRes.json())
      else toast.error("Could not load barangays")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreateMunicipality(e: React.FormEvent) {
    e.preventDefault()
    setMuniSubmitting(true)
    const mLat = muniLat.trim() ? parseFloat(muniLat) : null
    const mLng = muniLng.trim() ? parseFloat(muniLng) : null
    const mZoom = muniZoom.trim() ? parseInt(muniZoom, 10) : undefined
    const res = await fetch("/api/municipalities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: muniName,
        province: muniProvince,
        region: muniRegion.trim() || null,
        mapCenterLat: mLat != null && !Number.isNaN(mLat) ? mLat : null,
        mapCenterLng: mLng != null && !Number.isNaN(mLng) ? mLng : null,
        mapDefaultZoom:
          mZoom != null && !Number.isNaN(mZoom) ? mZoom : undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setMuniSubmitting(false)
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Create failed")
      return
    }
    toast.success(`Municipality ${data.name} created`)
    setMuniName("")
    setMuniProvince("")
    setMuniRegion("")
    setMuniLat("")
    setMuniLng("")
    setMuniZoom("15")
    load()
    setBrgyMunicipalityId((id) => id || data.id)
  }

  async function handleCreateBarangay(e: React.FormEvent) {
    e.preventDefault()
    if (!brgyMunicipalityId) {
      toast.error("Select a municipality")
      return
    }
    setBrgySubmitting(true)
    const lat = brgyLat.trim() ? parseFloat(brgyLat) : null
    const lng = brgyLng.trim() ? parseFloat(brgyLng) : null
    const zoom = brgyZoom.trim() ? parseInt(brgyZoom, 10) : undefined
    const res = await fetch("/api/barangays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        municipalityId: brgyMunicipalityId,
        name: brgyName,
        province: brgyProvince.trim() || undefined,
        zipCode: brgyZip.trim() || null,
        region: brgyRegion.trim() || null,
        code: brgyCode.trim() || null,
        mapCenterLat: lat != null && !Number.isNaN(lat) ? lat : null,
        mapCenterLng: lng != null && !Number.isNaN(lng) ? lng : null,
        mapDefaultZoom: zoom != null && !Number.isNaN(zoom) ? zoom : undefined,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setBrgySubmitting(false)
    if (!res.ok) {
      toast.error(typeof data.error === "string" ? data.error : "Create failed")
      return
    }
    toast.success(`Barangay ${data.name} created (with default Purok 1)`)
    setBrgyName("")
    setBrgyProvince("")
    setBrgyZip("")
    setBrgyRegion("")
    setBrgyCode("")
    setBrgyLat("")
    setBrgyLng("")
    setBrgyZoom("15")
    load()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Landmark className="h-5 w-5" />
              New municipality
            </CardTitle>
            <CardDescription>
              Unique by <span className="font-medium">name + province</span>. Create
              this first if it does not exist yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateMunicipality} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="m-name">Municipality name</Label>
                <Input
                  id="m-name"
                  required
                  value={muniName}
                  onChange={(e) => setMuniName(e.target.value)}
                  placeholder="e.g. Socorro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-province">Province</Label>
                <Input
                  id="m-province"
                  required
                  value={muniProvince}
                  onChange={(e) => setMuniProvince(e.target.value)}
                  placeholder="e.g. Surigao del Norte"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-region">Region (optional)</Label>
                <Input
                  id="m-region"
                  value={muniRegion}
                  onChange={(e) => setMuniRegion(e.target.value)}
                  placeholder="e.g. Caraga Region (Region XIII)"
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Optional map defaults for municipal-level users (barangay
                accounts use each barangay&apos;s map center when set).
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="m-lat">Map latitude</Label>
                  <Input
                    id="m-lat"
                    type="number"
                    step="any"
                    value={muniLat}
                    onChange={(e) => setMuniLat(e.target.value)}
                    placeholder="e.g. 9.6215"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-lng">Map longitude</Label>
                  <Input
                    id="m-lng"
                    type="number"
                    step="any"
                    value={muniLng}
                    onChange={(e) => setMuniLng(e.target.value)}
                    placeholder="e.g. 125.9589"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m-zoom">Default zoom</Label>
                  <Input
                    id="m-zoom"
                    type="number"
                    min={1}
                    max={22}
                    value={muniZoom}
                    onChange={(e) => setMuniZoom(e.target.value)}
                    placeholder="15"
                  />
                </div>
              </div>
              <Button type="submit" disabled={muniSubmitting}>
                {muniSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create municipality
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              New barangay
            </CardTitle>
            <CardDescription>
              Linked to one municipality. Province and region default from the
              municipality unless you override them below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBarangay} className="space-y-4">
              <div className="space-y-2">
                <Label>Municipality</Label>
                <Select
                  value={brgyMunicipalityId}
                  onValueChange={setBrgyMunicipalityId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipalities.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}, {m.province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {municipalities.length === 0 && (
                  <p className="text-muted-foreground text-xs">
                    Create a municipality first.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-name">Barangay name</Label>
                <Input
                  id="b-name"
                  required
                  value={brgyName}
                  onChange={(e) => setBrgyName(e.target.value)}
                  placeholder="e.g. Taruc"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="b-province">Province (optional override)</Label>
                  <Input
                    id="b-province"
                    value={brgyProvince}
                    onChange={(e) => setBrgyProvince(e.target.value)}
                    placeholder="Uses municipality if empty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-zip">ZIP code (optional)</Label>
                  <Input
                    id="b-zip"
                    value={brgyZip}
                    onChange={(e) => setBrgyZip(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="b-region">Region (optional override)</Label>
                  <Input
                    id="b-region"
                    value={brgyRegion}
                    onChange={(e) => setBrgyRegion(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-code">Short code (optional)</Label>
                  <Input
                    id="b-code"
                    value={brgyCode}
                    onChange={(e) => setBrgyCode(e.target.value)}
                    placeholder="e.g. TRC"
                    maxLength={16}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="b-lat">Map latitude (optional)</Label>
                  <Input
                    id="b-lat"
                    type="number"
                    step="any"
                    value={brgyLat}
                    onChange={(e) => setBrgyLat(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-lng">Map longitude (optional)</Label>
                  <Input
                    id="b-lng"
                    type="number"
                    step="any"
                    value={brgyLng}
                    onChange={(e) => setBrgyLng(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="b-zoom">Default zoom</Label>
                  <Input
                    id="b-zoom"
                    type="number"
                    min={1}
                    max={22}
                    value={brgyZoom}
                    onChange={(e) => setBrgyZoom(e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" disabled={brgySubmitting || municipalities.length === 0}>
                {brgySubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Create barangay
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All barangays</CardTitle>
          <CardDescription>{barangays.length} barangay(s)</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:px-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barangay</TableHead>
                  <TableHead>Municipality</TableHead>
                  <TableHead>Province</TableHead>
                  <TableHead>Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barangays.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {b.municipality.name}
                    </TableCell>
                    <TableCell className="text-sm">{b.province}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {b.code ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {barangays.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No barangays yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
