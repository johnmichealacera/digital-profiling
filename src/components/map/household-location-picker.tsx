"use client"

import { useCallback, useMemo } from "react"
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMapEvents,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { MAP_CENTER, MAP_DEFAULT_ZOOM } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

function MapClickHandler({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export function HouseholdLocationPicker({
  latitude,
  longitude,
  onChange,
  onClear,
  /** Remount map when switching household (edit); keeps initial center correct. */
  mapInstanceKey = "new",
}: {
  latitude: number | null | undefined
  longitude: number | null | undefined
  onChange: (lat: number, lng: number) => void
  onClear: () => void
  mapInstanceKey?: string
}) {
  const position = useMemo(() => {
    const lat = latitude != null ? Number(latitude) : NaN
    const lng = longitude != null ? Number(longitude) : NaN
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return [lat, lng] as [number, number]
  }, [latitude, longitude])

  const center = position ?? MAP_CENTER

  const handleClick = useCallback(
    (lat: number, lng: number) => {
      onChange(Number(lat.toFixed(6)), Number(lng.toFixed(6)))
    },
    [onChange]
  )

  const hasPin = position != null

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Click on the map to set the household location. The latitude and longitude
        will be filled in automatically.
      </p>
      <div className="overflow-hidden rounded-md border">
        <MapContainer
          key={mapInstanceKey}
          center={center}
          zoom={MAP_DEFAULT_ZOOM}
          style={{ height: "320px", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onClick={handleClick} />
          {hasPin && (
            <CircleMarker
              center={position}
              radius={11}
              pathOptions={{
                fillColor: "#2563eb",
                color: "#1e40af",
                fillOpacity: 0.9,
                weight: 2,
              }}
            />
          )}
        </MapContainer>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {hasPin ? (
          <>
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm font-mono">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={onClear}>
              Clear location
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No location set yet.</p>
        )}
      </div>
    </div>
  )
}
