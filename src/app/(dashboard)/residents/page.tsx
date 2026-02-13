import { prisma } from "@/lib/prisma"
import { ResidentTable } from "@/components/residents/resident-table"
import { ResidentFilters } from "@/components/residents/resident-filters"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Prisma } from "@/generated/prisma/client"

interface Props {
  searchParams: Promise<{
    page?: string
    search?: string
    purokId?: string
    sex?: string
    isSeniorCitizen?: string
    isPwd?: string
    is4PsBeneficiary?: string
  }>
}

export default async function ResidentsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const limit = 20
  const search = params.search || ""
  const purokId = params.purokId || ""
  const sex = params.sex || ""

  const where: Prisma.ResidentWhereInput = {
    status: "ACTIVE",
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { middleName: { contains: search, mode: "insensitive" } },
    ]
  }

  if (purokId) where.household = { purokId }
  if (sex) where.sex = sex as Prisma.EnumSexFilter["equals"]
  if (params.isSeniorCitizen === "true") where.isSeniorCitizen = true
  if (params.isPwd === "true") where.isPwd = true
  if (params.is4PsBeneficiary === "true") where.is4PsBeneficiary = true

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
    prisma.purok.findMany({ orderBy: { order: "asc" } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Residents</h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} registered resident{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/residents/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Resident
          </Link>
        </Button>
      </div>

      <ResidentFilters puroks={puroks} />

      <ResidentTable
        residents={residents}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  )
}
