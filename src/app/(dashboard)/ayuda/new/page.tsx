import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getTenantBarangayIds } from "@/lib/tenant"
import { prisma } from "@/lib/prisma"
import { AyudaForm } from "@/components/ayuda/ayuda-form"

export default async function NewAyudaPage() {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Ayuda Program</h1>
        <p className="text-muted-foreground">
          Create a new aid or assistance distribution program
        </p>
      </div>
      <AyudaForm barangays={barangays} isSuperAdmin={isSuperAdmin} />
    </div>
  )
}
