import { ClientOnly } from "@/components/map/map-wrapper"
import { BarangayMap } from "@/components/map/barangay-map"
import { Skeleton } from "@/components/ui/skeleton"

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Barangay Map</h1>
        <p className="text-muted-foreground">
          Interactive map showing household locations in Barangay Taruc
        </p>
      </div>

      <ClientOnly>
        <BarangayMap />
      </ClientOnly>
    </div>
  )
}
