import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ResidentForm } from "@/components/residents/resident-form"
import { ResidentPhotoUpload } from "@/components/residents/resident-photo-upload"
import { format } from "date-fns"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import {
  assertResidentInTenant,
  getTenantBarangayIds,
  householdWhereForTenant,
  purokWhereForTenant,
} from "@/lib/tenant"
import { tenantAreaPhraseFromSessionUser } from "@/lib/tenant-area-phrase"
import type { Prisma } from "@/generated/prisma/client"
import { Card, CardContent } from "@/components/ui/card"

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

  const barangayWhere: Prisma.BarangayWhereInput | undefined =
    tenantIds === null
      ? undefined
      : tenantIds.length > 0
        ? { id: { in: tenantIds } }
        : { id: { in: [] } }

  const [resident, barangayRows, puroks, households] = await Promise.all([
    prisma.resident.findUnique({ where: { id } }),
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

  if (!resident) notFound()

  const defaultValues = {
    ...resident,
    dateOfBirth: format(resident.dateOfBirth, "yyyy-MM-dd"),
    monthlyIncome: resident.monthlyIncome
      ? Number(resident.monthlyIncome)
      : null,
  }

  const barangays = barangayRows.map((b) => ({
    id: b.id,
    name: b.name,
    municipalityName: b.municipality.name,
    province: b.municipality.province,
  }))

  const scopeDescription = tenantAreaPhraseFromSessionUser(session?.user ?? {})

  const initials =
    `${resident.firstName[0] ?? ""}${resident.lastName[0] ?? ""}`.toUpperCase()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Resident</h1>
        <p className="text-muted-foreground">
          Update information for {resident.firstName} {resident.lastName}
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 pt-6">
          <ResidentPhotoUpload
            residentId={id}
            residentName={`${resident.firstName} ${resident.lastName}`}
            initials={initials}
            photoUrl={resident.photoUrl ?? null}
          />
          <div>
            <p className="font-medium">
              {resident.firstName} {resident.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              Click the photo to upload or change the profile picture
            </p>
          </div>
        </CardContent>
      </Card>

      <ResidentForm
        barangays={barangays}
        puroks={puroks}
        households={households}
        scopeDescription={scopeDescription}
        defaultValues={defaultValues}
        residentId={id}
      />
    </div>
  )
}
