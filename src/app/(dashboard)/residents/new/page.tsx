import { prisma } from "@/lib/prisma"
import { ResidentForm } from "@/components/residents/resident-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  getTenantBarangayIds,
  householdWhereForTenant,
  purokWhereForTenant,
} from "@/lib/tenant"
import { tenantAreaPhraseFromSessionUser } from "@/lib/tenant-area-phrase"
import type { Prisma } from "@/generated/prisma/client"

export default async function NewResidentPage() {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []

  const barangayWhere: Prisma.BarangayWhereInput | undefined =
    tenantIds === null
      ? undefined
      : tenantIds.length > 0
        ? { id: { in: tenantIds } }
        : { id: { in: [] } }

  const [barangayRows, puroks, households] = await Promise.all([
    prisma.barangay.findMany({
      where: barangayWhere,
      select: {
        id: true,
        name: true,
        municipality: { select: { name: true, province: true } },
      },
      orderBy: [{ municipality: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.purok.findMany({
      where: purokWhereForTenant(tenantIds),
      orderBy: [{ barangayId: "asc" }, { order: "asc" }],
    }),
    prisma.household.findMany({
      where: householdWhereForTenant(tenantIds),
      include: { purok: true },
      orderBy: [{ purok: { order: "asc" } }, { houseNo: "asc" }],
    }),
  ])

  const barangays = barangayRows.map((b) => ({
    id: b.id,
    name: b.name,
    municipalityName: b.municipality.name,
    province: b.municipality.province,
  }))

  const scopeDescription = tenantAreaPhraseFromSessionUser(session?.user ?? {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Resident</h1>
        <p className="text-muted-foreground">
          Register a new resident in {scopeDescription}.
        </p>
      </div>
      <ResidentForm
        barangays={barangays}
        puroks={puroks}
        households={households}
        scopeDescription={scopeDescription}
      />
    </div>
  )
}
