import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTenantBarangayIds, barangayIdFilter } from "@/lib/tenant"
import { AyudaForm } from "@/components/ayuda/ayuda-form"

export default async function EditAyudaPage({
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
  })
  if (!program) notFound()

  const barangayWhere =
    tenantIds === null
      ? undefined
      : tenantIds.length > 0
        ? { id: { in: tenantIds } }
        : { id: { in: [] as string[] } }

  const barangays = await prisma.barangay.findMany({
    where: barangayWhere,
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"

  const defaultValues = {
    ...program,
    totalBudget: program.totalBudget != null ? Number(program.totalBudget) : null,
    startDate: program.startDate
      ? program.startDate.toISOString().split("T")[0]
      : null,
    endDate: program.endDate ? program.endDate.toISOString().split("T")[0] : null,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Ayuda Program</h1>
        <p className="text-muted-foreground">Update program details</p>
      </div>
      <AyudaForm
        barangays={barangays}
        isSuperAdmin={isSuperAdmin}
        programId={id}
        defaultValues={defaultValues}
      />
    </div>
  )
}
