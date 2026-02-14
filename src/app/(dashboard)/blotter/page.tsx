import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { BlotterTable } from "@/components/blotter/blotter-table"
import { BlotterFilters } from "@/components/blotter/blotter-filters"
import { Prisma } from "@/generated/prisma/client"

interface Props {
  searchParams: Promise<{
    page?: string
    status?: string
    search?: string
  }>
}

export default async function BlotterPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const limit = 20

  const where: Prisma.BlotterWhereInput = {}
  if (params.status)
    where.status = params.status as Prisma.EnumBlotterStatusFilter["equals"]
  if (params.search) {
    where.OR = [
      { blotterNo: { contains: params.search, mode: "insensitive" } },
      { complainantName: { contains: params.search, mode: "insensitive" } },
      { respondentName: { contains: params.search, mode: "insensitive" } },
    ]
  }

  const [blotters, total] = await Promise.all([
    prisma.blotter.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        complainant: { select: { id: true, firstName: true, lastName: true, suffix: true, middleName: true } },
        respondent: { select: { id: true, firstName: true, lastName: true, suffix: true, middleName: true } },
        filedBy: { select: { id: true, name: true } },
        _count: { select: { hearings: true } },
      },
    }),
    prisma.blotter.count({ where }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Blotter / Complaints
          </h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} case{total !== 1 ? "s" : ""} on record
          </p>
        </div>
        <Button asChild>
          <Link href="/blotter/new">
            <Plus className="mr-2 h-4 w-4" />
            File Complaint
          </Link>
        </Button>
      </div>

      <BlotterFilters />

      <BlotterTable
        blotters={blotters}
        page={page}
        totalPages={Math.ceil(total / limit)}
        total={total}
      />
    </div>
  )
}
