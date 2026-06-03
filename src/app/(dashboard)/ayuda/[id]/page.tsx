import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTenantBarangayIds, barangayIdFilter } from "@/lib/tenant"
import { canPerformAction } from "@/lib/permissions"
import type { UserRole } from "@/generated/prisma/client"
import { AyudaDetail } from "@/components/ayuda/ayuda-detail"

export const dynamic = "force-dynamic"

export default async function AyudaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []
  const bid = barangayIdFilter(tenantIds)
  const { id } = await params

  const program = await prisma.ayudaProgram.findFirst({
    where: { id, ...(bid ? { barangayId: bid } : {}) },
    include: {
      createdBy: { select: { id: true, name: true } },
      distributions: {
        orderBy: { createdAt: "asc" },
        include: {
          resident: {
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              suffix: true,
            },
          },
          encodedBy: { select: { id: true, name: true } },
        },
      },
    },
  })

  if (!program) notFound()

  const role = session?.user?.role as UserRole | undefined
  const canEdit = role ? canPerformAction(role, "ayuda", "update") : false
  const canDelete = role ? canPerformAction(role, "ayuda", "delete") : false
  const canManage = role ? canPerformAction(role, "ayuda", "create") : false

  type DistItem = (typeof program.distributions)[number]

  // Serialize Decimal fields before passing to Client Component
  const serialized = {
    ...program,
    totalBudget: program.totalBudget != null ? String(program.totalBudget) : null,
    distributions: program.distributions.map((d: DistItem) => ({
      ...d,
      amount: d.amount != null ? String(d.amount) : null,
      quantity: d.quantity != null ? String(d.quantity) : null,
    })),
  }

  return (
    <AyudaDetail
      program={serialized}
      canEdit={canEdit}
      canDelete={canDelete}
      canManage={canManage}
    />
  )
}
