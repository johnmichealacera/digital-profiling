import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { DocumentTable } from "@/components/documents/document-table"
import { DocumentFilters } from "@/components/documents/document-filters"
import { Prisma } from "@/generated/prisma/client"

interface Props {
  searchParams: Promise<{
    page?: string
    status?: string
    documentType?: string
    search?: string
  }>
}

export default async function DocumentsPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const limit = 20

  const where: Prisma.DocumentRequestWhereInput = {}
  if (params.status)
    where.status = params.status as Prisma.EnumDocumentStatusFilter["equals"]
  if (params.documentType)
    where.documentType = params.documentType as Prisma.EnumDocumentTypeFilter["equals"]
  if (params.search) {
    where.OR = [
      { controlNo: { contains: params.search, mode: "insensitive" } },
      {
        resident: {
          firstName: { contains: params.search, mode: "insensitive" },
        },
      },
      {
        resident: {
          lastName: { contains: params.search, mode: "insensitive" },
        },
      },
    ]
  }

  const [documents, total] = await Promise.all([
    prisma.documentRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        resident: true,
        encodedBy: { select: { id: true, name: true } },
        issuedBy: { select: { id: true, name: true } },
      },
    }),
    prisma.documentRequest.count({ where }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            {total.toLocaleString()} document request
            {total !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/documents/new">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </div>

      <DocumentFilters />

      <DocumentTable
        documents={documents}
        page={page}
        totalPages={totalPages}
        total={total}
      />
    </div>
  )
}
