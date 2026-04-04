import { ClientOnly } from "@/components/map/map-wrapper"
import { BarangayMap } from "@/components/map/barangay-map"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { tenantAreaPhraseFromSessionUser } from "@/lib/tenant-area-phrase"

export default async function MapPage() {
  const session = await getServerSession(authOptions)
  const area = tenantAreaPhraseFromSessionUser(session?.user ?? {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Barangay Map</h1>
        <p className="text-muted-foreground">
          Interactive map of household locations in {area}.
        </p>
      </div>

      <ClientOnly>
        <BarangayMap />
      </ClientOnly>
    </div>
  )
}
