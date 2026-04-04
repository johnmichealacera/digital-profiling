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

export default async function NewResidentPage() {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []

  const [puroks, households] = await Promise.all([
    prisma.purok.findMany({
      where: purokWhereForTenant(tenantIds),
      orderBy: { order: "asc" },
    }),
    prisma.household.findMany({
      where: householdWhereForTenant(tenantIds),
      include: { purok: true },
      orderBy: [{ purok: { order: "asc" } }, { houseNo: "asc" }],
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Resident</h1>
        <p className="text-muted-foreground">
          Register a new resident in {tenantAreaPhraseFromSessionUser(session?.user ?? {})}.
        </p>
      </div>
      <ResidentForm puroks={puroks} households={households} />
    </div>
  )
}
