import { prisma } from "@/lib/prisma"
import { OfficialsDirectory } from "@/components/officials/officials-directory"

export default async function OfficialsPage() {
  const officials = await prisma.barangayOfficial.findMany({
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
