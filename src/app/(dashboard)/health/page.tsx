import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { HealthRecordsList } from "@/components/health/health-records-list"
import { Loader2 } from "lucide-react"

export default async function HealthPage() {
  // Summary counts by category
  const categoryCounts = await prisma.healthRecord.groupBy({
    by: ["category"],
    where: { isActive: true },
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
