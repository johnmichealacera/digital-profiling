import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ResidentForm } from "@/components/residents/resident-form"
import { format } from "date-fns"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  assertResidentInTenant,
  getTenantBarangayIds,
  householdWhereForTenant,
  purokWhereForTenant,
} from "@/lib/tenant"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditResidentPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []
  const { id } = await params

  if (!(await assertResidentInTenant(id, tenantIds))) {
    notFound()
  }

  const [resident, puroks, households] = await Promise.all([
    prisma.resident.findUnique({ where: { id } }),
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

  if (!resident) notFound()

  const defaultValues = {
    ...resident,
    dateOfBirth: format(resident.dateOfBirth, "yyyy-MM-dd"),
    monthlyIncome: resident.monthlyIncome
      ? Number(resident.monthlyIncome)
      : null,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Resident</h1>
        <p className="text-muted-foreground">
          Update information for {resident.firstName} {resident.lastName}
        </p>
      </div>
      <ResidentForm
        puroks={puroks}
        households={households}
        defaultValues={defaultValues}
        residentId={id}
      />
    </div>
  )
}
