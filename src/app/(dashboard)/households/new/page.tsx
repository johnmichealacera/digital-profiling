import { prisma } from "@/lib/prisma"
import { HouseholdForm } from "@/components/households/household-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTenantBarangayIds, purokWhereForTenant } from "@/lib/tenant"

export default async function NewHouseholdPage() {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []

  const puroks = await prisma.purok.findMany({
    where: purokWhereForTenant(tenantIds),
    orderBy: { order: "asc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Household</h1>
        <p className="text-muted-foreground">
          Register a new household in Barangay Taruc
        </p>
      </div>
      <HouseholdForm puroks={puroks} />
    </div>
  )
}
