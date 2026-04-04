import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { HealthRecordsList } from "@/components/health/health-records-list"
import { Loader2 } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { Prisma } from "@/generated/prisma/client"
import { getTenantBarangayIds, residentWhereForTenant } from "@/lib/tenant"

export default async function HealthPage() {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []
  const resFilter = residentWhereForTenant(tenantIds)
  const hrWhere: Prisma.HealthRecordWhereInput = {
    isActive: true,
    ...(Object.keys(resFilter).length > 0
      ? { resident: { is: resFilter } }
      : {}),
  }

  const categoryCounts = await prisma.healthRecord.groupBy({
    by: ["category"],
    where: hrWhere,
    _count: true,
  })

  const summary = Object.fromEntries(
    categoryCounts.map((c) => [c.category, c._count])
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Health Records</h1>
        <p className="text-muted-foreground">
          Track health monitoring for residents
        </p>
      </div>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <HealthRecordsList summary={summary} />
      </Suspense>
    </div>
  )
}
