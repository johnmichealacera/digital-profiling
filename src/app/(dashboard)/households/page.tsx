import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { HouseholdList } from "@/components/households/household-list"
import { Prisma } from "@/generated/prisma/client"

interface Props {
  searchParams: Promise<{ page?: string; purokId?: string; search?: string }>
}

export default async function HouseholdsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const limit = 20
  const purokId = params.purokId || ""
  const search = params.search || ""

  const where: Prisma.HouseholdWhereInput = {}
  if (purokId) where.purokId = purokId
  if (search) {
    where.OR = [
      { houseNo: { contains: search, mode: "insensitive" } },
      { streetSitio: { contains: search, mode: "insensitive" } },
    ]
  }

  const [households, total, puroks] = await Promise.all([
    prisma.household.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ purok: { order: "asc" } }, { houseNo: "asc" }],
      include: {
        purok: true,
        residents: {
          where: { status: "ACTIVE" },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            suffix: true,
            isHouseholdHead: true,
          },
          orderBy: { isHouseholdHead: "desc" },
        },
        _count: { select: { residents: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.household.count({ where }),
    prisma.purok.findMany({ orderBy: { order: "asc" } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Households</h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} registered household{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/households/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Household
          </Link>
        </Button>
      </div>

      <HouseholdList
        households={households}
        puroks={puroks}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  )
}
