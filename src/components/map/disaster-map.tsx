"use client"

import { useEffect, useState } from "react"
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Badge } from "@/components/ui/badge"
import { Loader2, Home, Users, MapPin, ShieldAlert } from "lucide-react"
import { MAP_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants"

type DisasterMapHousehold = {
  id: string
  houseNo: string | null
  latitude: number
  longitude: number
  purok: { id: string; name: string }
  residentCount: number
  riskLevel: string
  evacuatedAt: string | null
  evacuationCenterId: string | null
  evacuationCenterName: string | null
  hasPWD: boolean
  hasSenior: boolean
  hasPregnant: boolean
  hasInfant: boolean
  hasChronicIll: boolean
}

type DisasterMapEvacuationCenter = {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  capacity: number | null
  currentEvacuees: number
}

const RISK_COLORS: Record<string, string> = {
  HIGH: "#dc2626",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
  SAFE: "#6b7280",
}

const RISK_LABELS: Record<string, string> = {
  HIGH: "High Risk",
  MEDIUM: "Medium Risk",
  LOW: "Low Risk",
  SAFE: "Safe",
}

function getRiskColor(riskLevel: string): string {
  return RISK_COLORS[riskLevel] ?? "#6b7280"
}

export function DisasterMap() {
  const [households, setHouseholds] = useState<DisasterMapHousehold[]>([])
  const [evacuationCenters, setEvacuationCenters] = useState<
    DisasterMapEvacuationCenter[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/disaster/map")
      .then((res) => res.json())
      .then((data) => {
        setHouseholds(data.households ?? [])
        setEvacuationCenters(data.evacuationCenters ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-md border">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="font-medium text-muted-foreground">Legend:</span>
        <div className="flex flex-wrap gap-4">
          {Object.entries(RISK_LABELS).map(([level, label]) => (
            <div key={level} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getRiskColor(level) }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span>Evacuation center</span>
        </div>
        <div className="ml-auto text-muted-foreground">
          {households.length} profiled household
          {households.length !== 1 ? "s" : ""} · {evacuationCenters.length}{" "}
          evacuation center
          {evacuationCenters.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          style={{ height: "500px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {households.map((hh) => {
            const color = getRiskColor(hh.riskLevel)
            const isEvacuated = hh.evacuatedAt != null
            return (
              <CircleMarker
                key={hh.id}
                center={[hh.latitude, hh.longitude]}
                radius={isEvacuated ? 10 : 8}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: isEvacuated ? 0.9 : 0.7,
                  weight: isEvacuated ? 3 : 2,
                }}
              >
                <Popup>
                  <div className="min-w-[220px] space-y-2 p-1">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      <span className="font-semibold">
                        House #{hh.houseNo ?? "N/A"}
                      </span>
                      {isEvacuated && (
                        <Badge variant="secondary" className="text-xs">
                          Evacuated
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{hh.purok.name}</div>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3.5 w-3.5" />
                      {hh.residentCount} member
                      {hh.residentCount !== 1 ? "s" : ""}
                    </div>
                    <div>
                      <Badge
                        variant={
                          hh.riskLevel === "HIGH"
                            ? "destructive"
                            : hh.riskLevel === "MEDIUM"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {RISK_LABELS[hh.riskLevel] ?? hh.riskLevel}
                      </Badge>
                    </div>
                    {isEvacuated && hh.evacuationCenterName && (
                      <div className="flex items-start gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          At: {hh.evacuationCenterName}
                        </span>
                      </div>
                    )}
                    {(hh.hasPWD ||
                      hh.hasSenior ||
                      hh.hasPregnant ||
                      hh.hasInfant ||
                      hh.hasChronicIll) && (
                      <div className="flex flex-wrap gap-1 pt-1 border-t">
                        {hh.hasPWD && (
                          <Badge key="pwd" variant="outline" className="text-xs">
                            PWD
                          </Badge>
                        )}
                        {hh.hasSenior && (
                          <Badge key="senior" variant="outline" className="text-xs">
                            Senior
                          </Badge>
                        )}
                        {hh.hasPregnant && (
                          <Badge key="pregnant" variant="outline" className="text-xs">
                            Pregnant
                          </Badge>
                        )}
                        {hh.hasInfant && (
                          <Badge key="infant" variant="outline" className="text-xs">
                            Infant
                          </Badge>
                        )}
                        {hh.hasChronicIll && (
                          <Badge key="chronic" variant="outline" className="text-xs">
                            Chronic
                          </Badge>
                        )}
                      </div>
                    )}
                    <div>
                      <a
                        href={`/households/${hh.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View household →
                      </a>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}

          {evacuationCenters.map((ec) => (
            <CircleMarker
              key={ec.id}
              center={[ec.latitude, ec.longitude]}
              radius={12}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.8,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[220px] space-y-2 p-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold">{ec.name}</span>
                  </div>
                  <div className="text-sm text-gray-600 flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    {ec.address}
                  </div>
                  {ec.capacity != null && (
                    <p className="text-sm">
                      Capacity: {ec.capacity.toLocaleString()} persons
                    </p>
                  )}
                  <p className="text-sm font-medium">
                    Current evacuees: {ec.currentEvacuees}
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
