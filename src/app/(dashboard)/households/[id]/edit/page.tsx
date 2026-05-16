import { notFound } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { assertHouseholdInTenant, getTenantBarangayIds, purokWhereForTenant } from "@/lib/tenant"
import { HouseholdForm } from "@/components/households/household-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditHouseholdPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []
  const { id } = await params

  if (!(await assertHouseholdInTenant(id, tenantIds))) {
    notFound()
  }

  const [household, puroks] = await Promise.all([
    prisma.household.findUnique({
      where: { id },
      select: {
        houseNo: true,
        streetSitio: true,
        purokId: true,
        latitude: true,
        longitude: true,
        housingType: true,
        roofMaterial: true,
        wallMaterial: true,
        toiletFacility: true,
        waterSource: true,
        is4PsBeneficiary: true,
        fourPsHouseholdId: true,
      },
    }),
    prisma.purok.findMany({
      where: purokWhereForTenant(tenantIds),
      orderBy: { order: "asc" },
    }),
  ])

  if (!household) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/households/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Household</h1>
          <p className="text-muted-foreground">
            Update household information and location.
          </p>
        </div>
      </div>

      <HouseholdForm
        puroks={puroks}
        householdId={id}
        defaultValues={{
          houseNo: household.houseNo,
          streetSitio: household.streetSitio,
          purokId: household.purokId,
          latitude: household.latitude,
          longitude: household.longitude,
          housingType: household.housingType,
          roofMaterial: household.roofMaterial,
          wallMaterial: household.wallMaterial,
          toiletFacility: household.toiletFacility,
          waterSource: household.waterSource,
          is4PsBeneficiary: household.is4PsBeneficiary,
          fourPsHouseholdId: household.fourPsHouseholdId,
        }}
      />
    </div>
  )
}
