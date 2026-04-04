import { prisma } from "@/lib/prisma"
import { OfficialsDirectory } from "@/components/officials/officials-directory"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { barangayIdFilter, getTenantBarangayIds } from "@/lib/tenant"

export default async function OfficialsPage() {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []
  const bFilter = barangayIdFilter(tenantIds)

  const officials = await prisma.barangayOfficial.findMany({
    where: bFilter ? { barangayId: bFilter } : {},
    orderBy: [{ isIncumbent: "desc" }, { position: "asc" }, { lastName: "asc" }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Barangay Officials</h1>
        <p className="text-muted-foreground">
          Directory of current and past officials
        </p>
      </div>
      <OfficialsDirectory officials={JSON.parse(JSON.stringify(officials))} />
    </div>
  )
}
