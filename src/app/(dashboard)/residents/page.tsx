import { prisma } from "@/lib/prisma"
import { ResidentTable } from "@/components/residents/resident-table"
import { ResidentFilters } from "@/components/residents/resident-filters"
import { ResidentImportDialog } from "@/components/residents/resident-import-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Prisma } from "@/generated/prisma/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { canPerformAction } from "@/lib/permissions"
import { serializeResidentsForClient } from "@/lib/serialize-resident"
import { getTenantBarangayIds, residentWhereForTenant } from "@/lib/tenant"

interface Props {
  searchParams: Promise<{
    page?: string
    search?: string
    purokId?: string
    sex?: string
    status?: string
    isSeniorCitizen?: string
    isPwd?: string
    is4PsBeneficiary?: string
  }>
}

export default async function ResidentsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  const canImportResidents =
    session?.user?.role != null &&
    canPerformAction(session.user.role, "residents", "create")
  const canBulkDeleteResidents =
    session?.user?.role != null &&
    canPerformAction(session.user.role, "residents", "delete")
  const canUpdateResidents =
    session?.user?.role != null &&
    canPerformAction(session.user.role, "residents", "update")

  const tenantIds = session ? await getTenantBarangayIds(session) : []

  const params = await searchParams
  const page = parseInt(params.page || "1")
  const limit = 20
  const search = params.search || ""
  const purokId = params.purokId || ""
  const sex = params.sex || ""
  const status = params.status || "ACTIVE"

  const andConditions: Prisma.ResidentWhereInput[] = []

  if (search) {
    andConditions.push({
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { middleName: { contains: search, mode: "insensitive" } },
      ],
    })
  }

  if (purokId) {
    // Verify the purokId is within the tenant's scope, then filter by it directly.
    const purokValid =
      tenantIds === null ||
      (tenantIds.length > 0 &&
        (await prisma.purok.findFirst({
          where: {
            id: purokId,
            ...(tenantIds.length === 1
              ? { barangayId: tenantIds[0]! }
              : { barangayId: { in: tenantIds } }),
          },
          select: { id: true },
        })) !== null)
    andConditions.push(purokValid ? { household: { purokId } } : { id: { in: [] } })
  } else if (tenantIds !== null) {
    andConditions.push(residentWhereForTenant(tenantIds))
  }

  if (sex) andConditions.push({ sex: sex as Prisma.EnumSexFilter["equals"] })
  if (params.isSeniorCitizen === "true") andConditions.push({ isSeniorCitizen: true })
  if (params.isPwd === "true") andConditions.push({ isPwd: true })
  if (params.is4PsBeneficiary === "true") andConditions.push({ is4PsBeneficiary: true })

  const where: Prisma.ResidentWhereInput = {
    status: status as Prisma.EnumResidentStatusFilter["equals"],
    ...(andConditions.length > 0 ? { AND: andConditions } : {}),
  }

  const purokWhere =
    tenantIds === null
      ? {}
      : tenantIds.length === 1
        ? { barangayId: tenantIds[0]! }
        : { barangayId: { in: tenantIds } }

  const [residents, total, puroks] = await Promise.all([
    prisma.resident.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        household: { include: { purok: true } },
      },
    }),
    prisma.resident.count({ where }),
    prisma.purok.findMany({
      where: purokWhere,
      orderBy: { order: "asc" },
    }),
  ])

  const totalPages = Math.ceil(total / limit)
  const residentsForTable = serializeResidentsForClient(residents)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Residents</h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} registered resident{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canImportResidents && <ResidentImportDialog />}
          <Button asChild>
            <Link href="/residents/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Resident
            </Link>
          </Button>
        </div>
      </div>

      <ResidentFilters puroks={puroks} />

      <ResidentTable
        residents={residentsForTable}
        page={page}
        totalPages={totalPages}
        total={total}
        canBulkDelete={canBulkDeleteResidents}
        canUpdate={canUpdateResidents}
      />
    </div>
  )
}
