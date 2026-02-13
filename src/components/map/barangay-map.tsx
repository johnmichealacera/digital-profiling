"use client"

import { useEffect, useState } from "react"
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Loader2, Home, Users } from "lucide-react"
import Link from "next/link"
import { MAP_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants"
import type { MapHousehold } from "@/types"

// Color map for puroks
const PUROK_COLORS: Record<string, string> = {
  "Purok 1": "#3b82f6",
  "Purok 2": "#10b981",
  "Purok 3": "#f59e0b",
  "Purok 4": "#ef4444",
  "Purok 5": "#8b5cf6",
  "Purok 6": "#ec4899",
}

function getColor(purokName: string): string {
  return PUROK_COLORS[purokName] || "#6b7280"
}

export function BarangayMap() {
  const [households, setHouseholds] = useState<MapHousehold[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPurok, setSelectedPurok] = useState<string>("all")

  useEffect(() => {
    fetch("/api/map/households")
      .then((res) => res.json())
      .then((data) => {
        setHouseholds(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredHouseholds =
    selectedPurok === "all"
      ? households
      : households.filter((h) => h.purok.name === selectedPurok)

  const uniquePuroks = [
    ...new Set(households.map((h) => h.purok.name)),
  ].sort()

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center rounded-md border">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <Select value={selectedPurok} onValueChange={setSelectedPurok}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by purok" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Puroks</SelectItem>
            {uniquePuroks.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2">
          {uniquePuroks.map((name) => (
            <div key={name} className="flex items-center gap-1 text-xs">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getColor(name) }}
              />
              {name}
            </div>
          ))}
        </div>
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredHouseholds.length} household
          {filteredHouseholds.length !== 1 ? "s" : ""} on map
        </div>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-md border">
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_DEFAULT_ZOOM}
          style={{ height: "600px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredHouseholds.map((household) => (
            <CircleMarker
              key={household.id}
              center={[household.latitude, household.longitude]}
              radius={8}
              pathOptions={{
                color: getColor(household.purok.name),
                fillColor: getColor(household.purok.name),
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div className="min-w-[200px] space-y-2 p-1">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span className="font-semibold">
                      House #{household.houseNo ?? "N/A"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {household.purok.name}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-3.5 w-3.5" />
                    {household.residentCount} member
                    {household.residentCount !== 1 ? "s" : ""}
                  </div>
                  {household.headOfHousehold && (
                    <div className="text-sm">
                      <span className="text-gray-500">Head:</span>{" "}
                      {household.headOfHousehold}
                    </div>
                  )}
                  {household.is4PsBeneficiary && (
                    <span className="inline-block rounded bg-teal-100 px-2 py-0.5 text-xs text-teal-700">
                      4Ps Beneficiary
                    </span>
                  )}
                  <div>
                    <a
                      href={`/households/${household.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Details →
                    </a>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
