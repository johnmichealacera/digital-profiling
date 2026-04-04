import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ResidentProfile } from "@/components/residents/resident-profile"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { assertResidentInTenant, getTenantBarangayIds } from "@/lib/tenant"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ResidentDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions)
  const tenantIds = session ? await getTenantBarangayIds(session) : []
  const { id } = await params

  if (!(await assertResidentInTenant(id, tenantIds))) {
    notFound()
  }

  const resident = await prisma.resident.findUnique({
    where: { id },
    include: {
      household: { include: { purok: true } },
      documentRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      healthRecords: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!resident) notFound()

  return <ResidentProfile resident={resident} />
}
